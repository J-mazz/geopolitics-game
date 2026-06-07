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

  // ---- EFTA disclosure document ----
  { id: 'DOC_EFTA_RELEASE', label: '🗂️ DOJ EFTA Release (Jan 30 2026)', type: 'document', group: 10, r: 14,
    detail: 'DOJ disclosure under the Epstein Files Transparency Act (H.R. 4405). Approximately 3M+ pages released; ~200k+ pages withheld. The release is the primary-source substrate for the named-in edges below. Each edge encodes only an observable, documented act (named in the release, arrested, scheduled to testify, resigned over disclosed material) — no imputed intent. SOURCE: DOJ.' },

  // ---- Persons named in the EFTA release or in disclosed correspondence ----
  // Every person here has at least one published action (arrest, scheduled testimony,
  // resignation) attributable to disclosed material. Identity claims are limited to
  // the role at time of action; nothing beyond what the cited source itself states.
  { id: 'PERSON_LUTNICK', label: '👤 Howard Lutnick', type: 'person', group: 10, r: 11,
    detail: 'US Commerce Secretary at time of disclosure. Scheduled to testify under EFTA proceedings per S29. Source-stated role and action; no further characterization drawn. SOURCE: DOJ / CBS.',
    ids: { wikidata: 'Q5917327' } },
  { id: 'PERSON_ANDREW', label: '👤 Andrew Windsor', type: 'person', group: 10, r: 11,
    detail: 'Arrested Feb 18 2026 per disclosed material in the EFTA release. Edge encodes the documented arrest only. SOURCE: DOJ / Reuters / Britannica.',
    ids: { wikidata: 'Q146337' } },
  { id: 'PERSON_BCLINTON', label: '👤 Bill Clinton', type: 'person', group: 10, r: 11,
    detail: 'Held in contempt and subsequently testified under EFTA proceedings per S29. Edge encodes the documented procedural acts only. SOURCE: DOJ / CBS.',
    ids: { wikidata: 'Q1124' } },
  { id: 'PERSON_HCLINTON', label: '👤 Hillary Clinton', type: 'person', group: 10, r: 11,
    detail: 'Held in contempt and subsequently testified under EFTA proceedings per S29. Edge encodes the documented procedural acts only. SOURCE: DOJ / CBS.',
    ids: { wikidata: 'Q6294' } },
  { id: 'PERSON_MANDELSON', label: '👤 Peter Mandelson', type: 'person', group: 10, r: 11,
    detail: 'UK PM aide who resigned over disclosed correspondence linking the aide and Mandelson to Epstein per S16. Edge encodes the documented resignation and named connection only. SOURCE: Reuters / FT / AJ.',
    ids: { wikidata: 'Q314945' } },
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

  // ---- EFTA sub-graph: persons named in the disclosed material ------------
  // Discipline (re-stated): each edge cites a primary or established source
  // and encodes only a documented act. Nothing is asserted about guilt,
  // motive, or relationships beyond what the cited source itself states.
  { source: 'PERSON_LUTNICK', target: 'DOC_EFTA_RELEASE', relation: 'named_in', strength: 6, confidence: 0.9,
    provenance: { sourceId: 'DOJ_EFTA', asOf: '2026-01-30',
      quote: 'Scheduled to testify under EFTA disclosure proceedings.' } },
  { source: 'PERSON_ANDREW', target: 'DOC_EFTA_RELEASE', relation: 'named_in', strength: 8, confidence: 0.95,
    provenance: { sourceId: 'DOJ_EFTA', asOf: '2026-02-18',
      quote: 'Arrested Feb 18 2026 in connection with EFTA-disclosed material.' } },
  { source: 'PERSON_BCLINTON', target: 'DOC_EFTA_RELEASE', relation: 'named_in', strength: 7, confidence: 0.95,
    provenance: { sourceId: 'DOJ_EFTA', asOf: '2026-01-30',
      quote: 'Held in contempt then testified under EFTA proceedings.' } },
  { source: 'PERSON_HCLINTON', target: 'DOC_EFTA_RELEASE', relation: 'named_in', strength: 7, confidence: 0.95,
    provenance: { sourceId: 'DOJ_EFTA', asOf: '2026-01-30',
      quote: 'Held in contempt then testified under EFTA proceedings.' } },
  { source: 'PERSON_MANDELSON', target: 'DOC_EFTA_RELEASE', relation: 'named_in', strength: 6, confidence: 0.85,
    provenance: { sourceId: 'REUTERS', asOf: '2026-02-01',
      quote: 'UK PM aide resigned over disclosed correspondence linking the aide and Mandelson to Epstein.' } },

  // Document → contested institution: the EFTA release is itself a public-record event
  // that bears on constitutional government (subpoena power, executive cooperation,
  // separation of powers). Modeled as observable parallel, low confidence.
  { source: 'DOC_EFTA_RELEASE', target: 'CONST_GOV', relation: 'benefits_from', strength: 4, confidence: 0.5,
    provenance: { sourceId: 'DOJ_EFTA', asOf: '2026-01-30',
      quote: 'EFTA disclosures invoke congressional and judicial process; outcome bears on inter-branch authority.' } },
]

export const captureEdges: IncentiveEdge[] = z.array(IncentiveEdgeSchema).parse(captureEdgesData)
