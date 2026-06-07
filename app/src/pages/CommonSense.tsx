import { useEffect, useState } from 'react'
import { footnotes, resources } from '../data/common-sense'
import type { Footnote } from '../data/common-sense'

// O(1) footnote lookup so Fn doesn't scan the array on every render.
const FOOTNOTE_MAP = new Map<number, Footnote>(footnotes.map(f => [f.id, f]))

// slug derived from a section title — kept stable so the URL hash and TOC
// agree without each call site having to pass an explicit id.
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function Fn({ n }: { n: number }) {
  const fn = FOOTNOTE_MAP.get(n)
  return (
    <sup className="relative group inline-block leading-none align-baseline">
      <a href={`#fn${n}`} id={`r${n}`}
         className="text-amber-700 hover:text-amber-500 no-underline px-0.5 focus:outline-none focus:ring-1 focus:ring-amber-600 rounded-sm"
         aria-label={`Footnote ${n}${fn ? ': ' + fn.text.slice(0, 80) : ''}`}>
        {n}
      </a>
      {fn && (
        <span role="tooltip"
          className="invisible opacity-0 group-hover:visible group-hover:opacity-100 focus-within:visible focus-within:opacity-100
                     absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50
                     w-[320px] max-w-[80vw] text-left text-[12.5px] normal-case font-normal
                     bg-[var(--bg-elevated)] border border-amber-700/40 rounded-md p-3
                     text-[var(--text)] shadow-lg
                     transition-opacity duration-150 print:hidden">
          <span className="text-amber-700 font-semibold">[{n}]</span>{' '}
          {fn.text}{' '}
          {fn.url && <a href={fn.url} target="_blank" rel="noopener noreferrer"
                        className="text-amber-700 underline break-all">{fn.url}</a>}
        </span>
      )}
    </sup>
  )
}

// Scroll-position-driven progress bar at the very top of the viewport.
function ProgressBar() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setPct(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[150] print:hidden pointer-events-none" aria-hidden>
      <div className="h-full bg-amber-600 transition-[width] duration-150" style={{ width: `${pct}%` }} />
    </div>
  )
}

