// All interfaces and type aliases for the data layer.
// Data modules (nodes, edges, incentives, indicators, signals, sources) import
// types from here; nothing in this file has runtime data.

export type SignalCohort = 'feb-2026' | 'jun-2026'

// Machine-readable state for indicator nodes. Decouples the display value
// from the node's `label` text so a connector refresh (LIVE-01) can update
// numbers without touching layout-bearing strings, and so the same datum
// drives the SVG text, the right-panel card, and the tooltip.
export interface IndicatorDatum {
  value: number
  unit: string            // '$/bbl', '$/oz', '%', 'index', '' for unitless scalars
  changePct1y?: number
  changeYtd?: number
  asOf: string            // ISO date — when this value was observed
  sourceId: string        // must resolve in `sources` registry
  notes?: string          // composite indicators: secondary numbers / context
}

// Canonical entity identifiers — the bridge to external authority files so
// this hand-curated graph can merge with extracted data. All fields optional;
// backfill where the identifier is well-known and stable, omit rather than guess.
//   - cik:      SEC Central Index Key (US filers)
//   - lei:      Legal Entity Identifier (ISO 17442, 20-char alphanumeric)
//   - ticker:   exchange ticker (Yahoo-style: '^' prefix for indices)
//   - bioguide: US Congress Bioguide ID (legislators)
//   - wikidata: Wikidata Q-id (the universal resolver across all entity types)
export interface NodeIds {
  cik?: string
  lei?: string
  ticker?: string
  bioguide?: string
  wikidata?: string
}

export interface GraphNode {
  id: string
  label: string
  type: 'major' | 'swing' | 'signal' | 'domain' | 'institution' | 'instrument' | 'indicator' | 'bloc' | 'document'
  group: number
  r: number
  detail: string
  // Bitemporal anchors on signal nodes:
  //   `cohort`: which curation pass added the signal (transaction-time anchor)
  //   `date`:   ISO date of the event itself (valid-time); omitted where the
  //             source material doesn't pin a date — better empty than fictional
  cohort?: SignalCohort
  date?: string
  ids?: NodeIds
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphEdge {
  source: string | GraphNode
  target: string | GraphNode
  type: 'conflict' | 'cooperation' | 'economic' | 'signal' | 'influence' | 'structural'
  strength: number
  label?: string
}

// ---- Incentives layer ----

export type IncentiveRelation =
  | 'holds'         // actor holds a position/instrument
  | 'donates_to'    // actor funds a target
  | 'lobbies_on'    // actor lobbies on an instrument
  | 'sponsors'      // actor sponsors/authors an instrument
  | 'benefits_from' // actor's incentives are served by target
  | 'controls'      // actor sets/administers the instrument
  | 'conflicts_with'// the instrument cuts against the target's interest
  | 'authored'      // actor authored/published a document (verifiable byline)

export interface Provenance {
  sourceId: string      // must resolve in the sources registry (enforced by test)
  url?: string          // per-article URL when curated; omit rather than fabricate
  quote: string         // the span that justifies the edge
  asOf: string          // ISO date — valid-time, the bitemporal anchor
}

export interface IncentiveEdge {
  source: string                // actor id (existing node)
  target: string                // instrument id, or an existing actor/domain/signal id
  relation: IncentiveRelation
  strength: number              // 1-10, magnitude of the incentive
  confidence: number            // 0-1, epistemic state in the edge itself
  provenance: Provenance
}

// ---- Sources registry ----

export type SourceTier = 'model' | 'feed' | 'market' | 'primary' | 'news' | 'structural'

export interface Source {
  id: string
  name: string
  tier: SourceTier
  url?: string
  note: string
}
