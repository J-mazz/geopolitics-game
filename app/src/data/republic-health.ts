export interface Indicator {
  name: string
  score: number
  status: 'critical' | 'warning' | 'watch' | 'holding'
  detail: string
  date: string
}

export interface Pillar {
  id: string
  name: string
  icon: string
  weight: number
  indicators: Indicator[]
  score?: number
}

export interface TimelineItem {
  date: string
  level: 'critical' | 'warning' | 'watch' | 'holding'
  title: string
  body: string
  tags: { text: string; color: string }[]
}

export const pillars: Pillar[] = [
  {
    id: "separation", name: "Separation of Powers", icon: "⚖️", weight: 1.5,
    indicators: [
      { name: "Executive compliance with court orders", score: 4, status: "warning",
        detail: "Multiple instances of delayed or contested compliance with federal court orders. No outright defiance yet, but pattern of 'slow-walking' and rhetorical challenges to judicial authority.", date: "Ongoing, Feb 2026" },
      { name: "Congressional oversight capacity", score: 3, status: "critical",
        detail: "Inspector generals fired across agencies. Congressional subpoena power effectively neutered by executive non-compliance. Partisan majority shields executive from accountability votes.", date: "Jan-Feb 2026" },
      { name: "Independent agency autonomy", score: 3, status: "critical",
        detail: "DOGE systematically restructuring agencies. Career staff purges. Acting directors replacing Senate-confirmed officials. CFPB, EPA, DOJ independence severely compromised.", date: "Jan-Feb 2026" },
      { name: "War powers / emergency authority restraint", score: 5, status: "warning",
        detail: "Military deployments to border under emergency framing. 'Beautiful armada' near Iran without congressional authorization debate. Emergency declarations for non-emergency purposes normalized.", date: "Feb 2026" },
      { name: "Federalism — state autonomy", score: 5, status: "warning",
        detail: "Federal funding threats to non-compliant states. Immigration enforcement overriding state/local policies. But states still functioning as independent actors in courts.", date: "Feb 2026" },
    ]
  },
  {
    id: "judiciary", name: "Judicial Independence", icon: "🔨", weight: 1.3,
    indicators: [
      { name: "Court order enforcement", score: 5, status: "warning",
        detail: "Courts still issuing orders and injunctions. Compliance is delayed but not openly defied. The critical threshold — executive ignoring a Supreme Court ruling — has not been crossed.", date: "Feb 2026" },
      { name: "Judicial appointment integrity", score: 4, status: "warning",
        detail: "Lifetime appointments continue to be filled with ideologically vetted candidates. Federalist Society pipeline remains dominant. But no court-packing attempt yet.", date: "Ongoing" },
      { name: "Prosecutorial independence", score: 3, status: "critical",
        detail: "DOJ perceived as politically directed. Selective prosecution concerns. Career prosecutors reportedly reassigned or resigned. Special counsel mechanism effectively sidelined.", date: "Jan-Feb 2026" },
      { name: "Judicial defiance window", score: 6, status: "watch",
        detail: "NO executive defiance of Supreme Court ruling has occurred. This is the single most critical threshold. If crossed, constitutional order is functionally suspended. WATCH THIS.", date: "Threshold not yet crossed" },
    ]
  },
  {
    id: "elections", name: "Electoral Integrity", icon: "🗳️", weight: 1.5,
    indicators: [
      { name: "Voter access and registration", score: 5, status: "warning",
        detail: "Voter roll purges in multiple states. ID requirements tightened. But court challenges ongoing and registration drives active.", date: "Ongoing" },
      { name: "Election administration independence", score: 4, status: "warning",
        detail: "Partisan election officials in key states. Certification process politicized after 2024. Independent election boards under pressure.", date: "Ongoing" },
      { name: "Gerrymandering / structural distortion", score: 3, status: "critical",
        detail: "Extreme partisan gerrymandering in multiple states. Supreme Court declined to intervene (Rucho v. Common Cause precedent). Structural minority rule enabled.", date: "Structural" },
      { name: "Campaign finance transparency", score: 3, status: "critical",
        detail: "Dark money flows effectively unlimited post-Citizens United. Crypto donations adding new opacity layer. Super PAC coordination with campaigns barely enforced.", date: "Structural" },
      { name: "Peaceful transfer of power norm", score: 4, status: "warning",
        detail: "Jan 6 established precedent that transfer can be contested violently with limited consequence. Participants pardoned. Norm severely damaged but not destroyed — 2024 transfer did occur.", date: "Ongoing" },
    ]
  },
  {
    id: "press", name: "Free Press & Information", icon: "📰", weight: 1.2,
    indicators: [
      { name: "Press access to government", score: 4, status: "warning",
        detail: "Press briefings irregular. FOIA requests slow-walked. Journalists excluded selectively. But press still operates, publishes, and investigates.", date: "Feb 2026" },
      { name: "Journalist legal protection", score: 5, status: "warning",
        detail: "No journalists imprisoned domestically. But legal threats, defamation suits as intimidation, and rhetoric delegitimizing media ('enemy of the people') create chilling effect.", date: "Ongoing" },
      { name: "Information ecosystem health", score: 3, status: "critical",
        detail: "Epistemic fragmentation severe. Algorithmic bubbles. State-adjacent media ecosystem. Platform capture (X/Twitter). Foreign disinfo operations. Shared factual reality eroding.", date: "Structural" },
      { name: "Whistleblower protection", score: 3, status: "critical",
        detail: "Federal whistleblower protections being weakened. Retaliation against leakers intensified. DOGE restructuring eliminates institutional channels for internal dissent.", date: "Jan-Feb 2026" },
    ]
  },
  {
    id: "civil", name: "Civil Liberties", icon: "🗽", weight: 1.2,
    indicators: [
      { name: "Due process — citizens", score: 6, status: "watch",
        detail: "Constitutional protections for citizens largely intact in courts. But ICE operations increasingly aggressive. Columbia protester Leqaa Kordia still in detention after seizure.", date: "Feb 2026" },
      { name: "Due process — non-citizens", score: 3, status: "critical",
        detail: "Deportation without adequate hearing processes. Detention conditions. Alien Enemies Act invocations. Legal permanent residents caught in enforcement dragnets.", date: "Jan-Feb 2026" },
      { name: "Right to protest", score: 5, status: "warning",
        detail: "Protests still occurring. But surveillance increased, protest-adjacent activities criminalized (material support framing), and chilling effect from ICE targeting of activists.", date: "Feb 2026" },
      { name: "Privacy / surveillance", score: 4, status: "warning",
        detail: "DOGE access to sensitive databases (Treasury, SSA, OPM). Mass data consolidation without oversight. Section 702 reauthorized with expanded scope. AI surveillance tools deployed.", date: "Jan-Feb 2026" },
      { name: "Religious liberty (non-sectarian)", score: 5, status: "warning",
        detail: "Establishment clause under pressure from Christian nationalist policy framing. But no overt theocratic legislation yet. School prayer/religious display cases advancing.", date: "Ongoing" },
    ]
  },
  {
    id: "institutional", name: "Institutional Knowledge & Capacity", icon: "🏗️", weight: 1.0,
    indicators: [
      { name: "Federal workforce integrity", score: 3, status: "critical",
        detail: "Mass firings of career civil servants. Institutional knowledge irreversibly lost. Schedule F reclassification enabling political loyalty tests. Agencies losing decades of expertise.", date: "Jan-Feb 2026" },
      { name: "Scientific / expert advisory capacity", score: 3, status: "critical",
        detail: "CDC, NIH, EPA scientific advisory boards disbanded or restaffed. Research grants frozen. Climate data access restricted. Brain drain to private sector and foreign institutions.", date: "Jan-Feb 2026" },
      { name: "Military chain of command integrity", score: 6, status: "watch",
        detail: "Military largely maintaining institutional culture. Senior officers still operating within chain of command. But loyalty tests at flag officer level and SecDef appointment concerns.", date: "Feb 2026" },
      { name: "Financial system independence", score: 5, status: "warning",
        detail: "Fed independence under pressure (Warsh nomination). Treasury accessed by DOGE. But dollar system and Fed rate-setting still functionally independent. Bitcoin strategic reserve signals.", date: "Feb 2026" },
    ]
  },
  {
    id: "civic", name: "Civic Culture & Participation", icon: "🤝", weight: 1.0,
    indicators: [
      { name: "Civic engagement / voter turnout", score: 6, status: "watch",
        detail: "Turnout remains relatively high. Civic organizations active. But engagement increasingly tribal — participation motivated by opposition, not shared civic project.", date: "Structural" },
      { name: "Civic education / constitutional literacy", score: 3, status: "critical",
        detail: "Constitutional literacy extremely low. Federalist Papers effectively unknown to general public. Civic education gutted from curricula over decades. Most citizens cannot name the three branches.", date: "Structural — long-term erosion" },
      { name: "Cross-partisan institutional trust", score: 2, status: "critical",
        detail: "Trust in institutions at historic lows across partisan lines. No shared epistemic authority. Even the military — last high-trust institution — seeing partisan trust divergence.", date: "Structural" },
      { name: "Norm of loyal opposition", score: 3, status: "critical",
        detail: "Opposition framed as enemy, not legitimate political competitor. 'Enemy of the people' rhetoric. Criminalization of political disagreement normalized in discourse.", date: "Ongoing" },
    ]
  }
]

