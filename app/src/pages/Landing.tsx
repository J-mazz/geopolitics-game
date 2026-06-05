import { Link } from 'react-router-dom'

function Principle({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-l-[3px] pl-4 my-4" style={{ borderColor: 'var(--accent-dim)' }}>
      <div className="font-sans font-bold tracking-wide" style={{ color: 'var(--text-bright)' }}>{label}</div>
      <div className="text-[0.98rem] leading-relaxed" style={{ color: 'var(--text)' }}>{children}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-sans text-2xl font-bold mb-4 pb-2 tracking-wide"
          style={{ color: 'var(--text-bright)', borderBottom: '1px solid var(--border)' }}>{title}</h2>
      {children}
    </section>
  )
}

export default function Landing() {
  return (
    <div className="max-w-[74ch] mx-auto px-6 py-8 leading-relaxed"
         style={{ fontFamily: "Georgia, 'Times New Roman', Times, serif", color: 'var(--text)' }}>

      {/* Hero */}
      <div className="text-center pt-14 pb-10" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="font-sans text-xs uppercase tracking-[0.35em] mb-4" style={{ color: 'var(--accent)' }}>
          A structural map of power
        </div>
        <h1 className="font-sans text-4xl md:text-5xl font-bold tracking-wide mb-5" style={{ color: 'var(--text-bright)' }}>
          Who is connected to what,<br />and who benefits.
        </h1>
        <p className="text-lg max-w-[58ch] mx-auto" style={{ color: 'var(--text-muted)' }}>
          Not a predictor. Not an editorial. A map that renders the relationships, the money, the events, and the
          incentives that move them — and attaches a receipt to every claim that carries weight.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 font-sans">
          <Link to="/graph"
            className="px-5 py-2 rounded text-sm font-semibold transition-colors"
            style={{ background: 'var(--accent)', color: '#0b0b12' }}>
            Enter the graph →
          </Link>
          <Link to="/common-sense"
            className="px-5 py-2 rounded text-sm font-semibold transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            Read Common Sense, 2026
          </Link>
        </div>
      </div>

      {/* Thesis */}
      <Section title="Thesis">
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
        <ul className="space-y-2 list-disc pl-5" style={{ color: 'var(--text-muted)' }}>
          <li>Not a forecast engine. The map asserts only structure it can show.</li>
          <li>Not a vehicle for any party, government, or creed.</li>
          <li>Not a place for unsourced suspicion. Suspicion is a prompt to find the receipt, not a license to draw the edge.</li>
        </ul>
      </Section>

      <div className="text-center mt-14 mb-6 font-sans">
        <Link to="/graph"
          className="px-6 py-2.5 rounded text-sm font-semibold transition-colors inline-block"
          style={{ background: 'var(--accent)', color: '#0b0b12' }}>
          Enter the graph →
        </Link>
      </div>
    </div>
  )
}
