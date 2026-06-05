// Thin loader + display formatter. Authoritative data lives in
// `./json/indicators.json` — LIVE-01 can rewrite that file from a connector
// and the rest of the app picks up the new values on next load.

import { z } from 'zod'
import type { IndicatorDatum } from './types'
import { IndicatorDatumSchema } from './schemas'
import data from './json/indicators.json'

export const indicatorData: Record<string, IndicatorDatum> = z.record(z.string(), IndicatorDatumSchema).parse(data)

// Display formatter: turns a datum into a compact human string. The unit field
// drives the format — '$/...' prepends $, '%' suffixes, 'index'/'' is bare.
export function formatIndicator(d: IndicatorDatum): string {
  const v = d.value.toLocaleString()
  if (d.unit.startsWith('$/')) return `$${v}${d.unit.slice(1)}`
  if (d.unit.startsWith('$')) return `$${v}${d.unit.slice(1)}`
  if (d.unit.startsWith('%')) return `${v}${d.unit}`
  if (d.unit === 'index' || d.unit === '') return v
  return `${v} ${d.unit}`
}