export const timelineData: TimelineItem[] = [
  { date: "NOW — Feb 2026", level: "warning", title: "Institutional Erosion Phase",
    body: "Multiple pillars below 4.0. Career civil servant purges accelerating. DOGE restructuring eliminates oversight capacity. Federal workforce losing institutional memory that took decades to build.",
    tags: [{ text: "ACTIVE", color: "#ff4444" }] },
  { date: "THRESHOLD — Not Yet Crossed", level: "critical", title: "🚨 Executive Defiance of Supreme Court",
    body: "The single most critical indicator. If the executive branch openly defies a Supreme Court ruling and faces no consequence, the constitutional order is functionally suspended. Andrew Jackson precedent becomes doctrine. ALL other indicators become secondary to this one.",
    tags: [{ text: "WATCH DAILY", color: "#ff4444" }, { text: "RED LINE", color: "#ff0000" }] },
  { date: "Watch: Q1–Q2 2026", level: "warning", title: "Emergency Powers Expansion",
    body: "Border emergency declarations as template for broader emergency authority. If a manufactured crisis (economic, security, immigration) triggers emergency powers that bypass congressional oversight, the separation of powers pillar collapses further.",
    tags: [{ text: "PREDICTIVE", color: "#ffaa00" }] },
  { date: "Watch: 2026", level: "warning", title: "Schedule F Full Implementation",
    body: "Reclassification of career civil servants as political appointees. Enables mass replacement of the professional bureaucracy with loyalists. If completed, institutional knowledge destruction becomes effectively irreversible within a single term.",
    tags: [{ text: "IRREVERSIBILITY RISK", color: "#ff8844" }] },
  { date: "Watch: 2026 Midterms", level: "watch", title: "Electoral Correction Capacity Test",
    body: "Midterm elections are the first test of whether democratic self-correction still functions. Watch: voter access restrictions, election administration independence, willingness to certify unfavorable results, post-election legal challenges.",
    tags: [{ text: "CORRECTION WINDOW", color: "#44aaff" }] },
  { date: "Watch: Ongoing", level: "watch", title: "State-Level Resistance Capacity",
    body: "Federalism as firewall. States filing lawsuits, protecting local institutions, maintaining independent election administration. If state resistance is effectively neutralized (funding threats, federal enforcement), the last structural check fails.",
    tags: [{ text: "FEDERALISM", color: "#44aaff" }] },
  { date: "Structural — Long Term", level: "holding", title: "Civic Renewal Requirement",
    body: "Constitutional literacy at crisis lows. The sovereign (citizenry) cannot defend what it doesn't understand. Paine wrote Common Sense because the case for liberty needed to be made accessible. Mazzini wrote Duties of Man because rights without civic duty are hollow. The same work is needed now.",
    tags: [{ text: "CIVIC DUTY", color: "#44ff88" }, { text: "PAINE", color: "#ffcc00" }, { text: "MAZZINI", color: "#ffcc00" }] },
]

