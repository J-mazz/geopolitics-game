import { useMemo } from 'react'
import { pillars as rawPillars, timelineData, getColor, getStatusColor, getPhase, calculatePillarScores, calculateMasterScore } from '../data/republic-health'

export default function RepublicHealth() {
  const pillars = useMemo(() => calculatePillarScores(rawPillars), [])
  const masterScore = useMemo(() => calculateMasterScore(pillars), [pillars])
  const phase = useMemo(() => getPhase(masterScore), [masterScore])

  return (
    <div className="min-h-screen" style={{ background: '#080810', color: '#d0d0d0', fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <header className="text-center py-10 border-b border-[#1a1a2a]">
        <h1 className="text-[28px] font-bold text-white tracking-wide">🏛️ Republic Health Index</h1>
        <div className="text-[#888] text-sm mt-1.5 italic">Institutional Integrity Countdown — United States, February 2026</div>
        <div className="max-w-[700px] mx-auto mt-4 text-[#777] text-[13px] leading-relaxed border-l-[3px] border-[#444] pl-4 text-left">
          "These are the times that try men's souls. The summer soldier and the sunshine patriot will, in this crisis, shrink from the service of their country; but he that stands by it now, deserves the love and thanks of man and woman."
          <br /><span className="text-[#999] font-semibold">— Thomas Paine, <em>The American Crisis</em>, December 1776</span>
        </div>
        <div className="max-w-[700px] mx-auto mt-3 text-[#777] text-[13px] leading-relaxed border-l-[3px] border-[#444] pl-4 text-left">
          "Without the duty of citizens, no security for your rights. Governments can only be maintained by the active support and watchfulness of the governed."
          <br /><span className="text-[#999] font-semibold">— Giuseppe Mazzini, <em>The Duties of Man</em>, 1860</span>
        </div>
      </header>

      {/* Master Gauge */}
      <div className="text-center py-8">
        <div className="text-[96px] font-extrabold leading-none tabular-nums" style={{ color: getColor(masterScore) }}>
          {masterScore.toFixed(1)}
        </div>
        <div className="text-sm text-[#888] mt-1 uppercase tracking-widest">Composite Republic Health Score</div>
        <div className="max-w-[600px] mx-auto mt-4 h-3 rounded-md overflow-hidden" style={{ background: '#151520' }}>
          <div className="h-full rounded-md transition-[width] duration-1000" style={{
            width: `${masterScore * 10}%`,
            background: `linear-gradient(90deg, #ff4444, ${getColor(masterScore)})`
          }} />
        </div>
        <div className="text-lg font-semibold mt-3" style={{ color: phase.color }}>Phase: {phase.name}</div>
        <div className="text-[#888] text-[13px] mt-1 max-w-[600px] mx-auto">{phase.desc}</div>
      </div>

      {/* Pillars */}
      <div className="grid gap-4 px-6 max-w-[1400px] mx-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        {pillars.map(p => (
          <div key={p.id} className="rounded-[10px] p-5" style={{ background: '#0e0e18', border: '1px solid #1a1a2a' }}>
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2.5">{p.icon}</span>
              <span className="text-base font-bold text-white">{p.name}</span>
              <span className="ml-auto text-[28px] font-extrabold tabular-nums" style={{ color: getColor(p.score!) }}>
                {p.score!.toFixed(1)}
              </span>
            </div>
            <div className="h-1.5 rounded mb-3.5" style={{ background: '#151520' }}>
              <div className="h-1.5 rounded transition-[width] duration-1000" style={{ width: `${p.score! * 10}%`, background: getColor(p.score!) }} />
            </div>
            {p.indicators.map((ind, i) => (
              <div key={i} className="flex items-start py-2 border-b border-[#12121e] last:border-b-0">
                <div className="w-2.5 h-2.5 rounded-full mr-2.5 mt-1 shrink-0" style={{ background: getStatusColor(ind.status) }} />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#ccc]">{ind.name}</div>
                  <div className="text-[11px] text-[#777] mt-0.5 leading-snug">{ind.detail}</div>
                  <div className="text-[10px] text-[#555] mt-0.5">{ind.date}</div>
                </div>
                <div className="text-xs font-bold ml-2 whitespace-nowrap self-center" style={{ color: getColor(ind.score) }}>
                  {ind.score}/10
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="max-w-[1400px] mx-auto mt-5 px-6 pb-10">
        <h2 className="text-lg text-white font-bold mb-4 pb-2 border-b border-[#1a1a2a]">⚡ Critical Path — What to Watch</h2>
        <div className="relative pl-8">
          <div className="absolute left-2 top-0 bottom-0 w-0.5" style={{
            background: 'linear-gradient(to bottom, #ff4444, #ffaa00, #44ff88, #333)'
          }} />
          {timelineData.map((t, i) => (
            <div key={i} className="relative mb-4 p-3 rounded-lg" style={{ background: '#0e0e18', border: '1px solid #1a1a2a' }}>
              <div className="absolute -left-[26px] top-4 w-2.5 h-2.5 rounded-full border-2" style={{
                borderColor: t.level === 'critical' ? '#ff4444' : t.level === 'warning' ? '#ffaa00' : t.level === 'watch' ? '#44aaff' : '#44ff88',
                background: t.level === 'critical' ? '#ff4444' : t.level === 'warning' ? '#ffaa00' : t.level === 'watch' ? '#44aaff' : '#44ff88'
              }} />
              <div className="text-[11px] text-[#666]">{t.date}</div>
              <div className="text-sm font-semibold text-[#ddd] my-1">{t.title}</div>
              <div className="text-xs text-[#999] leading-relaxed">{t.body}</div>
              <div className="mt-1.5">
                {t.tags.map((tag, j) => (
                  <span key={j} className="inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold mr-1"
                    style={{ border: `1px solid ${tag.color}`, color: tag.color }}>{tag.text}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="max-w-[1400px] mx-auto px-6 pb-10">
        <h2 className="text-lg text-white font-bold mb-3">📐 Methodology</h2>
        <div className="text-[13px] text-[#888] leading-relaxed max-w-[800px] space-y-2.5">
          <p>This index measures the functional integrity of republican self-governance across seven pillars. Each pillar contains observable indicators scored 0–10 based on <strong className="text-white">hard actions</strong>, not rhetoric. The master score is a weighted average reflecting the interdependence of institutional checks.</p>
          <p><strong className="text-white">Scoring principle:</strong> We measure the <em>capacity</em> of each institution to perform its constitutional function, not whether we agree with its current decisions. A court that rules against your preferences but operates independently scores higher than a court that rules for you but has been captured.</p>
          <blockquote className="border-l-[3px] border-[#ffaa00] pl-4 my-4 text-[#aaa] italic text-[13px] leading-relaxed">
            "The spirit of resistance to government is so valuable on certain occasions, that I wish it to be always kept alive. It will often be exercised when wrong, but better so than not to be exercised at all."
            <br /><span className="not-italic text-[#ccc] font-semibold">— Thomas Jefferson, Letter to Abigail Adams, 1787</span>
          </blockquote>
          <p><strong className="text-white">Phases:</strong> The index defines five phases of institutional health. These are not predictions — they are diagnostic categories based on observable evidence. The republic's trajectory is not fixed. It is determined by the actions of its sovereign: the citizenry.</p>
          <blockquote className="border-l-[3px] border-[#ffaa00] pl-4 my-4 text-[#aaa] italic text-[13px] leading-relaxed">
            "The price of liberty is eternal vigilance."
            <br /><span className="not-italic text-[#ccc] font-semibold">— commonly attributed to Jefferson; paraphrasing John Philpot Curran, 1790</span>
          </blockquote>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-[#1a1a2a] text-[#444] text-xs">
        Model built Feb 2026 · Signals validated against open-source reporting ·
        This is a civic tool, not prophecy · The republic belongs to those who defend it
      </footer>
    </div>
  )
}
