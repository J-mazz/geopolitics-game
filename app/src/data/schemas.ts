// Runtime schemas mirroring the TS interfaces in `./types`. Each data loader
// uses these to `.parse()` its JSON at module load time — bad data fails app
// startup with a clear error instead of crashing later in the render code.
//
// Rules:
//   - `.strict()` everywhere so typos in JSON keys are caught
//   - magnitude ranges enforced here (strength 1-10, confidence 0-1)
//   - ISO date regex on every asOf/date field
//   - format regexes on the canonical id fields (wikidata, LEI, CIK, bioguide)

import { z } from 'zod'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')

export const NodeIdsSchema = z.object({
  cik: z.string().regex(/^\d{1,10}$/).optional(),
  lei: z.string().regex(/^[A-Z0-9]{20}$/).optional(),
  ticker: z.string().min(1).max(10).regex(/^\S+$/).optional(),
  bioguide: z.string().regex(/^[A-Z]\d{6}$/).optional(),
  wikidata: z.string().regex(/^Q\d+$/).optional(),
}).strict()

export const SignalCohortSchema = z.enum(['feb-2026', 'jun-2026'])

export const IndicatorDatumSchema = z.object({
  value: z.number(),
  unit: z.string(),
  changePct1y: z.number().optional(),
  changeYtd: z.number().optional(),
  asOf: isoDate,
  sourceId: z.string(),
  notes: z.string().optional(),
}).strict()

export const NodeTypeSchema = z.enum([
  'major', 'swing', 'signal', 'domain', 'institution', 'instrument', 'indicator',
  'bloc', 'document',
])

export const GraphNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: NodeTypeSchema,
  group: z.number().int(),
  r: z.number().positive(),
  detail: z.string().min(1),
  cohort: SignalCohortSchema.optional(),
  date: isoDate.optional(),
  ids: NodeIdsSchema.optional(),
}).strict()

export const EdgeTypeSchema = z.enum([
  'conflict', 'cooperation', 'economic', 'signal', 'influence', 'structural',
])

export const GraphEdgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  type: EdgeTypeSchema,
  strength: z.number().min(1).max(10),
  label: z.string().optional(),
}).strict()

export const IncentiveRelationSchema = z.enum([
  'holds', 'donates_to', 'lobbies_on', 'sponsors',
  'benefits_from', 'controls', 'conflicts_with', 'authored',
])

export const ProvenanceSchema = z.object({
  sourceId: z.string().min(1),
  url: z.url().optional(),
  quote: z.string().min(1),
  asOf: isoDate,
}).strict()

export const IncentiveEdgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  relation: IncentiveRelationSchema,
  strength: z.number().min(1).max(10),
  confidence: z.number().min(0).max(1),
  provenance: ProvenanceSchema,
}).strict()

export const SourceTierSchema = z.enum([
  'model', 'feed', 'market', 'primary', 'news', 'structural',
])

export const SourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tier: SourceTierSchema,
  url: z.url().optional(),
  note: z.string().min(1),
}).strict()