// TocRail: queries h2[id] in the article after mount, lists them with anchor
// links, and uses IntersectionObserver to highlight the current section.
// Fixed left rail at xl+; hidden below to avoid crowding the prose column.
function TocRail() {
  const [items, setItems] = useState<{ id: string; title: string }[]>([])
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const h2s = Array.from(document.querySelectorAll<HTMLHeadingElement>('article h2[id]'))
    // DOM-after-mount lookup; no input source available before render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(h2s.map(h => ({ id: h.id, title: h.textContent ?? '' })))

    if (h2s.length === 0) return
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting)
      if (visible.length === 0) return
      const topmost = visible.reduce((a, b) =>
        a.boundingClientRect.top < b.boundingClientRect.top ? a : b)
      setActive(topmost.target.id)
    }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 })
    h2s.forEach(h => observer.observe(h))
    return () => observer.disconnect()
  }, [])

  if (items.length === 0) return null
  return (
    <nav className="hidden xl:block fixed left-6 top-24 w-[220px] text-xs print:hidden"
         aria-label="Table of contents">
      <div className="font-sans font-bold text-[var(--text-muted)] uppercase tracking-[0.18em] mb-2 text-[10px]">Contents</div>
      <ul className="space-y-0.5 border-l border-[var(--border)]">
        {items.map(item => {
          const isActive = active === item.id
          return (
            <li key={item.id}>
              <a href={`#${item.id}`}
                 className={`block pl-3 py-1 -ml-px border-l-2 no-underline transition-colors ${
                   isActive
                     ? 'border-amber-600 text-[var(--text-bright)]'
                     : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border)]'
                 }`}
                 style={{ fontWeight: isActive ? 600 : 400 }}>
                {item.title}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function Epigraph({ children, attribution }: { children: React.ReactNode; attribution: React.ReactNode }) {
  return (
    <div className="border-l-[3px] border-amber-900/60 bg-[var(--bg-elevated)] rounded-r px-6 py-4 my-6">
      <p className="italic text-[var(--text-muted)] text-[1.05rem] leading-relaxed mb-1">{children}</p>
      <div className="text-right text-sm text-amber-700">{attribution}</div>
    </div>
  )
}

function Quote({ children, attribution }: { children: React.ReactNode; attribution: React.ReactNode }) {
  return (
    <blockquote className="border-l-[3px] border-amber-600 bg-[var(--bg-elevated)] rounded-r px-6 py-4 my-6">
      <p className="italic text-[var(--text-bright)] leading-relaxed mb-1">{children}</p>
      <div className="text-right text-sm text-amber-700">{attribution}</div>
    </blockquote>
  )
}

function Divider() {
  return <div className="text-center text-[var(--text-muted)] my-8 tracking-[0.5em]">• • •</div>
}

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  const sid = id ?? slugify(title)
  return (
    <>
      <h2 id={sid} className="font-sans text-2xl font-bold text-[var(--text-bright)] mt-12 mb-4 pb-2 border-b border-[var(--border)] tracking-wide scroll-mt-24">{title}</h2>
      {children}
      <Divider />
    </>
  )
}

export default function CommonSense() {
  return (
    <>
      <ProgressBar />
      <TocRail />
      <article className="max-w-[72ch] mx-auto px-4 sm:px-6 py-8 font-serif leading-relaxed text-[var(--text)] text-[0.95rem] sm:text-[1rem]" style={{ fontFamily: "Georgia, 'Times New Roman', Times, serif" }}>

      {/* HERO: FRANKLIN */}
      <div className="text-center pt-14 pb-10 border-b border-[var(--border)] mb-8">
        <p className="italic text-[var(--text-muted)] text-lg mb-3">
          "Well, Doctor, what have we got—a Republic or a Monarchy?"
        </p>
        <p className="text-[var(--text-bright)] text-2xl font-semibold tracking-wide mb-4">
          "A Republic, madam—if you can keep it."
        </p>
        <p className="font-sans text-xs text-[var(--text-muted)] leading-relaxed">
          Elizabeth Willing Powel to Benjamin Franklin<br />
          September 17, 1787 · Upon leaving the Constitutional Convention<br />
          <span className="text-amber-900/60 text-[0.7rem]">Documented in the papers of James McHenry, Maryland delegate. National Archives.</span>
        </p>
      </div>

      {/* TITLE */}
      <div className="text-center pt-4 pb-8">
        <h1 className="font-sans text-4xl font-bold text-[var(--text-bright)] tracking-wider uppercase">Common Sense</h1>
        <p className="italic text-[var(--text-muted)] mt-2">The Public Record on Executive Power in America</p>
        <p className="font-sans text-xs text-[var(--text-muted)] mt-1 uppercase tracking-widest">February 2026</p>
      </div>

      {/* I. PROLOGUE */}
      <Section title="I. Prologue">
        <p className="mb-4">What follows is not opinion. It is not partisan. It belongs to no faction.</p>
        <p className="mb-4">It is a compilation of verifiable public record—court filings, government documents, published policy proposals, confirmed appointments, and reporting from established news organizations—about the architecture of executive power consolidation in the United States as of February 2026.</p>
        <p className="mb-4">The record speaks for itself. Every factual claim is footnoted to its source. The reader is urged to verify independently. This document was written for every citizen of the republic—regardless of party, background, or belief—because the Constitution belongs to all of us.</p>
        <Epigraph attribution={<>— Thomas Paine, <em>Common Sense</em> (1776)<Fn n={1} /></>}>
          "A long habit of not thinking a thing wrong, gives it a superficial appearance of being right, and raises at first a formidable outcry in defence of custom. But the tumult soon subsides. Time makes more converts than reason."
        </Epigraph>
      </Section>

      {/* II. THE ARCHITECT */}
      <Section title="II. The Architect: Russell Vought — Public Record">
        <p className="mb-4">Russell Thurlow Vought was born in 1976 in New York.<Fn n={4} /> He attended Wheaton College, an evangelical Christian institution in Illinois, and earned his law degree from George Washington University Law School in 2004.<Fn n={4} /></p>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">Career Timeline</h3>
        <ul className="space-y-3 mb-6">
          {[
            { date: "Late 1990s–2000s", text: <>Staffer for Senator Phil Gramm (R-TX) and the Republican Study Committee, the conservative caucus of the House.<Fn n={4} /></> },
            { date: "2010", text: <>Co-founded Heritage Action for America with Michael Needham, the lobbying arm of the Heritage Foundation, designed to pressure Republican lawmakers toward harder-right positions.<Fn n={5} /></> },
            { date: "2013", text: <>Key strategist behind the federal government shutdown over Affordable Care Act funding, working through Heritage Action and Tea Party-aligned networks.<Fn n={5} /></> },
            { date: "2018", text: <>Appointed Deputy Director of the Office of Management and Budget (OMB).<Fn n={4} /></> },
            { date: "2018–2020", text: <>Served as Acting OMB Director after Mick Mulvaney departed.<Fn n={4} /></> },
            { date: "2020–2021", text: <>Confirmed as OMB Director, serving through the end of the first Trump administration.<Fn n={4} /></> },
            { date: "2021", text: <>Founded the Center for Renewing America (CRA), a policy organization focused on "renewing a consensus of America as a nation under God" and advancing unitary executive theory.<Fn n={6} /></> },
            { date: "2023–2024", text: <>Led the policy development for Project 2025, the Heritage Foundation's presidential transition project.<Fn n={7} /></> },
            { date: "February 2025", text: <>Confirmed as OMB Director for the second time. Simultaneously designated Acting Director of the Consumer Financial Protection Bureau (CFPB).<Fn n={4} /><Fn n={8} /></> },
            { date: "Aug–Nov 2025", text: <>Named Acting USAID Administrator, controlling U.S. international development aid while retaining OMB authority.<Fn n={4} /></> },
          ].map((item, i) => (
            <li key={i} className="pl-4 border-l-2 border-amber-900/40">
              <span className="font-sans text-xs font-bold text-amber-700 uppercase tracking-wider">{item.date}</span>
              <span className="text-[var(--text-muted)]"> — </span>{item.text}
            </li>
          ))}
        </ul>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">Unprecedented Concentration</h3>
        <p className="mb-4">The simultaneous control of OMB (the federal government's budget authority), the CFPB (consumer financial regulation), and USAID (international aid distribution) by a single individual has no precedent in modern American governance.<Fn n={8} /> OMB alone reviews every significant federal regulation before publication and controls the budget submissions of every executive agency.<Fn n={9} /></p>
        <p className="mb-4">Vought has described his own framework as that of a "radical constitutionalist," by which he means aggressive use of existing executive authority to restructure the federal government without new legislation.<Fn n={6} /> In practice, this translates to using OMB's regulatory review power and budget authority to reshape or defund agencies whose missions conflict with the administration's priorities.</p>
        <p className="mb-4">In January 2026, the Center for Renewing America filed an amicus curiae brief in <em>Trump v. Barbara</em>, the birthright citizenship case before the Supreme Court, arguing for a reinterpretation of the Fourteenth Amendment.<Fn n={10} /></p>
      </Section>

      {/* III. THE BLUEPRINT */}
      <Section title="III. The Blueprint: Project 2025">
        <p className="mb-4"><em>Mandate for Leadership: The Conservative Promise</em> was published in April 2023 by the Heritage Foundation. It runs 920 pages and represents the collaborative work of over 100 conservative organizations.<Fn n={7} /></p>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">Core Proposals</h3>
        <p className="mb-4">The document, publicly available in full, proposes the following structural changes to the federal government:<Fn n={7} /><Fn n={11} /></p>
        <ul className="space-y-2 mb-6 list-disc pl-6">
          <li><strong>Replace career civil servants with political loyalists</strong> — Using reclassification of civil service positions (Schedule F, discussed in Section V) to remove tens of thousands of career employees and replace them with vetted appointees.</li>
          <li><strong>Partisan control of law enforcement and regulation</strong> — Bring the Department of Justice, FBI, Federal Trade Commission, and Department of Commerce under direct presidential political control.</li>
          <li><strong>Dismantle agencies</strong> — Eliminate or radically restructure the Department of Homeland Security and the Department of Education.</li>
          <li><strong>Environmental deregulation</strong> — Roll back climate and environmental regulations across EPA, Interior, and Energy departments.</li>
          <li><strong>Restructure health research</strong> — Realign the National Institutes of Health with conservative policy priorities.</li>
          <li><strong>Tax and entitlement restructuring</strong> — Move toward a flat income tax and reduce Medicare and Medicaid spending.</li>
          <li><strong>Social policy</strong> — Ban pornography, remove federal LGBT protections, eliminate DEI programs across the government.</li>
          <li><strong>Immigration</strong> — Mass deportation operations and border militarization.</li>
          <li><strong>Reproductive policy</strong> — Restrict or criminalize access to abortion medication.</li>
        </ul>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">The Personnel System</h3>
        <p className="mb-4">Central to Project 2025 is a personnel database and vetting operation designed to identify, train, and place thousands of loyalists into government positions on day one. The guiding maxim, attributed to the Reagan era: <strong>"Personnel is policy."</strong><Fn n={11} /></p>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">Implementation</h3>
        <p className="mb-4">According to an analysis by <em>Time</em> magazine, nearly two-thirds of the executive actions taken in the first weeks of the second Trump administration directly mirrored Project 2025 proposals.<Fn n={12} /></p>
        <p className="mb-4">During the 2024 campaign, then-candidate Trump publicly distanced himself from Project 2025, stating he had "nothing to do with" it.<Fn n={7} /> He subsequently appointed multiple Project 2025 authors and contributors to senior administration positions, including Vought himself.<Fn n={12} /></p>
        <p className="mb-4">Vice President JD Vance wrote the foreword to <em>Dawn's Early Light</em>, a book by Heritage Foundation president Kevin Roberts published in 2024.<Fn n={13} /></p>
        <p className="mb-4">The entire theoretical foundation of Project 2025 rests on a legal doctrine: the <em>unitary executive theory</em>.</p>
      </Section>

      {/* IV. THE MECHANISM */}
      <Section title="IV. The Mechanism: Unitary Executive Theory">
        <p className="mb-4">The unitary executive theory holds that the President possesses sole and complete authority over the entire executive branch. All executive power, in this reading, flows from and is controlled by the president personally.<Fn n={14} /></p>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">The Textual Argument</h3>
        <p className="mb-4">Proponents cite Article II, Section 1: <em>"The executive Power shall be vested in a President of the United States of America."</em> They argue the definite article "the" means <em>all</em> executive power, without exception, belongs to the president alone.<Fn n={14} /></p>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">What the Framers Actually Said</h3>
        <p className="mb-4">The authors of the Constitution left extensive written records. The Federalist Papers are the most authoritative contemporaneous source:</p>

        <Quote attribution={<>— James Madison, Federalist No. 47 (1788)<Fn n={15} /></>}>
          "The accumulation of all powers, legislative, executive, and judiciary, in the same hands, whether of one, a few, or many, and whether hereditary, self-appointed, or elective, may justly be pronounced the very definition of tyranny."
        </Quote>

        <p className="mb-4">Hamilton devoted the entirety of Federalist No. 69 to distinguishing the proposed president from the British monarch, point by point—limited term vs. life tenure, impeachable vs. inviolable, shared treaty power vs. sole prerogative:<Fn n={16} /></p>

        <Quote attribution={<>— Alexander Hamilton, Federalist No. 69<Fn n={16} /></>}>
          "The President is to be commander-in-chief of the army and navy of the United States. In this respect his authority would be nominally the same with that of the king of Great Britain, but in substance much inferior to it."
        </Quote>

        <Quote attribution={<>— Federalist No. 51<Fn n={17} /></>}>
          "Ambition must be made to counteract ambition. The interest of the man must be connected with the constitutional rights of the place. It may be a reflection on human nature, that such devices should be necessary to control the abuses of government."
        </Quote>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">The Opinion Clause Problem</h3>
        <p className="mb-4">Article II, Section 2 states the president "may require the Opinion, in writing, of the principal Officer in each of the executive Departments." If the president already possessed total control, why would the framers need to specify he could ask for opinions? The clause implies departments have independent standing.<Fn n={14} /></p>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">The Take Care Clause</h3>
        <p className="mb-4">Article II, Section 3: the president "shall take Care that the Laws be faithfully executed." This imposes a <em>duty</em>, not a power. "Faithfully" means executing laws as written and as interpreted by courts, whether or not the president agrees.<Fn n={14} /></p>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">Scholarly Assessment</h3>
        <p className="mb-4">Lessig and Sunstein (1994): <em>"No one denies that in some sense the framers created a unitary executive; the question is in what sense."</em><Fn n={18} /> The "weak" version is uncontroversial. The "strong" version—that the president personally controls every executive function—is the contested claim.</p>
        <p className="mb-4">Law professor Daniel Birk has noted there is no historical evidence the British king possessed the domestic powers the strong theory claims for the American president.<Fn n={19} /></p>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">Political History</h3>
        <p className="mb-4">The strong unitary executive theory was not significant until the Reagan administration. Since the 1980s, it has been championed by the Federalist Society and the Heritage Foundation.<Fn n={14} /> In the 2020s, the Supreme Court issued a 5–4 ruling stating "the entire 'executive Power' belongs to the President alone."<Fn n={20} /></p>
      </Section>

      {/* V. THE INSTRUMENT */}
      <Section title="V. The Instrument: Schedule F / Schedule Policy/Career">
        <p className="mb-4">On October 21, 2020, President Trump signed Executive Order 13957, creating "Schedule F." Biden revoked it on his second day in office. It was reinstated in 2025 and an updated rule issued February 2026.<Fn n={21} /><Fn n={22} /></p>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">What It Does</h3>
        <p className="mb-4">Schedule Policy/Career reclassifies federal career civil servants in "policy-influencing" positions from the competitive civil service—where they have employment protections and due process rights—into a category where they can be hired and fired at will.<Fn n={21} /></p>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">Scale</h3>
        <p className="mb-4">Estimates range from tens of thousands to hundreds of thousands of positions affected, out of 2.2 million federal civilian employees. Current political appointments number roughly 4,000. Schedule Policy/Career could increase that by a factor of ten or more.<Fn n={21} /><Fn n={22} /></p>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">The Loyalty Test</h3>
        <p className="mb-4">The 2025 version added that failure to "faithfully implement administration policies" constitutes grounds for dismissal.<Fn n={22} /> The rule officially states employees don't need to "personally or politically support the current President."<Fn n={22} /> Critics note this distinction is illusory: if an employee can be removed for failing to implement a policy they consider unlawful, the practical effect is a loyalty requirement.<Fn n={23} /></p>
      </Section>

      {/* VI. THE JUDICIARY */}
      <Section title="VI. The Judiciary: Shadow Docket and Active Cases">
        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">The Shadow Docket</h3>
        <p className="mb-4">The term was coined by University of Chicago law professor William Baude in 2015 to describe the Court's practice of issuing significant orders without full briefing, oral argument, or signed opinions.<Fn n={24} /></p>
        <p className="mb-4">Justice Kagan, dissenting in <em>Whole Woman's Health v. Jackson</em> (2021): the shadow docket was "every day becoming more unreasoned, inconsistent, and impossible to defend."<Fn n={25} /></p>
        <p className="mb-4">Justice Alito responded that the term was "sinister" and "intended to convey the impression" that the Court had been "captured by a dangerous cabal."<Fn n={24} /></p>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">1. Trump v. Slaughter — Independent Agencies</h3>
        <p className="mb-4">Whether the President can fire FTC commissioners at will, overturning <em>Humphrey's Executor</em> (1935). If overturned, the president gains power to dismiss heads of <em>all</em> independent agencies—the Fed, SEC, FCC, NLRB. The Court granted certiorari before judgment <em>and</em> stayed the lower court. Kagan, Sotomayor, and Jackson dissented.<Fn n={26} /></p>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">2. Trump v. Barbara — Birthright Citizenship</h3>
        <p className="mb-4">Challenges the Fourteenth Amendment's Citizenship Clause—128 years of precedent since <em>Wong Kim Ark</em> (1898). The Center for Renewing America filed an amicus brief in January 2026.<Fn n={10} /><Fn n={27} /></p>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">3. National Guard — Illinois</h3>
        <p className="mb-4">Court denied the stay but explicitly left the Insurrection Act pathway open. Analysis notes this could provide "cover" for future invocation.<Fn n={28} /></p>
      </Section>

      {/* VII. THE PATTERN */}
      <Section title="VII. The Pattern: Actions Speak">
        <p className="mb-4">A timeline of documented executive actions—not rhetoric, not proposals, but actions taken:</p>
        <ul className="space-y-3 mb-6">
          {[
            { date: "February 2025", text: <>Vought confirmed as OMB Director; simultaneously designated Acting CFPB Director.<Fn n={4} /><Fn n={8} /></> },
            { date: "Early 2025", text: <>Inspectors general fired across multiple federal agencies, removing independent oversight.<Fn n={29} /></> },
            { date: "2025", text: <>DOGE, led by Elon Musk, systematically restructures federal agencies.<Fn n={30} /></> },
            { date: "2025", text: <>Career staff purges across the federal government.<Fn n={30} /></> },
            { date: "2025", text: <>Schedule F / Schedule Policy reinstated.<Fn n={22} /></> },
            { date: "Aug–Nov 2025", text: <>Vought serves as Acting USAID Administrator while retaining OMB authority.<Fn n={4} /></> },
            { date: "2025", text: <>National Guard federalized and deployed to Chicago; challenged in court.<Fn n={28} /></> },
            { date: "January 2026", text: <>Supreme Court accepts Trump v. Barbara (birthright citizenship).<Fn n={27} /></> },
            { date: "February 2026", text: <>Updated Schedule Policy/Career rule issued.<Fn n={22} /></> },
            { date: "February 2026", text: <>SCOTUSBlog: "The federal court snapback: The judiciary, including the Supreme Court, is standing up to the president."<Fn n={31} /></> },
          ].map((item, i) => (
            <li key={i} className="pl-4 border-l-2 border-amber-900/40">
              <span className="font-sans text-xs font-bold text-amber-700 uppercase tracking-wider">{item.date}</span>
              <span className="text-[var(--text-muted)]"> — </span>{item.text}
            </li>
          ))}
        </ul>
        <p className="mb-4">Each action is individually documented. Taken together, the pattern is: consolidate budgetary power in one person, remove independent oversight, reclassify the civil service as political employees, seek judicial ratification of expanded executive authority, and deploy military assets domestically.</p>
      </Section>

      {/* VIII. WHAT THE FRAMERS BUILT */}
      <Section title="VIII. What the Framers Built — and Why">
        <p className="mb-4">The Constitution is, at its core, an engineering document. Its primary principle is the <em>separation of powers</em>—the deliberate distribution of authority across three co-equal branches, each able to check the others.</p>
        <p className="mb-4">This is not inefficiency. It is the core design feature, built by men who had lived under consolidated executive power and designed a system specifically to prevent its recurrence.<Fn n={15} /></p>

        <ul className="space-y-2 mb-6 list-disc pl-6">
          <li><strong>Three branches</strong> — Legislative (Article I), Executive (Article II), Judicial (Article III)—each with enumerated powers, each capable of checking the others.</li>
          <li><strong>Federalism</strong> — Power divided between federal and state governments (Tenth Amendment).</li>
          <li><strong>Bill of Rights</strong> — The first ten amendments are <em>constraints on government power</em>. They enumerate things the government <em>may not do</em>.</li>
          <li><strong>Article V</strong> — The amendment process is deliberately difficult—requiring two-thirds of Congress and three-fourths of state legislatures—to prevent temporary majorities from reshaping fundamental law.</li>
        </ul>

        <Quote attribution={<>— Federalist No. 51<Fn n={17} /></>}>
          "If men were angels, no government would be necessary. If angels were to govern men, neither external nor internal controls on government would be necessary. In framing a government which is to be administered by men over men, the great difficulty lies in this: you must first enable the government to control the governed; and in the next place oblige it to control itself."
        </Quote>

        <p className="mb-4">The system was designed by people who assumed that power <em>would</em> be abused. Every check, every friction point exists because the framers understood what happens when one person or faction accumulates unchecked authority.</p>
        <p className="mb-4">Madison, in Federalist No. 47, was explicit: the accumulation of legislative, executive, and judicial power in the same hands is "the very definition of tyranny."<Fn n={15} /> Hamilton, in Federalist No. 69, went point by point through every way the president was <em>not</em> a king.<Fn n={16} /> These were the sales pitch to the American public for why this system should be adopted.</p>
      </Section>

      {/* IX. THE CITIZEN'S DUTY */}
      <Section title="IX. The Citizen's Duty">
        <p className="mb-4">In the American system, sovereignty does not rest with the president, Congress, or the courts. It rests with the people. The republic's health depends entirely on whether its sovereign—the citizenry—exercises its duty.</p>

        <Epigraph attribution={<>— Giuseppe Mazzini, <em>The Duties of Man</em><Fn n={3} /></>}>
          "Your first duties—first as regards importance—are, as I have already told you, towards Humanity. … But what can each of you, singly, do for the moral improvement and progress of Humanity? … The individual is too insignificant, and Humanity too vast."
        </Epigraph>

        <p className="mb-4">Mazzini's point was that rights without civic duty produce empty liberty. Paine's purpose in writing <em>Common Sense</em> was to make the case so clearly that ordinary people could see through the mystifications of power. Jefferson wrote that "the spirit of resistance to government is so valuable on certain occasions, that I wish it to be always kept alive."<Fn n={32} /></p>

        <p className="mb-4">Every claim in this document is sourced. Every source is publicly accessible.</p>

        <p className="mb-4">Franklin was asked what kind of government the Convention had created. His answer was not a guarantee. It was a condition. The republic is ours—if we can keep it. That <em>if</em> is not addressed to politicians, judges, or generals. It is addressed to you.</p>

        <h3 className="font-sans text-lg font-semibold text-amber-700 mt-8 mb-3">Read the Sources</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-6">
          {resources.map((r) => (
            <a key={r.url} href={r.url} rel="noopener noreferrer" target="_blank"
               className="block bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-4 text-center no-underline hover:border-amber-700 transition-colors">
              <div className="text-[var(--text-bright)] font-sans text-sm font-semibold">{r.title}</div>
              <div className="text-[var(--text-muted)] text-xs mt-1">{r.subtitle}</div>
            </a>
          ))}
        </div>
      </Section>

      {/* FOOTNOTES */}
      <div className="mt-12 pt-8 border-t border-[var(--border)]">
        <h2 className="font-sans text-lg font-bold text-[var(--text-muted)] mb-4">Sources</h2>
        <ol className="space-y-2 text-sm text-[var(--text-muted)] leading-relaxed">
          {footnotes.map((fn) => (
            <li key={fn.id} id={`fn${fn.id}`} className="pl-2">
              <span className="text-amber-700 font-semibold">[{fn.id}]</span>{' '}
              {fn.text}{' '}
              {fn.url && <a href={fn.url} rel="noopener noreferrer" target="_blank" className="text-amber-700 hover:text-amber-500 break-all">{fn.url}</a>}
              {' '}<a href={`#r${fn.id}`} className="text-[var(--text-muted)] no-underline">↑</a>
            </li>
          ))}
        </ol>
      </div>

      {/* FOOTER */}
      <div className="mt-16 pt-8 border-t border-[var(--border)] text-center">
        <p className="font-semibold text-[var(--text-muted)]">This document contains no editorial opinion.</p>
        <p className="text-sm text-[var(--text-muted)] mt-2">Every claim is sourced to public record, court filings, government documents, or reputable reporting. Read the sources. Verify independently.</p>
        <p className="text-[var(--text-muted)] mt-2">The republic belongs to those who defend it.</p>
        <p className="mt-6 text-lg italic text-amber-700 tracking-wide">— Publius</p>
        <p className="mt-4 text-xs text-[var(--text-muted)]">February 2026 · Common Sense, 2026</p>
      </div>
      </article>
    </>
  )
}
