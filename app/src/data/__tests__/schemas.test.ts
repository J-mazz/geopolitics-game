// Focused tests for the zod schemas. The loaders already exercise the schemas
// at module load (any bad JSON file would fail to import); these tests pin
// down the rejection behavior — i.e. assert the schemas FAIL on the malformed
// shapes we care about, so accidental relaxation can't slip through silently.

import { describe, it, expect } from 'vitest'
import {
  GraphNodeSchema, GraphEdgeSchema, IncentiveEdgeSchema,
  ProvenanceSchema, SourceSchema, IndicatorDatumSchema, NodeIdsSchema,
} from '../schemas'

describe('schema rejection — accidental relaxation guard', () => {
  it('GraphNode rejects unknown fields (catches JSON key typos)', () => {
    const bad = { id: 'X', label: 'X', type: 'major', group: 1, r: 10, detail: 'x', notes: 'oops' }
    expect(GraphNodeSchema.safeParse(bad).success).toBe(false)
  })

  it('GraphNode rejects unknown node type', () => {
    const bad = { id: 'X', label: 'X', type: 'newkind', group: 1, r: 10, detail: 'x' }
    expect(GraphNodeSchema.safeParse(bad).success).toBe(false)
  })

  it('GraphEdge rejects strength out of 1..10', () => {
    const lo = { source: 'A', target: 'B', type: 'conflict', strength: 0 }
    const hi = { source: 'A', target: 'B', type: 'conflict', strength: 11 }
    expect(GraphEdgeSchema.safeParse(lo).success).toBe(false)
    expect(GraphEdgeSchema.safeParse(hi).success).toBe(false)
  })

  it('IncentiveEdge rejects confidence out of 0..1', () => {
    const base = {
      source: 'A', target: 'B', relation: 'controls' as const,
      strength: 5,
      provenance: { sourceId: 'STRUCTURAL', quote: 'q', asOf: '2026-01-01' },
    }
    expect(IncentiveEdgeSchema.safeParse({ ...base, confidence: -0.1 }).success).toBe(false)
    expect(IncentiveEdgeSchema.safeParse({ ...base, confidence: 1.1 }).success).toBe(false)
    expect(IncentiveEdgeSchema.safeParse({ ...base, confidence: 0.5 }).success).toBe(true)
  })

  it('IncentiveEdge rejects unknown relation', () => {
    const bad = {
      source: 'A', target: 'B', relation: 'enriches',
      strength: 5, confidence: 0.5,
      provenance: { sourceId: 'STRUCTURAL', quote: 'q', asOf: '2026-01-01' },
    }
    expect(IncentiveEdgeSchema.safeParse(bad).success).toBe(false)
  })

  it('Provenance rejects non-ISO asOf', () => {
    const bad = { sourceId: 'X', quote: 'q', asOf: '2026/01/01' }
    expect(ProvenanceSchema.safeParse(bad).success).toBe(false)
  })

  it('Provenance rejects empty quote', () => {
    const bad = { sourceId: 'X', quote: '', asOf: '2026-01-01' }
    expect(ProvenanceSchema.safeParse(bad).success).toBe(false)
  })

  it('Source rejects unknown tier', () => {
    const bad = { id: 'X', name: 'X', tier: 'blog', note: 'x' }
    expect(SourceSchema.safeParse(bad).success).toBe(false)
  })

  it('IndicatorDatum rejects malformed asOf', () => {
    const bad = { value: 1, unit: '%', asOf: 'yesterday', sourceId: 'X' }
    expect(IndicatorDatumSchema.safeParse(bad).success).toBe(false)
  })

  it('NodeIds rejects malformed wikidata id', () => {
    const bad = { wikidata: 'P42' } // Q-ids start with Q, not P
    expect(NodeIdsSchema.safeParse(bad).success).toBe(false)
  })

  it('NodeIds rejects malformed LEI (must be 20 alphanum)', () => {
    const bad = { lei: 'TOO-SHORT' }
    expect(NodeIdsSchema.safeParse(bad).success).toBe(false)
  })

  it('NodeIds rejects malformed bioguide id', () => {
    const bad = { bioguide: 'A12345' } // bioguide is letter + 6 digits
    expect(NodeIdsSchema.safeParse(bad).success).toBe(false)
  })
})

describe('schema acceptance — minimal valid inputs', () => {
  it('GraphNode accepts a minimal actor node', () => {
    const good = { id: 'X', label: 'X', type: 'major', group: 1, r: 10, detail: 'x' }
    expect(GraphNodeSchema.safeParse(good).success).toBe(true)
  })

  it('GraphNode accepts a signal with cohort + date', () => {
    const good = {
      id: 'S1', label: 'x', type: 'signal', group: 6, r: 10, detail: 'x',
      cohort: 'feb-2026', date: '2026-02-08',
    }
    expect(GraphNodeSchema.safeParse(good).success).toBe(true)
  })

  it('Source accepts structural tier (intentional, not a bypass)', () => {
    const good = { id: 'STRUCTURAL', name: 'Structural fact', tier: 'structural', note: 'x' }
    expect(SourceSchema.safeParse(good).success).toBe(true)
  })
})
