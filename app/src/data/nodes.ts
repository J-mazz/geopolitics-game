// Thin loader. Authoritative data lives in `./json/nodes.json` — edit there.
// JSON is validated against the schema at module load (TEST-02); a malformed
// entry fails app startup with a precise zod error.

import { z } from 'zod'
import type { GraphNode } from './types'
import { GraphNodeSchema } from './schemas'
import data from './json/nodes.json'

// Explicit GraphNode[] annotation preserves the runtime-only optional fields
// (x/y/fx/fy mutated by d3); the schema validates the JSON contract.
export const nodes: GraphNode[] = z.array(GraphNodeSchema).parse(data)
