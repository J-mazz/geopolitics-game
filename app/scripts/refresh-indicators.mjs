#!/usr/bin/env node
// Refresh indicator values from Yahoo Finance's public chart endpoint.
//
// Reads:  src/data/json/nodes.json  (to discover indicators + their tickers)
//         src/data/json/indicators.json  (to merge into)
// Writes: src/data/json/indicators.json  (in place; only ticker'd indicators
//         change; manual ones like I_CHIPIDX and I_WEALTH are preserved)
//
// Run: `npm run refresh:indicators` from the app/ directory.
//
// Failure mode: any ticker that errors is skipped with a warning. The existing
// value is preserved. The script exits 0 unless ALL fetches fail (then 1).

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(__dirname, '..', 'src', 'data', 'json')
const NODES_PATH = resolve(DATA_DIR, 'nodes.json')
const INDICATORS_PATH = resolve(DATA_DIR, 'indicators.json')

// Yahoo's unofficial chart endpoint. 1y of daily closes is enough for
// current value, YTD change, and 1Y change.
const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart'

const UA = 'Mozilla/5.0 (compatible; geopolitics-game/refresh-indicators)'

async function fetchChart(ticker) {
  const url = `${YAHOO_BASE}/${encodeURIComponent(ticker)}?interval=1d&range=1y`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${ticker}`)
  const json = await res.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error(`no chart result for ${ticker}`)
  const ts = result.timestamp || []
  const closes = result.indicators?.quote?.[0]?.close || []
  // Compact into (date, close) pairs, dropping nulls Yahoo emits for holidays.
  const series = ts
    .map((t, i) => [new Date(t * 1000), closes[i]])
    .filter(([, c]) => Number.isFinite(c))
  if (series.length === 0) throw new Error(`empty series for ${ticker}`)
  return series
}

function pctChange(from, to) {
  if (!Number.isFinite(from) || from === 0) return undefined
  return parseFloat((((to - from) / from) * 100).toFixed(1))
}

function ytdReference(series, now) {
  // Find the first trading day on or after Jan 1 of the current year.
  const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
  for (const [d, c] of series) {
    if (d >= startOfYear) return c
  }
  return undefined
}

function oneYearReference(series, now) {
  // Find the first trading day on or after (now - 1 year).
  const oneYearAgo = new Date(now)
  oneYearAgo.setUTCFullYear(oneYearAgo.getUTCFullYear() - 1)
  for (const [d, c] of series) {
    if (d >= oneYearAgo) return c
  }
  return series[0][1]
}

function round(n) {
  // 1 decimal for small numbers, 0 for thousands+ — keeps display compact.
  if (Math.abs(n) >= 1000) return Math.round(n)
  return parseFloat(n.toFixed(2))
}

async function main() {
  const [nodesRaw, indicatorsRaw] = await Promise.all([
    readFile(NODES_PATH, 'utf8'),
    readFile(INDICATORS_PATH, 'utf8'),
  ])
  const nodes = JSON.parse(nodesRaw)
  const indicators = JSON.parse(indicatorsRaw)

  // Pick indicator nodes that have a ticker.
  const targets = nodes
    .filter(n => n.type === 'indicator' && n.ids?.ticker)
    .map(n => ({ id: n.id, ticker: n.ids.ticker }))

  if (targets.length === 0) {
    console.error('no indicator nodes with a ticker; nothing to refresh')
    process.exit(1)
  }

  console.log(`refreshing ${targets.length} indicator(s):`, targets.map(t => `${t.id}=${t.ticker}`).join(', '))

  const now = new Date()
  const todayISO = now.toISOString().slice(0, 10)

  let updated = 0
  let failed = 0
  for (const { id, ticker } of targets) {
    try {
      const series = await fetchChart(ticker)
      const [lastDate, lastClose] = series[series.length - 1]
      const ytdRef = ytdReference(series, now)
      const yrRef = oneYearReference(series, now)
      const existing = indicators[id] || {}
      const next = {
        ...existing,
        value: round(lastClose),
        asOf: lastDate.toISOString().slice(0, 10),
        sourceId: 'YAHOO_FINANCE',
        changePct1y: pctChange(yrRef, lastClose),
        changeYtd: pctChange(ytdRef, lastClose),
      }
      // Strip undefined fields so JSON stays clean.
      for (const k of ['changePct1y', 'changeYtd']) {
        if (next[k] === undefined) delete next[k]
      }
      const oldVal = existing.value
      indicators[id] = next
      console.log(`  ${id.padEnd(10)} ${oldVal} → ${next.value} (${next.asOf})`)
      updated++
    } catch (e) {
      console.warn(`  ${id.padEnd(10)} FAILED: ${e.message} (existing value preserved)`)
      failed++
    }
  }

  if (updated === 0) {
    console.error('\nall fetches failed; not writing file')
    process.exit(1)
  }

  await writeFile(INDICATORS_PATH, JSON.stringify(indicators, null, 2) + '\n')
  console.log(`\nwrote ${INDICATORS_PATH} (${updated} updated, ${failed} failed) at ${todayISO}`)
}

main().catch(e => { console.error('refresh failed:', e); process.exit(1) })
