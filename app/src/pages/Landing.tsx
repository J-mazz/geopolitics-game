import { Link } from 'react-router-dom'

// Headline numbers shown in the stat strip below the hero. Every figure is
// already represented in the capture-layer data; the source text mirrors what
// the graph's provenance.quote and source registry say. If those change in
// the data, update here too.
const STATS = [
  { value: '$746M+', label: 'US Chamber lobbying',          sub: 'cumulative since 2015',     src: 'OpenSecrets' },
  { value: '$95–127M', label: 'AIPAC + UDP election spending', sub: '2024 cycle',              src: 'FEC' },
  { value: '$743.9M', label: 'Health-sector lobbying',       sub: 'largest sector, 2024',      src: 'OpenSecrets' },
  { value: '$63.5M',  label: 'National Realtors lobbying',   sub: 'top single spender, 2024', src: 'OpenSecrets' },
  { value: '31.7%',   label: 'US wealth held by top 1%',     sub: 'record concentration',      src: 'Fed DFA' },
]

// Tiny inline capture-layer visualization: a single contested institution at
// center, six blocs around it, arrows for lobbying/donating relations. Static
// SVG — no d3, no animation — purely a teaser that the actual graph fills out.
const BLOCS: Array<{ label: string; angle: number; subLabel?: string }> = [
  { label: 'US Chamber',     angle: 270, subLabel: 'Lobbying' },
  { label: 'Health / Pharma',angle: 330, subLabel: 'Lobbying' },
  { label: 'Realtors',       angle: 30,  subLabel: 'Lobbying' },
  { label: 'Defense Primes', angle: 90,  subLabel: 'Lobbying' },
  { label: 'AIPAC / CUFI',   angle: 150, subLabel: 'Donations + Lobbying' },
  { label: 'Heritage',       angle: 210, subLabel: 'Documents + Personnel' },
]

function Principle({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="my-5">
      <div className="font-sans font-bold tracking-[0.18em] uppercase text-xs mb-1.5"
           style={{ color: 'var(--accent)' }}>{label}</div>
      <div className="text-[0.98rem] leading-relaxed" style={{ color: 'var(--text)' }}>{children}</div>
    </div>
  )
}

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-12 scroll-mt-16">
      <h2 className="font-sans text-2xl font-bold mb-4 pb-2 tracking-wide"
          style={{ color: 'var(--text-bright)', borderBottom: '1px solid var(--border)' }}>{title}</h2>
      {children}
    </section>
  )
}

function StatTile({ value, label, sub, src }: typeof STATS[number]) {
  return (
    <div className="rounded-md border px-4 py-3 text-left"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
      <div className="font-sans text-2xl md:text-[1.7rem] font-bold leading-tight"
        style={{ color: 'var(--text-bright)' }}>{value}</div>
      <div className="text-[0.85rem] mt-1" style={{ color: 'var(--text)' }}>{label}</div>
      <div className="text-[0.72rem] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</div>
      <div className="text-[0.65rem] mt-1.5 uppercase tracking-wider font-sans font-semibold"
        style={{ color: 'var(--accent)' }}>{src}</div>
    </div>
  )
}

