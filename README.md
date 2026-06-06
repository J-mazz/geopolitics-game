# geopolitics-game

An interactive **structural map of power** — who is connected to what, which events touch which theaters, what capital is pricing, and who benefits, with provenance on the claims that carry weight.

The project's thesis (anti-capture, anti-consolidation, anti-subordination of constitutional government — applied symmetrically, non-partisan by construction) and its evidentiary discipline are stated on the site's landing page: `app/src/pages/Landing.tsx` (route `/`).

## Run

```bash
cd app
npm install
npm run dev
```

## Layout
- `/`               — Thesis / landing
- `/graph`          — the force-directed power graph (+ incentives & capture lenses)
- `/republic-health`, `/common-sense`

Stack: React 19 · Vite 7 · TypeScript · D3. Data and schema in `app/src/data/`.
