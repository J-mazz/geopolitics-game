import { z } from 'zod'
import type { GraphNode, IncentiveEdge } from './types'
import { GraphNodeSchema, IncentiveEdgeSchema } from './schemas'

// Capture layer nodes: blocs, documents, and the contested institution.
const captureNodesData = [
  { id: 'CONST_GOV', label: '🏛️ Constitutional Government', type: 'institution', group: 9, r: 22,
    detail: 'The contested center: Congress, agencies, and the federal rulemaking surface. The thesis is anti-subordination of THIS node to any organized bloc — symmetrically. Capture is measured by aggregate bloc influence, not by any single actor.' },

  { id: 'BLOC_AIPAC', label: '🏛️ Pro-Israel Lobby (AIPAC/UDP)', type: 'bloc', group: 9, r: 14,
    detail: 'AIPAC PAC + United Democracy Project super PAC. Per FEC filings, ~$95–127M in 2024-cycle election spending; bipartisan-by-design to secure majorities regardless of party. SOURCE: FEC / OpenSecrets.' },
  { id: 'BLOC_CUFI', label: '✝️ Christian Zionists (CUFI)', type: 'bloc', group: 9, r: 13,
    detail: 'Christians United for Israel, founded 2006 by Pastor John Hagee; claims ~10M members. Grassroots mobilization for US support of Israel on a stated theological basis. A PARALLEL pro-Israel bloc — not, on the available record, a funder of AIPAC. SOURCE: JTA / public record.' },
  { id: 'BLOC_HERITAGE', label: '📚 Heritage Foundation', type: 'bloc', group: 9, r: 14,
    detail: 'Conservative think tank; author of the Project Esther and Project 2025 manuscripts. Influence via published strategy documents and personnel pipelines. SOURCE: Heritage / NYT.' },
  { id: 'BLOC_CHAMBER', label: '🏢 US Chamber of Commerce', type: 'bloc', group: 9, r: 14,
    detail: 'Largest business advocacy association; top federal lobbying spender since 2015 (>$746M cumulative), ~$53.4M in 2024. SOURCE: OpenSecrets.' },
  { id: 'BLOC_NAR', label: '🏠 Natl Assn of Realtors', type: 'bloc', group: 9, r: 13,
    detail: 'Top single federal lobbying spender in 2024 at ~$63.5M. Included precisely to show capture is not a partisan or foreign phenomenon. SOURCE: OpenSecrets.' },
  { id: 'BLOC_PHRMA', label: '💊 PhRMA (pharma)', type: 'bloc', group: 9, r: 13,
    detail: 'Pharma trade group; ~$31.7M federal lobbying in 2024 within a health sector that spent ~$743.9M — the largest sector. SOURCE: OpenSecrets.' },
  { id: 'BLOC_DEFENSE', label: '🛡️ Defense Primes', type: 'bloc', group: 9, r: 13,
    detail: 'Major defense contractors. The annual NDAA was the single most heavily lobbied legislation of 2024; revolving-door and FMF flows are the structural levers. SOURCE: OpenSecrets.' },

  { id: 'DOC_ESTHER', label: '📜 Project Esther (2024)', type: 'document', group: 9, r: 12,
    detail: 'Heritage Foundation, published Oct 7 2024; credited authors Victoria Coates and Daniel Flesch. “A National Strategy to Combat Antisemitism” that designates a domestic “Hamas Support Network” and proposes dismantling it in 12–24 months. Drafted without major Jewish-organization input; no major Jewish org endorsed it; drew evangelical support. SOURCE: Heritage (primary) / NYT / JTA.' },
  { id: 'DOC_2025', label: '📕 Project 2025', type: 'document', group: 9, r: 12,
    detail: 'Heritage Foundation manuscript: a blueprint for consolidating executive authority and staffing. Included as the same KIND of artifact as Project Esther — a published think-tank strategy document with a verifiable byline. SOURCE: Heritage (primary).' },
]

export const captureNodes: GraphNode[] = z.array(GraphNodeSchema).parse(captureNodesData)

