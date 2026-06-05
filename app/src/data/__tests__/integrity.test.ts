import { describe, it, expect } from 'vitest'
import {
  nodes, edges, instruments, incentiveEdges, sources,
  typeColors, edgeColors, incentiveRelationColors,
  indicatorData, signalProvenance,
} from '..'
import type { GraphEdge, GraphNode, IncentiveEdge } from '..'

// The data file is hand-curated; a typo'd id silently breaks the force layout
// without failing the build. These assertions are the contract.

const baseIds = new Set(nodes.map(n => n.id))
const instrumentIds = new Set(instruments.map(n => n.id))
const allIds = new Set([...baseIds, ...instrumentIds])

const endpointId = (v: string | GraphNode): string =>
  typeof v === 'string' ? v : v.id

describe('node id uniqueness', () => {
  it('no duplicate ids in nodes[]', () => {
    expect(nodes.length).toBe(baseIds.size)
  })

  it('no duplicate ids in instruments[]', () => {
    expect(instruments.length).toBe(instrumentIds.size)
  })

  it('instrument ids do not collide with base node ids', () => {
    const overlap = [...instrumentIds].filter(id => baseIds.has(id))
    expect(overlap).toEqual([])
  })
})

describe('edge referential integrity', () => {
  it('every base edge endpoint resolves to a base node', () => {
    const dangling: Array<{ source: string; target: string; missing: string[] }> = []
    edges.forEach((e: GraphEdge) => {
      const s = endpointId(e.source)
      const t = endpointId(e.target)
      const missing = [s, t].filter(id => !baseIds.has(id))
      if (missing.length) dangling.push({ source: s, target: t, missing })
    })
    expect(dangling).toEqual([])
  })

  it('every incentive edge endpoint resolves to a base node or instrument', () => {
    const dangling: Array<{ source: string; target: string; missing: string[] }> = []
    incentiveEdges.forEach((e: IncentiveEdge) => {
      const missing = [e.source, e.target].filter(id => !allIds.has(id))
      if (missing.length) dangling.push({ source: e.source, target: e.target, missing })
    })
    expect(dangling).toEqual([])
  })

  it('every base edge type has a color in edgeColors', () => {
    const missing = edges
      .map(e => e.type)
      .filter(t => !(t in edgeColors))
    expect(missing).toEqual([])
  })
})

describe('provenance integrity', () => {
  // Post-PROV-02: no placeholder bypass — every sourceId must resolve in the
  // registry. STRUCTURAL is a real registry entry (the "claim is its own
  // source" tier), not a placeholder.
  it('every incentive provenance.sourceId resolves in sources', () => {
    const unresolved = incentiveEdges
      .map(e => e.provenance.sourceId)
      .filter(id => !(id in sources))
    expect(unresolved).toEqual([])
  })

  it('every incentive provenance has a non-empty quote and asOf', () => {
    const bad = incentiveEdges.filter(
      e => !e.provenance.quote?.trim() || !e.provenance.asOf?.trim()
    )
    expect(bad).toEqual([])
  })
})

describe('color map completeness', () => {
  it('every node type has a color in typeColors', () => {
    const types = new Set([...nodes, ...instruments].map(n => n.type))
    const missing = [...types].filter(t => !(t in typeColors))
    expect(missing).toEqual([])
  })

  it('every incentive relation in edges has a color in incentiveRelationColors', () => {
    const missing = incentiveEdges
      .map(e => e.relation)
      .filter(r => !(r in incentiveRelationColors))
    expect(missing).toEqual([])
  })
})

describe('signal metadata', () => {
  const signals = nodes.filter(n => n.type === 'signal')

  it('every signal has a cohort', () => {
    const missing = signals.filter(s => s.cohort !== 'feb-2026' && s.cohort !== 'jun-2026')
    expect(missing.map(s => s.id)).toEqual([])
  })

  it('every present date is ISO YYYY-MM-DD', () => {
    const bad = signals
      .filter(s => s.date !== undefined)
      .filter(s => !/^\d{4}-\d{2}-\d{2}$/.test(s.date!))
    expect(bad.map(s => `${s.id}=${s.date}`)).toEqual([])
  })
})

