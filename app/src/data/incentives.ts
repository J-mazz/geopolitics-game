// Thin loader for the incentives layer. Authoritative data lives in
// `./json/instruments.json` and `./json/incentive-edges.json`.

import { z } from 'zod'
import type { GraphNode, IncentiveEdge } from './types'
import { GraphNodeSchema, IncentiveEdgeSchema } from './schemas'
import instrumentsJson from './json/instruments.json'
import incentiveEdgesJson from './json/incentive-edges.json'

export const instruments: GraphNode[] = z.array(GraphNodeSchema).parse(instrumentsJson)
export const incentiveEdges: IncentiveEdge[] = z.array(IncentiveEdgeSchema).parse(incentiveEdgesJson)
