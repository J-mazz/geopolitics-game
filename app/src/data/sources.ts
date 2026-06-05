// Thin loader. Authoritative data lives in `./json/sources.json`.

import { z } from 'zod'
import type { Source } from './types'
import { SourceSchema } from './schemas'
import data from './json/sources.json'

export const sources: Record<string, Source> = z.record(z.string(), SourceSchema).parse(data)