export function getColor(score: number): string {
  if (score >= 7) return "#44ff88"
  if (score >= 5.5) return "#44aaff"
  if (score >= 4) return "#ffaa00"
  if (score >= 2.5) return "#ff8844"
  return "#ff4444"
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = { critical: "#ff4444", warning: "#ffaa00", watch: "#44aaff", holding: "#44ff88" }
  return map[status] || "#666"
}

export function getPhase(score: number) {
  if (score >= 8) return { name: "Healthy Republic", color: "#44ff88", desc: "Institutions functioning with normal friction. Self-correction mechanisms intact." }
  if (score >= 6) return { name: "Stressed but Functional", color: "#44aaff", desc: "Significant strain on institutions. Checks still operational but under pressure." }
  if (score >= 4) return { name: "Institutional Erosion", color: "#ffaa00", desc: "Multiple checks degraded. Self-correction mechanisms impaired. Active civic defense required." }
  if (score >= 2.5) return { name: "Constitutional Crisis", color: "#ff8844", desc: "Core checks failing. Democratic correction uncertain. Institutional restoration requires extraordinary civic action." }
  return { name: "Failed State / Authoritarian Transition", color: "#ff4444", desc: "Constitutional order functionally suspended. Self-governance no longer operative through normal channels." }
}

export function calculatePillarScores(ps: Pillar[]): Pillar[] {
  return ps.map(p => ({
    ...p,
    score: p.indicators.reduce((a, i) => a + i.score, 0) / p.indicators.length
  }))
}

export function calculateMasterScore(ps: Pillar[]): number {
  const totalWeight = ps.reduce((a, p) => a + p.weight, 0)
  return ps.reduce((a, p) => a + (p.score || 0) * p.weight, 0) / totalWeight
}