describe('signal provenance', () => {
  const signals = nodes.filter(n => n.type === 'signal')

  it('every signal has a provenance entry', () => {
    const missing = signals.filter(s => !(s.id in signalProvenance))
    expect(missing.map(s => s.id)).toEqual([])
  })

  it('every signal provenance sourceId resolves in sources', () => {
    const unresolved = Object.entries(signalProvenance)
      .filter(([, p]) => !(p.sourceId in sources))
      .map(([id, p]) => `${id}=${p.sourceId}`)
    expect(unresolved).toEqual([])
  })

  it('every signal provenance asOf is ISO YYYY-MM-DD', () => {
    const bad = Object.entries(signalProvenance)
      .filter(([, p]) => !/^\d{4}-\d{2}-\d{2}$/.test(p.asOf))
      .map(([id, p]) => `${id}=${p.asOf}`)
    expect(bad).toEqual([])
  })

  it('every signal provenance quote is non-empty', () => {
    const bad = Object.entries(signalProvenance)
      .filter(([, p]) => !p.quote?.trim())
      .map(([id]) => id)
    expect(bad).toEqual([])
  })

  it('no orphan signalProvenance entries (every key resolves to a signal node)', () => {
    const signalIds = new Set(signals.map(s => s.id))
    const orphans = Object.keys(signalProvenance).filter(id => !signalIds.has(id))
    expect(orphans).toEqual([])
  })
})

describe('indicator data', () => {
  const indicators = nodes.filter(n => n.type === 'indicator')

  it('every indicator node has an entry in indicatorData', () => {
    const missing = indicators.filter(n => !(n.id in indicatorData))
    expect(missing.map(n => n.id)).toEqual([])
  })

  it('every indicatorData sourceId resolves in sources', () => {
    const unresolved = Object.entries(indicatorData)
      .filter(([, d]) => !(d.sourceId in sources))
      .map(([id, d]) => `${id}=${d.sourceId}`)
    expect(unresolved).toEqual([])
  })

  it('every indicatorData asOf is ISO YYYY-MM-DD', () => {
    const bad = Object.entries(indicatorData)
      .filter(([, d]) => !/^\d{4}-\d{2}-\d{2}$/.test(d.asOf))
      .map(([id, d]) => `${id}=${d.asOf}`)
    expect(bad).toEqual([])
  })

  it('no orphan indicatorData entries (every key resolves to a node)', () => {
    const nodeIds = new Set(nodes.map(n => n.id))
    const orphans = Object.keys(indicatorData).filter(id => !nodeIds.has(id))
    expect(orphans).toEqual([])
  })
})

describe('canonical entity ids', () => {
  const allNodes = [...nodes, ...instruments]
  const withIds = allNodes.filter(n => n.ids)

  it('every wikidata id matches ^Q\\d+$', () => {
    const bad = withIds
      .filter(n => n.ids?.wikidata && !/^Q\d+$/.test(n.ids.wikidata))
      .map(n => `${n.id}=${n.ids?.wikidata}`)
    expect(bad).toEqual([])
  })

  it('every LEI is 20 alphanumeric chars (ISO 17442)', () => {
    const bad = withIds
      .filter(n => n.ids?.lei && !/^[A-Z0-9]{20}$/.test(n.ids.lei))
      .map(n => `${n.id}=${n.ids?.lei}`)
    expect(bad).toEqual([])
  })

  it('every CIK is 1–10 digits', () => {
    const bad = withIds
      .filter(n => n.ids?.cik && !/^\d{1,10}$/.test(n.ids.cik))
      .map(n => `${n.id}=${n.ids?.cik}`)
    expect(bad).toEqual([])
  })

  it('every bioguide id matches ^[A-Z]\\d{6}$', () => {
    const bad = withIds
      .filter(n => n.ids?.bioguide && !/^[A-Z]\d{6}$/.test(n.ids.bioguide))
      .map(n => `${n.id}=${n.ids?.bioguide}`)
    expect(bad).toEqual([])
  })

  it('every ticker is non-empty short string', () => {
    const bad = withIds
      .filter(n => n.ids?.ticker !== undefined && !/^\S{1,10}$/.test(n.ids.ticker))
      .map(n => `${n.id}=${n.ids?.ticker}`)
    expect(bad).toEqual([])
  })
})

describe('magnitude ranges', () => {
  it('base edge strength is 1..10', () => {
    const oob = edges.filter(e => e.strength < 1 || e.strength > 10)
    expect(oob).toEqual([])
  })

  it('incentive edge strength is 1..10', () => {
    const oob = incentiveEdges.filter(e => e.strength < 1 || e.strength > 10)
    expect(oob).toEqual([])
  })

  it('incentive edge confidence is 0..1', () => {
    const oob = incentiveEdges.filter(e => e.confidence < 0 || e.confidence > 1)
    expect(oob).toEqual([])
  })
})
