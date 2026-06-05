// Thin loader. Authoritative data lives in `./json/signal-provenance.json`.

import { z } from 'zod'
import type { Provenance } from './types'
import { ProvenanceSchema } from './schemas'
import data from './json/signal-provenance.json'

export const signalProvenance: Record<string, Provenance> = z.record(z.string(), ProvenanceSchema).parse(data)
