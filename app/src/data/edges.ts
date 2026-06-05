// Thin loader. Authoritative data lives in `./json/edges.json`.

import { z } from 'zod'
import type { GraphEdge } from './types'
import { GraphEdgeSchema } from './schemas'
import data from './json/edges.json'

export const edges: GraphEdge[] = z.array(GraphEdgeSchema).parse(data)
