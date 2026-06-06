# Data layer

Authoritative data lives in `./json/`. The `.ts` files in this directory are
thin loaders that import the JSON, validate it against a zod schema, and
re-export with proper TS types. Editing the data means editing JSON.

## Layout

```
data/
├── README.md          (this file)
├── types.ts           interfaces / types (no runtime data)
├── schemas.ts         zod schemas mirroring types — used by every loader
├── theme.ts           color maps (config, not data)
├── index.ts           barrel re-export — consumers `import { ... } from '../data'`
│
├── nodes.ts           loader → json/nodes.json
├── edges.ts           loader → json/edges.json
├── incentives.ts      loader → json/instruments.json + json/incentive-edges.json
├── indicators.ts      loader → json/indicators.json (+ formatIndicator helper)
├── signals.ts         loader → json/signal-provenance.json
├── sources.ts         loader → json/sources.json
│
├── json/              ← AUTHORITATIVE data
│   ├── nodes.json              60 entries (actors, domains, institutions, signals, indicators)
│   ├── edges.json              130+ entries (relational + structural)
│   ├── instruments.json        6 entries (incentive lens)
│   ├── incentive-edges.json    17 entries (who-controls/benefits)
│   ├── indicators.json         7 entries (live numeric — auto-refresh)
│   ├── signal-provenance.json  30 entries (per-signal citations)
│   └── sources.json            30+ entries (source registry)
│
└── __tests__/
    ├── integrity.test.ts       referential integrity, no dangling ids, etc.
    └── schemas.test.ts         schema rejection / acceptance edge cases
```

## Editing workflow

1. Edit the `.json` file
2. Run `npm test` — confirms:
   - The zod schema accepts your change (strict — typo'd keys fail)
   - Referential integrity holds (no dangling ids, sourceIds resolve, no dupes)
   - Format constraints hold (ISO dates, magnitude ranges, id formats)
3. The TS loaders re-run validation on every module load, so a malformed JSON
   crashes the dev server with a precise zod error path

## Schema invariants (enforced by tests + zod)

| Invariant                                          | Where enforced              |
|----------------------------------------------------|------------------------------|
| Node ids unique; instruments don't collide         | `integrity.test.ts`          |
| Every edge source/target resolves to a node        | `integrity.test.ts`          |
| Every provenance.sourceId resolves in `sources`    | `integrity.test.ts`          |
| Every indicator node has a datum in `indicatorData`| `integrity.test.ts`          |
| Every signal has a `cohort` + provenance entry     | `integrity.test.ts`          |
| `strength` ∈ [1, 10], `confidence` ∈ [0, 1]        | `schemas.ts` (range check)   |
| `asOf` / `date` is `YYYY-MM-DD`                    | `schemas.ts` (regex)         |
| `wikidata` matches `^Q\d+$`                        | `schemas.ts` (regex)         |
| `LEI` is 20 alphanumeric (ISO 17442)               | `schemas.ts` (regex)         |
| `CIK` is 1–10 digits; `bioguide` is `^[A-Z]\d{6}$` | `schemas.ts` (regex)         |
| Unknown JSON keys rejected (no silent typos)       | `schemas.ts` (`.strict()`)   |

## Source tiers

| Tier         | Meaning                                                              |
|--------------|----------------------------------------------------------------------|
| `model`      | Formal / falsifiable frameworks (e.g. bargaining model of war)       |
| `feed`       | Event-discovery / narrative synthesis (e.g. WarFronts)               |
| `market`     | Quantitative live data (Yahoo Finance, FMP/Bigdata.com)              |
| `primary`    | Government / military / manufacturer releases (BIS, State, USARPAC, Lockheed) |
| `news`       | Conventional reporting outlets (FT, Reuters, SCMP, etc.)             |
| `structural` | Canonical / invariant facts — *the claim itself is the source*. Used for memberships, treaties, charters. **Intentional, not a placeholder.** |

## Live indicators refresh

```sh
npm run refresh:indicators
```

Yahoo Finance public chart API. Reads which indicators have an `ids.ticker`
in `nodes.json`, fetches 1y daily closes per ticker, computes current value +
YTD% + 1Y%, stamps `asOf`, writes to `json/indicators.json`. Indicators
without a ticker (`I_CHIPIDX` composite, `I_WEALTH` quarterly Fed DFA) are
preserved untouched. Per-ticker failure is isolated; all-fail aborts without
writing.

## Adding a new...

**Actor / institution / domain node:** add to `nodes.json` with a unique id,
label, type, group, r, detail. Optionally `ids` with canonical identifiers.

**Edge:** add to `edges.json`. Both endpoints must already exist as nodes.

**Signal:** add to `nodes.json` (type=`signal`, with `cohort`, optionally
`date`) AND add a matching entry in `signal-provenance.json` with a
registry-resolved `sourceId`, a short curated quote, and an `asOf`.

**Indicator:** add to `nodes.json` (type=`indicator`, optionally `ids.ticker`
for auto-refresh) AND add a matching entry in `indicators.json` with `value`,
`unit`, `asOf`, `sourceId`.

**Instrument (incentive lens):** add to `instruments.json`. Then add edges
in `incentive-edges.json` connecting actors to the instrument with a
relation, strength, confidence, and full provenance.

**Source:** add to `sources.json` with id, name, tier, optional url, note.
Then references from incentive edges / signals / indicators will resolve.

## Don't

- Don't add an edge to an actor that doesn't exist as a node — the integrity
  test will fail. Add the node first.
- Don't fabricate provenance. If you don't have a real source, use the
  `STRUCTURAL` source entry (for canonical claims) or wait until you do.
- Don't fabricate a per-event date for a signal. The `date` field is
  optional — leave it out rather than guess.
- Don't put a magic value in `value` / `unit` that doesn't match the unit.
  GLD trades at ~$400/share, not gold spot $/oz; use the futures symbol
  (`GC=F`) if you want spot-equivalent pricing.
