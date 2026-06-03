export interface Hypothesis {
  id: string
  name: string
  score: number
  color: string
  desc: string
  liveScore?: number
}

export interface GraphNode {
  id: string
  label: string
  type: 'major' | 'swing' | 'signal' | 'domain' | 'institution' | 'instrument' | 'indicator'
  group: number
  r: number
  detail: string
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphEdge {
  source: string | GraphNode
  target: string | GraphNode
  type: 'conflict' | 'cooperation' | 'economic' | 'signal' | 'influence' | 'structural'
  strength: number
  label?: string
}

export const hypotheses: Hypothesis[] = [
  { id: "H1", name: "Cold War II (Bipolar)", score: 5.5, color: "#ff4444",
    desc: "US-China bipolar competition dominates all other dynamics" },
  { id: "H2", name: "Multipolar Chaos", score: 6.5, color: "#44aaff",
    desc: "No single axis; every actor plays for themselves" },
  { id: "H3", name: "China Peaks", score: 5.0, color: "#ffaa00",
    desc: "Dominant game is managing China's relative decline" },
  { id: "H4", name: "Transactional Realism", score: 7.0, color: "#44ff88",
    desc: "Ideology dead; pure deal-making across all actors" },
  { id: "H5", name: "Coercive Transactionalism", score: 7.5, color: "#ff66cc",
    desc: "Deal-making enforced by episodic regime-change force (Venezuela, Iran); Pax Americana by coercion" }
]

export const nodes: GraphNode[] = [
  { id: "US", label: "🇺🇸 United States", type: "major", group: 1, r: 28,
    detail: "Levers: Dollar/SWIFT, military forward-deploy, chip controls, LNG, alliance network.\nCosts: Polarization, fiscal deficit, alliance fatigue, hollowed industrial base.\nCurrent posture: Transactional dealmaking, military build-up near Iran, quiet Philippines rotation." },
  { id: "CN", label: "🇨🇳 China", type: "major", group: 1, r: 28,
    detail: "Levers: Manufacturing monopoly, rare earths, BRI debt, domestic market, navy.\nCosts: Demographic cliff, property crisis, youth unemployment, Malacca dependency, tech sanctions.\nCurrent posture: Drone tech advances, soft power push, Philippines talks, Cambodia base leverage." },
  { id: "RU", label: "🇷🇺 Russia", type: "major", group: 1, r: 24,
    detail: "Levers: Nuclear arsenal, energy exports, grain, casualty tolerance, proxy networks.\nCosts: Demographic loss, brain drain, equipment depletion, China dependency.\nCurrent posture: Informed of Iran-US talks content, junior partner dynamics increasing." },
  { id: "IN", label: "🇮🇳 India", type: "swing", group: 2, r: 20,
    detail: "Multi-alignment strategy. 1.4B market as leverage. Swing voter in US-China competition.\nPlaying both sides on energy (Russian oil) and tech (US partnerships)." },
  { id: "SA", label: "🇸🇦 Saudi/Gulf", type: "swing", group: 2, r: 20,
    detail: "Post-oil diversification. Security guarantee shopping. OPEC+ pricing power.\nNuclear hedging option. Normalization leverage." },
  { id: "TR", label: "🇹🇷 Turkey", type: "swing", group: 2, r: 18,
    detail: "NATO member controlling Bosphorus. Drone exports proven. Refugee leverage over EU.\nOverextended across multiple theaters. Lira crisis ongoing." },
  { id: "EU", label: "🇪🇺 EU", type: "swing", group: 2, r: 22,
    detail: "Strategic autonomy stated, cheap energy revealed preference. Regulatory superpower.\n27-member consensus paralysis. Defense spending still anemic. Post-Russia energy trauma." },
  { id: "IR", label: "🇮🇷 Iran", type: "swing", group: 2, r: 18,
    detail: "Nuclear negotiations via Oman. Economy heavily declining. Signaling sovereignty.\nMilitary commander warns of regional war if attacked. China/Russia informed of US talks." },
  { id: "JP", label: "🇯🇵 Japan", type: "swing", group: 2, r: 20,
    detail: "PM Takaichi LDP supermajority — 316/465 seats. Stocks soaring to record.\nPromised tax cuts + military spending to counter China. Most hawkish Japanese leader in decades." },
  { id: "KH", label: "🇰🇭 Cambodia", type: "swing", group: 3, r: 14,
    detail: "Chinese-built Ream Naval Base now hosting USS Cincinnati. Hedging between US and China.\nWas Beijing's ASEAN proxy since 2012. Now drifting." },
  { id: "PH", label: "🇵🇭 Philippines", type: "swing", group: 3, r: 16,
    detail: "US Army quiet rotation established Jul 2025. Task Force Philippines. EDCA bases expanding.\nFirst China-Philippines talks in over a year — South China Sea thaw?" },
  { id: "SCS", label: "South China Sea", type: "domain", group: 4, r: 16,
    detail: "Contested by China, Philippines, Vietnam, Malaysia, Brunei, Indonesia.\nUS freedom of navigation ops. Chinese coast guard confrontations.\nKey chokepoint for global trade." },
  { id: "TWN", label: "Taiwan Strait", type: "domain", group: 4, r: 16,
    detail: "Black Hawk drones: new frontier in US-China rivalry.\nAutonomous U-Hawk can deliver HIMARS pods or Navy strike missiles.\n300+ F-35s in Asia-Pacific by 2030." },
  { id: "ME", label: "Middle East", type: "domain", group: 4, r: 16,
    detail: "Iran-US indirect talks in Oman. Trump's 'beautiful armada' near Iran.\nHamas rejects disarmament. Israel expanding West Bank settler access.\nGaza body returns ongoing." },
  { id: "UKR", label: "Ukraine Theater", type: "domain", group: 4, r: 14,
    detail: "Ukraine's Gripen jets likely to come with Meteor missiles.\nFrozen conflict dynamics. European defense spending pressure." },
  { id: "SEA", label: "SE Asia", type: "domain", group: 4, r: 14,
    detail: "Thailand: Bhumjaithai party decisive victory, conservative-establishment win.\nCambodia drifting from China. Myanmar scam center crackdown by China." },
  { id: "CHIPS", label: "Semiconductor War", type: "domain", group: 4, r: 15,
    detail: "US export controls on ASML, chip equipment. China SMIC pushing domestic fabs.\n$660B Big Tech AI spending spree. Chokepoint technology." },
  { id: "ENERGY", label: "Energy Markets", type: "domain", group: 4, r: 14,
    detail: "Oil pricing dynamics. Russia-China below-market pricing.\nIran sanctions impact. OPEC+ spare capacity as lever. LNG geopolitics." },
  { id: "AI_TECH", label: "AI / Tech Race", type: "domain", group: 4, r: 15,
    detail: "$660B Big Tech AI spending spree. Kevin Warsh (likely Fed nominee) claims AI boom enables rate cuts.\nEconomists reject this. Anthropic breakout moment. China drone tech advances." },
  { id: "ASEAN", label: "ASEAN", type: "institution", group: 5, r: 12,
    detail: "Central convener for SE Asia. Code of Conduct stalled by Cambodia proxy for China.\nNow Cambodia drifting — could unblock progress." },
  { id: "NATO", label: "NATO", type: "institution", group: 5, r: 14,
    detail: "Turkey as complex member. European defense spending pressure.\nUS commitment questioned under transactional administration." },
  { id: "OPEC", label: "OPEC+", type: "institution", group: 5, r: 12,
    detail: "Saudi-led pricing. Russia member. Spare capacity as geopolitical lever.\nOil demand peak timeline creates urgency." },
  { id: "NPT", label: "NPT / Nuclear Order", type: "institution", group: 5, r: 12,
    detail: "Iran invoking NPT rights for enrichment. Saudi nuclear hedging.\nNon-proliferation regime under strain from multiple directions." },
  { id: "S1", label: "JP Election Landslide", type: "signal", group: 6, r: 10,
    detail: "LDP wins 316/465 seats. Takaichi supermajority. Stocks soar to record. Tax cuts + defense spending to counter China. VALIDATED: NHK, FT, AJ." },
  { id: "S2", label: "USS Cincinnati @ Ream", type: "signal", group: 6, r: 10,
    detail: "First US warship at Chinese-built Cambodia port. Beijing 'quietly displeased'. Cambodia hedging. VALIDATED: Defense News." },
  { id: "S3", label: "US Army Philippines Rotation", type: "signal", group: 6, r: 10,
    detail: "~50 troops rotational presence since Jul 2025. Task Force Philippines. 'Quiet' but persistent. VALIDATED: Defense News, USARPAC." },
  { id: "S4", label: "Iran-US Oman Talks", type: "signal", group: 6, r: 10,
    detail: "Indirect nuclear talks via Oman. Witkoff + Kushner met Iranian envoys. China & Russia informed. Iran signals sovereignty. VALIDATED: Al Jazeera." },
  { id: "S5", label: "Jimmy Lai 20yr Sentence", type: "signal", group: 6, r: 10,
    detail: "Hong Kong media mogul sentenced under national security law. Most severe punishment. Signaling to dissidents. VALIDATED: Reuters, FT." },
  { id: "S6", label: "$660B AI Spending Spree", type: "signal", group: 6, r: 10,
    detail: "Big Tech unprecedented AI investment. Warsh claims enables rate cuts (economists reject). Tech supremacy competition. VALIDATED: FT." },
  { id: "S7", label: "China-PH Talks Resume", type: "signal", group: 6, r: 10,
    detail: "First China-Philippines talks in over a year. South China Sea thaw? PH rejects declaring CN ambassador persona non grata. VALIDATED: SCMP." },
  { id: "S8", label: "CN Drone Tech Advance", type: "signal", group: 6, r: 10,
    detail: "Aerodynamic tail nozzle for drones tested — 'edge over F-35s' claim. CK-300 drone. Plus US autonomous Black Hawk (U-Hawk) counter. VALIDATED: SCMP, SCMP Military." },
  { id: "S9", label: "Israel West Bank Expansion", type: "signal", group: 6, r: 10,
    detail: "Security cabinet approves easier settler land purchases + more enforcement powers over Palestinians. VALIDATED: Reuters." },
  { id: "S10", label: "Ethiopia-Eritrea Tension", type: "signal", group: 6, r: 10,
    detail: "Ethiopia demands Eritrea 'immediately withdraw' troops. Eritrea supporting rebel fighters. Horn of Africa instability. VALIDATED: Al Jazeera." },
  { id: "S11", label: "CN Myanmar Executions", type: "signal", group: 6, r: 10,
    detail: "China executed Myanmese crime syndicate kingpins who ran scam centers trapping Chinese nationals. Regional power projection signal. VALIDATED: SCMP." },
  { id: "S12", label: "Singapore F-35s 2026", type: "signal", group: 6, r: 10,
    detail: "Singapore receiving first F-35 fighters this year. 300+ F-35s in Asia-Pacific by 2030. Alliance hardening signal. VALIDATED: Defense News, Lockheed." },
  { id: "S13", label: "Ukraine Gripen + Meteor", type: "signal", group: 6, r: 10,
    detail: "Ukraine's Gripen jets likely to come with long-reach Meteor missiles. Escalation capability. VALIDATED: Defense News." },
  { id: "S14", label: "Venezuela Releases", type: "signal", group: 6, r: 10,
    detail: "Opposition politicians Guanipa, Superlano, lawyer Rocha freed from jail. Maduro regime signaling to US? Deal-making posture. VALIDATED: Reuters, AJ." },
  { id: "S15", label: "Norway China Threat Report", type: "signal", group: 6, r: 10,
    detail: "Norwegian intelligence labels China a threat. Chinese embassy slams as 'sheer speculation'. Nordic countries aligning with US framing. VALIDATED: SCMP." },
  { id: "S16", label: "Epstein Network Fallout", type: "signal", group: 6, r: 10,
    detail: "Norway ambassador resigns. UK PM aide quits over Mandelson-Epstein links. DP World boss emailed Epstein. Elite network exposure. VALIDATED: Reuters, FT, AJ." },
  { id: "S17", label: "Thailand Conservative Win", type: "signal", group: 6, r: 10,
    detail: "Bhumjaithai Party decisive election victory. Conservative-establishment consolidation. Progressive/populist parties routed. VALIDATED: Reuters, AJ." },
  { id: "S18", label: "CN Soft Power Meme Push", type: "signal", group: 6, r: 10,
    detail: "'Very Chinese time' — Western social media trends painting Chineseness positively. Observers question if Beijing benefits. VALIDATED: SCMP." },
  { id: "S19", label: "Canada Subs-for-Auto Deal", type: "signal", group: 6, r: 10,
    detail: "Carney leverages submarine contract for auto sector investment. Transactional dealmaking between allies. VALIDATED: FT." },
  { id: "S20", label: "Iran Military Warning", type: "signal", group: 6, r: 10,
    detail: "Gen. Mousavi: 'entire region engulfed if Iran attacked'. Iran has 'power for long-term war with US'. Deterrence signaling. VALIDATED: Al Jazeera." },

  // ---- Market structural indicators (live, Jun 2 2026) ----
  { id: "I_OIL", label: "🛢️ Crude Oil $95", type: "indicator", group: 8, r: 12,
    detail: "WTI ~$95.5/bbl, +66% YTD; Brent ~$97. The Hormuz war premium — the Iran conflict, priced. SOURCE: FMP via Bigdata, Jun 2 2026." },
  { id: "I_GOLD", label: "🥇 Gold $4,490", type: "indicator", group: 8, r: 12,
    detail: "Gold ~$4,490/oz, +33% 1Y. Debasement / safe-haven bid beneath the equity calm. SOURCE: FMP via Bigdata, Jun 2 2026." },
  { id: "I_SILVER", label: "🥈 Silver +116% 1Y", type: "indicator", group: 8, r: 11,
    detail: "Silver ~$74.7/oz, +116% over the year. Monetary-hedge surge outpacing gold. SOURCE: FMP via Bigdata, Jun 2 2026." },
  { id: "I_VIX", label: "📉 VIX 15.8", type: "indicator", group: 8, r: 11,
    detail: "Volatility index ~15.8 — markets calm through two wars. Capital's confidence, or complacency. SOURCE: FMP via Bigdata, Jun 2 2026." },
  { id: "I_CHIPIDX", label: "💹 Korea/Taiwan AI Boom", type: "indicator", group: 8, r: 13,
    detail: "KOSPI +226% 1Y, Taiwan +120%, Nikkei +83%. The AI-semiconductor supercycle — the world's dominant equity story, and it is geographic. SOURCE: FMP via Bigdata, Jun 2 2026." },
  { id: "I_SP500", label: "📈 S&P 500 +27% 1Y", type: "indicator", group: 8, r: 12,
    detail: "S&P 500 ~7,610, +11% YTD, +27% 1Y — record highs through Venezuela & Iran wars. Narrow, tech/momentum-led. SOURCE: FMP via Bigdata, Jun 2 2026." },
  { id: "I_WEALTH", label: "⚖️ Top 1% = 31.7%", type: "indicator", group: 8, r: 12,
    detail: "Top 1% hold a record 31.7% of US wealth (~$55T ≈ bottom 90% combined); bottom 50% ~2.6%. The richest 1% own ~half of all stocks — the melt-up IS the disparity. SOURCE: Fed DFA / Inequality.org, Q3 2025." },

  // ---- Current signals (Jun 2026 refresh) ----
  { id: "S21", label: "🇻🇪 Maduro Captured", type: "signal", group: 6, r: 10,
    detail: "Jan 3 2026: US special forces captured Maduro in Caracas; Delcy Rodríguez sworn in as acting president; US oil sanctions lifted and privatization begun. Regime change plus an energy deal. SOURCE: Congress.gov CRS, Brookings." },
  { id: "S22", label: "🇮🇷 US-Israel Strike Iran", type: "signal", group: 6, r: 10,
    detail: "Feb 28 2026: US+Israel large-scale strikes begin the 2026 Iran war; Supreme Leader Khamenei killed, son named successor; Iran closes the Strait of Hormuz. SOURCE: UK House of Commons Library." },
  { id: "S23", label: "🇮🇷 Hormuz Ceasefire MOU", type: "signal", group: 6, r: 10,
    detail: "Late May 2026: tentative US-Iran MOU to reopen Hormuz plus a 60-day nuclear window; Trump has not signed off; ceasefire violations reported (Kuwait missile strike). SOURCE: CNN, PBS." },
  { id: "S24", label: "🤝 Trump-Xi Summit", type: "signal", group: 6, r: 10,
    detail: "May 2026: Trump state visit to China; both sides frame a 'constructive relationship of strategic stability' — a managed truce, with rare earths still China's lever. SOURCE: Global Times, China Briefing." },
  { id: "S25", label: "💾 Chip Ban Eased then Re-tightened", type: "signal", group: 6, r: 10,
    detail: "May 2026: H200/MI308 cleared for ~10 Chinese firms (75k cap) — but Beijing blocks imports to push domestic silicon; May 31 new controls on Blackwell/Rubin/MI350X. Chokepoint moved up a tier. SOURCE: BuiltIn, GuruFocus." },
  { id: "S26", label: "🇺🇦 Ukraine Victory-Day Truce", type: "signal", group: 6, r: 10,
    detail: "May 9-11 2026: Trump-brokered 3-day ceasefire plus prisoner swap; Putin says the war may be 'coming to an end' and offers direct talks; broader settlement stalled. SOURCE: Al Jazeera, NPR." },
  { id: "S27", label: "🇸🇬 Shangri-La: US Softens", type: "signal", group: 6, r: 10,
    detail: "May 29-31 2026: post-summit, Hegseth downplays Taiwan; sharp Japan-China friction over remilitarization; broad acceptance of higher defense spending. SOURCE: Global Times, CNBC." },
  { id: "S28", label: "🌊 SCS Flashpoints Persist", type: "signal", group: 6, r: 10,
    detail: "May 2026: Iroquois Reef research-vessel standoff and Scarborough Shoal drills; Philippines (2026 ASEAN chair) calls it a 'long-term struggle'; Code of Conduct seen unachievable. SOURCE: SCMP, CNBC." },
  { id: "S29", label: "🗂️ Epstein Files Released", type: "signal", group: 6, r: 10,
    detail: "Jan 30 2026: DOJ releases 3M+ pages under EFTA (200k+ withheld); Clintons held in contempt then testify; Andrew arrested Feb 18; Commerce Sec Lutnick to testify. An elite incentive network with primary-source provenance. SOURCE: DOJ, Britannica, CBS." },
  { id: "S30", label: "📊 Markets Shrug Off Wars", type: "signal", group: 6, r: 10,
    detail: "Equities at record highs through two regime-change wars while wealth concentration hits a record. Capital's confidence has decoupled from the median household. SOURCE: FMP via Bigdata, Fed DFA." },
]

export const edges: GraphEdge[] = [
  { source: "US", target: "CN", type: "conflict", strength: 9, label: "Strategic competition" },
  { source: "US", target: "RU", type: "conflict", strength: 7, label: "Ukraine proxy + sanctions" },
  { source: "CN", target: "RU", type: "cooperation", strength: 6, label: "Energy + strategic alignment" },
  { source: "US", target: "JP", type: "cooperation", strength: 8, label: "Security treaty + chip alliance" },
  { source: "US", target: "EU", type: "cooperation", strength: 6, label: "NATO + trade (fraying)" },
  { source: "US", target: "PH", type: "cooperation", strength: 7, label: "EDCA + Task Force PH" },
  { source: "US", target: "SA", type: "economic", strength: 6, label: "Arms sales + oil pricing" },
  { source: "US", target: "IN", type: "cooperation", strength: 5, label: "Quad + tech partnership" },
  { source: "US", target: "KH", type: "cooperation", strength: 3, label: "Warming (USS Cincinnati)" },
  { source: "CN", target: "KH", type: "economic", strength: 7, label: "BRI + Ream base + ASEAN proxy" },
  { source: "CN", target: "PH", type: "conflict", strength: 6, label: "SCS disputes (talks resuming)" },
  { source: "CN", target: "IR", type: "cooperation", strength: 5, label: "Energy imports + strategic info" },
  { source: "CN", target: "SA", type: "economic", strength: 5, label: "Oil purchases + BRI" },
  { source: "CN", target: "IN", type: "conflict", strength: 5, label: "Border + Indian Ocean rivalry" },
  { source: "CN", target: "JP", type: "conflict", strength: 7, label: "Taiwan + East China Sea" },
  { source: "CN", target: "TR", type: "economic", strength: 3, label: "Trade + Uyghur tension" },
  { source: "RU", target: "IR", type: "cooperation", strength: 5, label: "Defense + sanctions solidarity" },
  { source: "RU", target: "TR", type: "cooperation", strength: 4, label: "Energy + Syria + S-400" },
  { source: "RU", target: "IN", type: "economic", strength: 5, label: "Discounted oil + arms" },
  { source: "SA", target: "IR", type: "conflict", strength: 6, label: "Regional rivalry (thawing)" },
  { source: "TR", target: "EU", type: "economic", strength: 4, label: "Migration leverage + NATO" },
  { source: "EU", target: "RU", type: "conflict", strength: 6, label: "Ukraine + energy decoupling" },
  { source: "IR", target: "US", type: "conflict", strength: 7, label: "Nuclear + 'beautiful armada'" },
  { source: "CN", target: "SCS", type: "influence", strength: 8 },
  { source: "US", target: "SCS", type: "influence", strength: 6 },
  { source: "PH", target: "SCS", type: "influence", strength: 5 },
  { source: "CN", target: "TWN", type: "influence", strength: 9 },
  { source: "US", target: "TWN", type: "influence", strength: 7 },
  { source: "JP", target: "TWN", type: "influence", strength: 5 },
  { source: "US", target: "ME", type: "influence", strength: 7 },
  { source: "IR", target: "ME", type: "influence", strength: 7 },
  { source: "SA", target: "ME", type: "influence", strength: 6 },
  { source: "RU", target: "UKR", type: "influence", strength: 9 },
  { source: "EU", target: "UKR", type: "influence", strength: 6 },
  { source: "US", target: "UKR", type: "influence", strength: 5 },
  { source: "CN", target: "SEA", type: "influence", strength: 7 },
  { source: "US", target: "SEA", type: "influence", strength: 4 },
  { source: "US", target: "CHIPS", type: "influence", strength: 9 },
  { source: "CN", target: "CHIPS", type: "influence", strength: 7 },
  { source: "JP", target: "CHIPS", type: "influence", strength: 5 },
  { source: "SA", target: "ENERGY", type: "influence", strength: 8 },
  { source: "RU", target: "ENERGY", type: "influence", strength: 6 },
  { source: "IR", target: "ENERGY", type: "influence", strength: 5 },
  { source: "US", target: "AI_TECH", type: "influence", strength: 9 },
  { source: "CN", target: "AI_TECH", type: "influence", strength: 7 },
  { source: "KH", target: "ASEAN", type: "influence", strength: 4 },
  { source: "PH", target: "ASEAN", type: "influence", strength: 4 },
  { source: "TR", target: "NATO", type: "influence", strength: 5 },
  { source: "US", target: "NATO", type: "influence", strength: 8 },
  { source: "EU", target: "NATO", type: "influence", strength: 6 },
  { source: "SA", target: "OPEC", type: "influence", strength: 8 },
  { source: "RU", target: "OPEC", type: "influence", strength: 4 },
  { source: "IR", target: "NPT", type: "influence", strength: 6 },
  { source: "S1", target: "JP", type: "signal", strength: 8 },
  { source: "S1", target: "CN", type: "signal", strength: 5 },
  { source: "S2", target: "KH", type: "signal", strength: 8 },
  { source: "S2", target: "US", type: "signal", strength: 5 },
  { source: "S2", target: "CN", type: "signal", strength: 6 },
  { source: "S3", target: "PH", type: "signal", strength: 8 },
  { source: "S3", target: "US", type: "signal", strength: 6 },
  { source: "S3", target: "SCS", type: "signal", strength: 5 },
  { source: "S4", target: "IR", type: "signal", strength: 9 },
  { source: "S4", target: "US", type: "signal", strength: 7 },
  { source: "S4", target: "ME", type: "signal", strength: 6 },
  { source: "S4", target: "RU", type: "signal", strength: 3 },
  { source: "S4", target: "CN", type: "signal", strength: 3 },
  { source: "S5", target: "CN", type: "signal", strength: 7 },
  { source: "S6", target: "AI_TECH", type: "signal", strength: 9 },
  { source: "S6", target: "US", type: "signal", strength: 7 },
  { source: "S6", target: "CHIPS", type: "signal", strength: 5 },
  { source: "S7", target: "PH", type: "signal", strength: 7 },
  { source: "S7", target: "CN", type: "signal", strength: 7 },
  { source: "S7", target: "SCS", type: "signal", strength: 6 },
  { source: "S8", target: "CN", type: "signal", strength: 7 },
  { source: "S8", target: "TWN", type: "signal", strength: 6 },
  { source: "S8", target: "AI_TECH", type: "signal", strength: 4 },
  { source: "S9", target: "ME", type: "signal", strength: 7 },
  { source: "S10", target: "ME", type: "signal", strength: 4 },
  { source: "S11", target: "CN", type: "signal", strength: 6 },
  { source: "S11", target: "SEA", type: "signal", strength: 7 },
  { source: "S12", target: "US", type: "signal", strength: 5 },
  { source: "S12", target: "TWN", type: "signal", strength: 5 },
  { source: "S12", target: "SEA", type: "signal", strength: 5 },
  { source: "S13", target: "UKR", type: "signal", strength: 8 },
  { source: "S13", target: "EU", type: "signal", strength: 4 },
  { source: "S14", target: "US", type: "signal", strength: 4 },
  { source: "S15", target: "CN", type: "signal", strength: 5 },
  { source: "S15", target: "EU", type: "signal", strength: 4 },
  { source: "S16", target: "EU", type: "signal", strength: 5 },
  { source: "S17", target: "SEA", type: "signal", strength: 6 },
  { source: "S18", target: "CN", type: "signal", strength: 5 },
  { source: "S19", target: "US", type: "signal", strength: 4 },
  { source: "S20", target: "IR", type: "signal", strength: 8 },
  { source: "S20", target: "ME", type: "signal", strength: 7 },

  // ---- Structural: market indicators anchored to the domains they price ----
  { source: "I_OIL", target: "ENERGY", type: "structural", strength: 9 },
  { source: "I_OIL", target: "ME", type: "structural", strength: 6 },
  { source: "I_GOLD", target: "US", type: "structural", strength: 5 },
  { source: "I_SILVER", target: "US", type: "structural", strength: 4 },
  { source: "I_VIX", target: "US", type: "structural", strength: 5 },
  { source: "I_CHIPIDX", target: "CHIPS", type: "structural", strength: 8 },
  { source: "I_CHIPIDX", target: "TWN", type: "structural", strength: 6 },
  { source: "I_CHIPIDX", target: "AI_TECH", type: "structural", strength: 7 },
  { source: "I_SP500", target: "US", type: "structural", strength: 7 },
  { source: "I_WEALTH", target: "US", type: "structural", strength: 8 },

  // ---- Current signal edges (Jun 2026) ----
  { source: "S21", target: "US", type: "signal", strength: 7 },
  { source: "S21", target: "ENERGY", type: "signal", strength: 5 },
  { source: "S22", target: "IR", type: "signal", strength: 9 },
  { source: "S22", target: "ME", type: "signal", strength: 8 },
  { source: "S22", target: "US", type: "signal", strength: 7 },
  { source: "S22", target: "ENERGY", type: "signal", strength: 6 },
  { source: "S23", target: "IR", type: "signal", strength: 7 },
  { source: "S23", target: "ME", type: "signal", strength: 6 },
  { source: "S23", target: "ENERGY", type: "signal", strength: 6 },
  { source: "S24", target: "US", type: "signal", strength: 7 },
  { source: "S24", target: "CN", type: "signal", strength: 7 },
  { source: "S25", target: "CHIPS", type: "signal", strength: 8 },
  { source: "S25", target: "CN", type: "signal", strength: 6 },
  { source: "S25", target: "AI_TECH", type: "signal", strength: 6 },
  { source: "S26", target: "UKR", type: "signal", strength: 8 },
  { source: "S26", target: "RU", type: "signal", strength: 6 },
  { source: "S26", target: "US", type: "signal", strength: 5 },
  { source: "S27", target: "TWN", type: "signal", strength: 6 },
  { source: "S27", target: "JP", type: "signal", strength: 6 },
  { source: "S27", target: "CN", type: "signal", strength: 5 },
  { source: "S28", target: "SCS", type: "signal", strength: 7 },
  { source: "S28", target: "PH", type: "signal", strength: 6 },
  { source: "S28", target: "CN", type: "signal", strength: 6 },
  { source: "S29", target: "US", type: "signal", strength: 6 },
  { source: "S30", target: "US", type: "signal", strength: 6 },
  { source: "S30", target: "AI_TECH", type: "signal", strength: 4 },
]

export const signalHypoSupport: Record<string, Record<string, number>> = {
  // Feb 2026 baseline (H5 added retroactively)
  S1:  { H1: 8, H2: 3, H3: 7, H4: 5, H5: 2 },
  S2:  { H1: 4, H2: 7, H3: 4, H4: 8, H5: 4 },
  S3:  { H1: 7, H2: 4, H3: 5, H4: 5, H5: 4 },
  S4:  { H1: 3, H2: 5, H3: 3, H4: 9, H5: 5 },
  S5:  { H1: 6, H2: 3, H3: 7, H4: 3, H5: 2 },
  S6:  { H1: 7, H2: 4, H3: 5, H4: 5, H5: 2 },
  S7:  { H1: 3, H2: 6, H3: 5, H4: 8, H5: 3 },
  S8:  { H1: 8, H2: 4, H3: 7, H4: 3, H5: 3 },
  S9:  { H1: 3, H2: 6, H3: 3, H4: 7, H5: 4 },
  S10: { H1: 2, H2: 8, H3: 2, H4: 4, H5: 2 },
  S11: { H1: 4, H2: 4, H3: 6, H4: 6, H5: 5 },
  S12: { H1: 8, H2: 3, H3: 6, H4: 4, H5: 3 },
  S13: { H1: 6, H2: 5, H3: 3, H4: 4, H5: 3 },
  S14: { H1: 2, H2: 4, H3: 2, H4: 9, H5: 7 },
  S15: { H1: 7, H2: 4, H3: 5, H4: 3, H5: 2 },
  S16: { H1: 2, H2: 6, H3: 2, H4: 5, H5: 3 },
  S17: { H1: 3, H2: 5, H3: 3, H4: 6, H5: 2 },
  S18: { H1: 4, H2: 4, H3: 6, H4: 4, H5: 2 },
  S19: { H1: 3, H2: 4, H3: 3, H4: 9, H5: 4 },
  S20: { H1: 5, H2: 5, H3: 3, H4: 4, H5: 5 },
  // Jun 2026 current
  S21: { H1: 3, H2: 4, H3: 2, H4: 6, H5: 10 },
  S22: { H1: 7, H2: 5, H3: 2, H4: 3, H5: 9 },
  S23: { H1: 3, H2: 4, H3: 2, H4: 8, H5: 7 },
  S24: { H1: 4, H2: 5, H3: 5, H4: 9, H5: 4 },
  S25: { H1: 6, H2: 4, H3: 7, H4: 7, H5: 5 },
  S26: { H1: 3, H2: 4, H3: 2, H4: 8, H5: 6 },
  S27: { H1: 3, H2: 6, H3: 4, H4: 7, H5: 4 },
  S28: { H1: 6, H2: 7, H3: 5, H4: 3, H5: 3 },
  S29: { H1: 2, H2: 7, H3: 2, H4: 4, H5: 3 },
  S30: { H1: 3, H2: 6, H3: 4, H4: 6, H5: 6 },
}

export const typeColors: Record<string, string> = {
  major: "#ff4444",
  swing: "#44aaff",
  signal: "#ffaa00",
  domain: "#aa44ff",
  institution: "#44ff88",
  indicator: "#22d3ee"
}

export const edgeColors: Record<string, string> = {
  conflict: "#ff6666",
  cooperation: "#66ff66",
  economic: "#ffcc00",
  signal: "#cc66ff",
  influence: "#555",
  structural: "#22d3ee"
}

// ============================================================================
// INCENTIVES LAYER
// ----------------------------------------------------------------------------
// A toggleable "who-benefits" lens over the same force graph. It reuses the
// existing actor nodes (major/swing/institution) as endpoints, adds a small
// set of `instrument` nodes (concrete bills/contracts/quotas/programs), and
// connects them with a CLOSED set of incentive relations. Every edge carries
// provenance + a valid-time (asOf) so the structure can be reconstructed
// as-of a past date for backtesting without leaking the future.
//
// NOTE ON THE SEED DATA: the edges below are hand-curated and STRUCTURALLY
// true (membership, administration, basing arrangements). Provenance quotes
// are plain structural statements, not sourced news excerpts, and sourceId is
// marked `seed:structural`. Before any of this is treated as backtest-grade,
// replace each edge's provenance with a real citation (url + span quote) via
// curation or the extraction pipeline. The schema forces that discipline:
// no provenance, no edge.
// ============================================================================

export type ActorKind = 'person' | 'fund' | 'firm' | 'agency' | 'legislator' | 'state'
export type InstrumentKind = 'bill' | 'contract' | 'position' | 'donation' | 'sanction' | 'treaty' | 'quota' | 'program'

export type IncentiveRelation =
  | 'holds'         // actor holds a position/instrument
  | 'donates_to'    // actor funds a target
  | 'lobbies_on'    // actor lobbies on an instrument
  | 'sponsors'      // actor sponsors/authors an instrument
  | 'benefits_from' // actor's incentives are served by target
  | 'controls'      // actor sets/administers the instrument
  | 'conflicts_with'// the instrument cuts against the target's interest

export interface Provenance {
  sourceId: string      // citation key; `seed:structural` = placeholder, needs real source
  url?: string          // omitted for seed edges by design — do not fabricate
  quote: string         // the span that justifies the edge
  asOf: string          // ISO date — valid-time, the bitemporal anchor
}

export interface IncentiveEdge {
  source: string                // actor id (existing node) 
  target: string                // instrument id, or an existing actor/domain/signal id
  relation: IncentiveRelation
  strength: number              // 1-10, magnitude of the incentive
  confidence: number            // 0-1, epistemic state in the edge itself
  provenance: Provenance
}

// Concrete instruments — the levers actors actually pull. Distinct from the
// broad `domain` nodes (CHIPS, ENERGY) so the who-benefits join stays legible.
export const instruments: GraphNode[] = [
  { id: "INST_EXPORTCTL", label: "📜 Chip Export Controls", type: "instrument", group: 7, r: 13,
    detail: "US BIS export-administration rules restricting advanced-node chips & tooling to China. Lever wielded by the US, aimed at CN." },
  { id: "INST_OPECQUOTA", label: "🛢️ OPEC+ Output Quota", type: "instrument", group: 7, r: 13,
    detail: "Coordinated production targets set by OPEC+ . Saudi swing capacity sets the marginal price; Russia is a member." },
  { id: "INST_EDCA", label: "🪖 EDCA Basing", type: "instrument", group: 7, r: 13,
    detail: "Enhanced Defense Cooperation Agreement: US rotational access to Philippine bases. Expands US forward posture near the SCS/Taiwan." },
  { id: "INST_RUOIL", label: "🛢️ Discounted RU Crude", type: "instrument", group: 7, r: 12,
    detail: "Below-market Russian crude sold to non-aligned buyers (India, China) under the sanctions regime." },
  { id: "INST_F35", label: "✈️ F-35 Program", type: "instrument", group: 7, r: 13,
    detail: "US-led 5th-gen fighter program. Operated across the Asia-Pacific alliance network; 300+ airframes projected by 2030." },
  { id: "INST_BRI", label: "🏗️ BRI Lending", type: "instrument", group: 7, r: 13,
    detail: "China's Belt & Road infrastructure lending. Creates debt-leverage and basing access (e.g. Ream) across the periphery." },
]

export const incentiveEdges: IncentiveEdge[] = [
  // --- Chip export controls ---
  { source: "US", target: "INST_EXPORTCTL", relation: "controls", strength: 9, confidence: 0.95,
    provenance: { sourceId: "seed:structural", asOf: "2025-12-01",
      quote: "The US Bureau of Industry and Security administers the advanced-semiconductor export-control regime." } },
  { source: "INST_EXPORTCTL", target: "CN", relation: "conflicts_with", strength: 8, confidence: 0.9,
    provenance: { sourceId: "seed:structural", asOf: "2025-12-01",
      quote: "Controls are explicitly designed to constrain China's access to leading-edge compute." } },
  { source: "US", target: "CHIPS", relation: "benefits_from", strength: 7, confidence: 0.75,
    provenance: { sourceId: "seed:structural", asOf: "2025-12-01",
      quote: "US retains leverage over the chip chokepoint by gating equipment access." } },
  // --- OPEC+ pricing ---
  { source: "SA", target: "INST_OPECQUOTA", relation: "controls", strength: 8, confidence: 0.9,
    provenance: { sourceId: "seed:structural", asOf: "2025-11-15",
      quote: "Saudi spare capacity makes it the de-facto swing producer setting marginal price." } },
  { source: "RU", target: "INST_OPECQUOTA", relation: "benefits_from", strength: 6, confidence: 0.85,
    provenance: { sourceId: "seed:structural", asOf: "2025-11-15",
      quote: "Russia is an OPEC+ member and coordinates output under the same quota framework." } },
  { source: "RU", target: "INST_RUOIL", relation: "controls", strength: 7, confidence: 0.9,
    provenance: { sourceId: "seed:structural", asOf: "2025-11-15",
      quote: "Russia sets discounts on sanctioned crude to retain export volume." } },
  { source: "IN", target: "INST_RUOIL", relation: "benefits_from", strength: 7, confidence: 0.85,
    provenance: { sourceId: "seed:structural", asOf: "2025-11-15",
      quote: "India is a primary buyer of discounted Russian crude, lowering its import bill." } },
  { source: "CN", target: "INST_RUOIL", relation: "benefits_from", strength: 6, confidence: 0.8,
    provenance: { sourceId: "seed:structural", asOf: "2025-11-15",
      quote: "China purchases below-market Russian energy under strategic alignment." } },
  // --- EDCA / forward posture ---
  { source: "US", target: "INST_EDCA", relation: "sponsors", strength: 8, confidence: 0.9,
    provenance: { sourceId: "seed:structural", asOf: "2025-07-01",
      quote: "The US expands rotational basing access under the EDCA framework." } },
  { source: "PH", target: "INST_EDCA", relation: "benefits_from", strength: 6, confidence: 0.8,
    provenance: { sourceId: "seed:structural", asOf: "2025-07-01",
      quote: "Manila gains a security guarantee and deterrence against SCS coercion." } },
  { source: "INST_EDCA", target: "CN", relation: "conflicts_with", strength: 7, confidence: 0.85,
    provenance: { sourceId: "seed:structural", asOf: "2025-07-01",
      quote: "Expanded US basing constrains Chinese freedom of action in the near seas." } },
  // --- F-35 alliance hardening ---
  { source: "US", target: "INST_F35", relation: "controls", strength: 9, confidence: 0.95,
    provenance: { sourceId: "seed:structural", asOf: "2026-01-01",
      quote: "The US leads the F-35 program and gates partner access and sustainment." } },
  { source: "JP", target: "INST_F35", relation: "holds", strength: 6, confidence: 0.9,
    provenance: { sourceId: "seed:structural", asOf: "2026-01-01",
      quote: "Japan is a major F-35 operator integrating into the regional posture." } },
  { source: "INST_F35", target: "S12", relation: "benefits_from", strength: 5, confidence: 0.7,
    provenance: { sourceId: "seed:structural", asOf: "2026-02-08",
      quote: "Singapore's first F-35 deliveries are evidence of the program's alliance-hardening role." } },
  // --- BRI leverage ---
  { source: "CN", target: "INST_BRI", relation: "controls", strength: 8, confidence: 0.9,
    provenance: { sourceId: "seed:structural", asOf: "2025-10-01",
      quote: "China directs BRI lending terms as an instrument of strategic leverage." } },
  { source: "KH", target: "INST_BRI", relation: "benefits_from", strength: 6, confidence: 0.75,
    provenance: { sourceId: "seed:structural", asOf: "2025-10-01",
      quote: "Cambodia received BRI infrastructure financing, including the Ream naval facility." } },
  { source: "INST_BRI", target: "ASEAN", relation: "conflicts_with", strength: 5, confidence: 0.65,
    provenance: { sourceId: "seed:structural", asOf: "2025-10-01",
      quote: "BRI-linked dependencies have stalled ASEAN consensus (e.g. the SCS Code of Conduct)." } },
]

export const incentiveRelationColors: Record<IncentiveRelation, string> = {
  holds:          "#7dd3fc",
  donates_to:     "#fbbf24",
  lobbies_on:     "#f472b6",
  sponsors:       "#34d399",
  benefits_from:  "#a78bfa",
  controls:       "#fb923c",
  conflicts_with: "#f87171",
}

// instrument node color (extends the existing typeColors map at render time)
export const instrumentColor = "#8899bb"

// ============================================================================
// SOURCES REGISTRY
// ----------------------------------------------------------------------------
// First-class, citable sources spanning three tiers:
//   - model:   formal/falsifiable frameworks (e.g. bargaining model of war)
//   - feed:    event-discovery / narrative synthesis outlets
//   - market:  quantitative structural indicators (live, numeric)
//   - primary: government / primary-source document releases
//   - news:    conventional reporting outlets
// provenance.sourceId on IncentiveEdge (and future signal provenance) should
// reference a key in this registry rather than a free-text string.
// ============================================================================

export type SourceTier = 'model' | 'feed' | 'market' | 'primary' | 'news'

export interface Source {
  id: string
  name: string
  tier: SourceTier
  url?: string
  note: string
}

export const sources: Record<string, Source> = {
  SPANIEL: {
    id: "SPANIEL", name: "William Spaniel (Game Theory 101)", tier: "model",
    url: "https://gametheory101.com",
    note: "Formal crisis-bargaining model of war. The three failure modes — private information / incentives to misrepresent, commitment problems, issue indivisibility — map directly onto edge annotations for why a conflict resists settlement." },
  WARFRONTS: {
    id: "WARFRONTS", name: "Fronts / WarFronts (Simon Whistler)", tier: "feed",
    url: "https://fronts.co",
    note: "Independent, audience-funded conflict/defense synthesis (ex-Warographics). Event-discovery and ground-truth layer; qualitative, self-declared bias-aware. Not to be confused with warfront.live." },
  FMP_BIGDATA: {
    id: "FMP_BIGDATA", name: "FMP via Bigdata.com market tearsheet", tier: "market",
    note: "Live multi-asset structural indicators (equities, commodities, yields, FX, crypto). Numeric, continuous, auto-updatable via connector — the highest-quality signal substrate." },
  FED_DFA: {
    id: "FED_DFA", name: "Federal Reserve Distributional Financial Accounts", tier: "primary",
    url: "https://www.federalreserve.gov/releases/z1/dataviz/dfa/",
    note: "Quarterly wealth-share by percentile. Source for the Top-1% / bottom-50% disparity indicator." },
  DOJ_EFTA: {
    id: "DOJ_EFTA", name: "DOJ disclosures under the Epstein Files Transparency Act (H.R. 4405)", tier: "primary",
    url: "https://www.justice.gov/epstein",
    note: "Primary-source document sets. Citable provenance (url + span) for the elite-incentive-network sub-graph; replaces seed:structural placeholders." },
  HOC_LIBRARY: {
    id: "HOC_LIBRARY", name: "UK House of Commons Library", tier: "primary",
    note: "Briefing source for the 2026 Iran war / US-Iran ceasefire timeline." },
}