const captureEdgesData = [
  // Authorship (verifiable bylines)
  { source: 'BLOC_HERITAGE', target: 'DOC_ESTHER', relation: 'authored', strength: 9, confidence: 0.97,
    provenance: { sourceId: 'HERITAGE', url: 'https://www.heritage.org/progressivism/report/project-esther-national-strategy-combat-antisemitism', asOf: '2024-10-07',
      quote: 'Heritage published Project Esther on Oct 7 2024; credited authors Coates and Flesch.' } },
  { source: 'BLOC_HERITAGE', target: 'DOC_2025', relation: 'authored', strength: 9, confidence: 0.97,
    provenance: { sourceId: 'HERITAGE', asOf: '2023-04-01',
      quote: 'Project 2025 is a Heritage Foundation-led presidential transition manuscript.' } },

  // Documented policy PARALLEL (reliance unconfirmed — noted, not asserted causal)
  { source: 'DOC_ESTHER', target: 'CONST_GOV', relation: 'benefits_from', strength: 5, confidence: 0.5,
    provenance: { sourceId: 'NYT', asOf: '2025-05-01',
      quote: 'NYT: 2nd Trump admin adopted policies mirroring Esther but could not confirm reliance.' } },

  // Blocs -> contested institution (observable acts only)
  { source: 'BLOC_AIPAC', target: 'CONST_GOV', relation: 'donates_to', strength: 9, confidence: 0.92,
    provenance: { sourceId: 'FEC', asOf: '2025-02-01',
      quote: 'AIPAC PAC + UDP super PAC reported ~$95–127M in 2024-cycle election spending per FEC.' } },
  { source: 'BLOC_AIPAC', target: 'CONST_GOV', relation: 'lobbies_on', strength: 8, confidence: 0.9,
    provenance: { sourceId: 'OPENSECRETS', asOf: '2025-02-01',
      quote: 'AIPAC sharply increased lobbying during the Gaza war; UDP led Democratic-primary outside spending.' } },
  { source: 'BLOC_CUFI', target: 'CONST_GOV', relation: 'lobbies_on', strength: 6, confidence: 0.8,
    provenance: { sourceId: 'JTA', asOf: '2025-11-03',
      quote: 'CUFI uses a large evangelical membership for grassroots pro-Israel lobbying of Congress.' } },
  { source: 'BLOC_CHAMBER', target: 'CONST_GOV', relation: 'lobbies_on', strength: 8, confidence: 0.95,
    provenance: { sourceId: 'OPENSECRETS', url: 'https://www.opensecrets.org/federal-lobbying', asOf: '2025-02-05',
      quote: 'US Chamber: top lobbying spender since 2015, >$746M cumulative, ~$53.4M in 2024.' } },
  { source: 'BLOC_NAR', target: 'CONST_GOV', relation: 'lobbies_on', strength: 8, confidence: 0.95,
    provenance: { sourceId: 'OPENSECRETS', asOf: '2025-02-05',
      quote: 'National Assn of Realtors was the top single federal lobbying spender in 2024 at ~$63.5M.' } },
  { source: 'BLOC_PHRMA', target: 'CONST_GOV', relation: 'lobbies_on', strength: 7, confidence: 0.95,
    provenance: { sourceId: 'OPENSECRETS', url: 'https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2024&id=D000000504', asOf: '2025-02-05',
      quote: 'PhRMA spent ~$31.7M lobbying in 2024; the health sector led all sectors at ~$743.9M.' } },
  { source: 'BLOC_DEFENSE', target: 'CONST_GOV', relation: 'lobbies_on', strength: 7, confidence: 0.85,
    provenance: { sourceId: 'OPENSECRETS', asOf: '2025-02-05',
      quote: 'The annual NDAA was the single most heavily lobbied piece of legislation in 2024.' } },

  // Cross-link: capture layer to the existing graph (defense bloc <-> MIC instruments)
  { source: 'BLOC_DEFENSE', target: 'INST_F35', relation: 'benefits_from', strength: 7, confidence: 0.85,
    provenance: { sourceId: 'OPENSECRETS', asOf: '2026-01-01',
      quote: 'Prime contractors are the direct commercial beneficiaries of the F-35 program.' } },
]

export const captureEdges: IncentiveEdge[] = z.array(IncentiveEdgeSchema).parse(captureEdgesData)