function CaptureTeaser() {
  // 600x460 viewBox with extra top padding so labels above the topmost bloc
  // don't crash into the section header.
  const cx = 300, cy = 230
  const ringR = 155
  const blocR = 38
  return (
    <div className="relative">
      <Link
        to="/graph?lens=capture"
        aria-label="Open the full capture lens in the graph"
        className="block rounded-lg overflow-hidden transition-transform hover:scale-[1.01]"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
        <svg viewBox="0 0 600 460" className="w-full h-auto block">
          <defs>
            <marker id="teaser-arrow" viewBox="0 -5 10 10" refX="14" refY="0" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,-5L10,0L0,5" fill="#f472b6" />
            </marker>
          </defs>

          {/* edges first so circles sit on top */}
          {BLOCS.map((b, i) => {
            const rad = (b.angle * Math.PI) / 180
            const x = cx + Math.cos(rad) * ringR
            const y = cy + Math.sin(rad) * ringR
            // Trim the line so it meets the circle edge, not center
            const dx = x - cx, dy = y - cy
            const len = Math.hypot(dx, dy)
            const x2 = x - (dx / len) * blocR
            const y2 = y - (dy / len) * blocR
            const x1 = cx + (dx / len) * 48
            const y1 = cy + (dy / len) * 48
            return (
              <line key={`e-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#f472b6" strokeWidth="1.5" opacity="0.75" markerEnd="url(#teaser-arrow)" />
            )
          })}

          {/* center: Constitutional Government (institution color) */}
          <circle cx={cx} cy={cy} r={48} fill="#44ff88" fillOpacity="0.18" stroke="#44ff88" strokeWidth="2" />
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif"
            fontWeight="700" fill="#86efac">Constitutional</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif"
            fontWeight="700" fill="#86efac">Government</text>

          {/* blocs */}
          {BLOCS.map((b, i) => {
            const rad = (b.angle * Math.PI) / 180
            const x = cx + Math.cos(rad) * ringR
            const y = cy + Math.sin(rad) * ringR
            // Label position: outside circle along the radial direction
            const dx = x - cx, dy = y - cy
            const len = Math.hypot(dx, dy)
            const lx = x + (dx / len) * (blocR + 14)
            const ly = y + (dy / len) * (blocR + 14)
            const anchor = lx > cx + 8 ? 'start' : lx < cx - 8 ? 'end' : 'middle'
            return (
              <g key={`b-${i}`}>
                <circle cx={x} cy={y} r={blocR} fill="#e879f9" fillOpacity="0.16" stroke="#e879f9" strokeWidth="1.5" />
                <text x={x} y={y + 3.5} textAnchor="middle" fontSize="10.5" fontFamily="system-ui, sans-serif"
                  fontWeight="700" fill="#f0abfc" pointerEvents="none">{b.label.split(' ')[0]}</text>
                <text x={lx} y={ly} textAnchor={anchor} fontSize="10" fontFamily="system-ui, sans-serif"
                  fill="#cbd5e1" pointerEvents="none">{b.label}</text>
                {b.subLabel && (
                  <text x={lx} y={ly + 12} textAnchor={anchor} fontSize="9" fontFamily="system-ui, sans-serif"
                    fill="#888" pointerEvents="none">{b.subLabel}</text>
                )}
              </g>
            )
          })}
        </svg>
      </Link>
      <div className="text-center mt-3">
        <Link to="/graph?lens=capture"
          className="inline-flex items-center gap-2 text-sm font-sans"
          style={{ color: 'var(--accent)' }}>
          Open the full capture lens →
        </Link>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    // Parent Layout uses `flex justify-center` to anchor this block — so it's
    // a flex item bounded by max-w. No w-full / no mx-auto on this side.
    <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-12 py-8 leading-relaxed text-center"
         style={{ fontFamily: "Georgia, 'Times New Roman', Times, serif", color: 'var(--text)' }}>

      {/* HERO — centered text within the page container, larger headline */}
      <header className="text-center pt-12 pb-10"
              style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="font-sans text-xs uppercase tracking-[0.35em] mb-5" style={{ color: 'var(--accent)' }}>
          A structural map of power
        </div>
        <h1 className="font-sans text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]"
            style={{ color: 'var(--text-bright)' }}>
          Seven blocs.<br />
          One contested institution.<br />
          A receipt on every edge.
        </h1>
        <p className="text-lg max-w-[52ch] mx-auto text-center"
           style={{ color: 'var(--text-muted)', textAlign: 'center', textWrap: 'balance' }}>
          Constitutional government isn't acted on in the abstract. It is lobbied, donated to,
          and authored at — every day, by organized blocs, in measurable amounts. This map renders
          those edges from public record and refuses to draw the ones it cannot cite.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 font-sans">
          <Link to="/graph?lens=capture"
            className="px-5 py-2 rounded text-sm font-semibold transition-colors"
            style={{ background: 'var(--accent)', color: '#0b0b12' }}>
            See who benefits →
          </Link>
          <a href="#thesis"
            className="px-5 py-2 rounded text-sm font-semibold transition-colors hover:bg-white/5"
            style={{ border: '1px solid var(--accent-dim)', color: 'var(--text-bright)' }}>
            Read the thesis ↓
          </a>
          <Link to="/common-sense"
            className="px-5 py-2 rounded text-sm font-semibold transition-colors hover:bg-white/5"
            style={{ border: '1px solid var(--accent-dim)', color: 'var(--text-bright)' }}>
            Common Sense, 2026
          </Link>
        </div>
      </header>

      {/* STAT STRIP — fills the page-container width */}
      <section className="mt-10">
        <div className="font-sans text-xs uppercase tracking-[0.25em] text-center mb-6"
          style={{ color: 'var(--text-muted)' }}>
          What the receipts say
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {STATS.map(s => <StatTile key={s.label} {...s} />)}
        </div>
      </section>

      {/* CAPTURE TEASER — bounded so the SVG keeps its proportions */}
      <section className="mt-12 max-w-3xl mx-auto">
        <div className="font-sans text-xs uppercase tracking-[0.25em] text-center mb-6"
          style={{ color: 'var(--text-muted)' }}>
          Who acts on the institution
        </div>
        <CaptureTeaser />
        <p className="text-center text-sm mt-3 italic" style={{ color: 'var(--text-muted)' }}>
          A simplified slice. The live graph adds incentive edges, primary-source documents,
          named persons under EFTA disclosure, and the rest of the geopolitical layer.
        </p>
      </section>

      {/* Long-form prose: centered narrow column for readability + justified paragraphs.
          text-center cascades from the outer container; paragraphs override to text-justify
          so individual lines stretch to both edges while the block stays centered. */}
      <div className="max-w-[74ch] mx-auto mt-12 [&_p]:text-justify [&_p]:hyphens-auto">

      {/* Thesis */}
      <Section id="thesis" title="Thesis">
        <p className="mb-2">The project stands plainly for four commitments — and against their opposites:</p>
        <Principle label="Anti-capture">
          Public institutions should answer to the public, not to whichever organized interest spends the most to bend them.
        </Principle>
        <Principle label="Anti-consolidation">
          Power concentrated past accountability is a defect regardless of who holds it.
        </Principle>
        <Principle label="Anti-subordination of constitutional government">
          The constitutional order should not be made an instrument of any private or factional agenda.
        </Principle>
        <Principle label="Non-partisan by construction">
          These commitments are applied symmetrically, or they are worthless.
        </Principle>
      </Section>

      {/* Symmetry */}
      <Section title="The load-bearing word is symmetrically">
        <p className="mb-3">
          An anti-capture instrument with a single designated villain is not anti-capture; it is the very thing it
          claims to oppose, wearing a mask. So the map judges blocs by <strong style={{ color: 'var(--text-bright)' }}>measurable
          behavior</strong> — money spent, bills lobbied, documents authored, positions revolved through — and
          <strong style={{ color: 'var(--text-bright)' }}> never by identity</strong>: ethnic, religious, national, or partisan.
        </p>
        <p>
          A foreign-aligned lobby, a domestic trade association, an ideological think tank, and a religious mobilization
          network appear as the same kind of object, rendered the same way, held to the same evidentiary bar. There is no
          protected bloc and no pre-assigned guilty one. The unit of analysis is the edge, not the actor.
        </p>
      </Section>

      {/* Discipline */}
      <Section title="Evidentiary discipline">
        <ol className="space-y-3 list-none">
          <li><span className="font-sans font-bold" style={{ color: 'var(--accent)' }}>1 · No edge without provenance.</span> Every
            relationship that carries weight cites a real source, a short span quote, and a date. Claims you cannot cite are not drawn.</li>
          <li><span className="font-sans font-bold" style={{ color: 'var(--accent)' }}>2 · Observable acts only.</span> Relations are
            limited to things that happened and can be checked. The map does not encode imputed coordinated intent, secret plans,
            or motive a source does not state.</li>
          <li><span className="font-sans font-bold" style={{ color: 'var(--accent)' }}>3 · Parallel is not cause.</span> Where a
            relationship is correlational or unconfirmed, it is labeled as such and weighted low — not promoted to a causal arrow.</li>
          <li><span className="font-sans font-bold" style={{ color: 'var(--accent)' }}>4 · Primary sources stand on their own.</span> Strategy
            manuscripts — including Project Esther and Project 2025, both Heritage Foundation documents — are described by their
            verifiable contents and bylines, not by anyone's characterization of them.</li>
        </ol>
      </Section>

      {/* Capture layer */}
      <Section title="The capture layer">
        <p className="mb-3">
          A symmetric sub-graph in which multiple organized blocs exert influence on one contested institution —
          constitutional government. The seed deliberately spans the spectrum so no bloc stands alone: the pro-Israel
          lobby and Christian-Zionist mobilization sit beside the US Chamber of Commerce, the realtors, pharma, and the
          defense primes — each with campaign-finance and lobbying magnitudes drawn from FEC and OpenSecrets filings.
        </p>
        <p>
          If a single bloc were ever removed to soften the picture, or added only to indict, the layer would have failed
          its own test. <strong style={{ color: 'var(--text-bright)' }}>Read the spread, not the single node.</strong>
        </p>
      </Section>

      {/* What it is not */}
      <Section title="What this is not">
        <ul className="space-y-2 list-none" style={{ color: 'var(--text-muted)' }}>
          <li>Not a forecast engine. The map asserts only structure it can show.</li>
          <li>Not a vehicle for any party, government, or creed.</li>
          <li>Not a place for unsourced suspicion. Suspicion is a prompt to find the receipt, not a license to draw the edge.</li>
        </ul>
      </Section>

      <div className="text-center mt-14 mb-6 font-sans">
        <Link to="/graph?lens=capture"
          className="px-6 py-2.5 rounded text-sm font-semibold transition-colors inline-block"
          style={{ background: 'var(--accent)', color: '#0b0b12' }}>
          See who benefits →
        </Link>
      </div>

      </div>{/* /reading-width wrapper */}
    </div>
  )
}
