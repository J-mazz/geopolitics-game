import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import {
  nodes as rawNodes, edges as rawEdges, hypotheses, signalHypoSupport,
  typeColors, edgeColors,
  instruments, incentiveEdges, incentiveRelationColors, instrumentColor,
} from '../data/geopolitical'
import type { GraphNode, GraphEdge, IncentiveEdge } from '../data/geopolitical'

const SNAPSHOT_DATE = 'Jun 2026'   // baseline signals (S1–S20) are Feb 2026; S21+ and indicators are current

export default function GeopoliticalGraph() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [activeHypo, setActiveHypo] = useState<string | null>(null)
  const [showIncentives, setShowIncentives] = useState(false)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null)
  const [edgeTip, setEdgeTip] = useState<{ x: number; y: number; edge: IncentiveEdge } | null>(null)
  const simRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null)

  const sortedHypos = [...hypotheses].sort((a, b) => b.score - a.score)

  // Live scores: mean support across all signals (the likelihood roll-up).
  const liveScores: Record<string, number> = {}
  hypotheses.forEach(h => {
    let total = 0, count = 0
    Object.keys(signalHypoSupport).forEach(sId => { total += signalHypoSupport[sId][h.id]; count++ })
    liveScores[h.id] = parseFloat((total / Math.max(1, count)).toFixed(1))
  })

  const signalNodes = rawNodes.filter(n => n.type === 'signal')

  const toggleHypo = useCallback((hId: string) => {
    setActiveHypo(prev => prev === hId ? null : hId)
  }, [])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    let width = window.innerWidth
    let height = window.innerHeight
    svg.attr('width', width).attr('height', height)

    const g = svg.append('g')

    svg.call(d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', e => g.attr('transform', e.transform))
    )

    const defs = svg.append('defs')
    defs.append('filter').attr('id', 'glow')
      .append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur')

    // One arrowhead marker per incentive relation, tinted to match the edge.
    Object.entries(incentiveRelationColors).forEach(([rel, color]) => {
      defs.append('marker')
        .attr('id', `arrow-${rel}`).attr('viewBox', '0 -5 10 10')
        .attr('refX', 18).attr('refY', 0)
        .attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto')
        .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', color)
    })

    // Base graph + instrument nodes share one simulation so instruments find
    // sensible positions; incentive links participate at low strength.
    const baseNodes = rawNodes.map(d => ({ ...d }))
    const instNodes = instruments.map(d => ({ ...d }))
    const allNodes = [...baseNodes, ...instNodes]

    const baseEdges = rawEdges.map(d => ({ ...d }))
    const incEdges = incentiveEdges.map(d => ({ ...d }))
    const forceLinks: Array<GraphEdge | IncentiveEdge> = [...baseEdges, ...incEdges]

    const isInc = (l: GraphEdge | IncentiveEdge): l is IncentiveEdge => 'relation' in l

    const simulation = d3.forceSimulation<GraphNode>(allNodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge | IncentiveEdge>(forceLinks)
        .id(d => d.id)
        .distance(l => isInc(l) ? 90 : (l.type === 'signal' ? 60 : l.type === 'influence' ? 100 : 120))
        .strength(l => isInc(l) ? 0.04 : (l as GraphEdge).strength / 15))
      .force('charge', d3.forceManyBody<GraphNode>()
        .strength(d => d.type === 'signal' ? -80 : d.type === 'instrument' ? -120 : -250))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<GraphNode>().radius(d => d.r + 5))
      .force('x', d3.forceX(width / 2).strength(0.03))
      .force('y', d3.forceY(height / 2).strength(0.03))

    simRef.current = simulation

    // --- base links ---
    const link = g.append('g').selectAll('line')
      .data(baseEdges).join('line')
      .attr('class', 'base-link')
      .attr('stroke', d => edgeColors[d.type] || '#333')
      .attr('stroke-width', d => Math.max(0.5, d.strength / 3))
      .attr('stroke-opacity', d => d.type === 'signal' ? 0.3 : 0.5)
      .attr('stroke-dasharray', d => d.type === 'influence' ? '4,4' : d.type === 'signal' ? '2,3' : null)

    // --- incentive links (hidden until the lens is on) ---
    const incLink = g.append('g').selectAll('line')
      .data(incEdges).join('line')
      .attr('class', 'inc-link')
      .attr('stroke', d => incentiveRelationColors[d.relation])
      .attr('stroke-width', d => Math.max(1, d.strength / 3))
      .attr('stroke-opacity', 0)
      .attr('marker-end', d => `url(#arrow-${d.relation})`)
      .style('cursor', 'pointer')
      .on('mouseover', (e, d) => setEdgeTip({ x: e.pageX + 15, y: e.pageY - 10, edge: d }))
      .on('mousemove', e => setEdgeTip(prev => prev ? { ...prev, x: e.pageX + 15, y: e.pageY - 10 } : null))
      .on('mouseout', () => setEdgeTip(null))

    const dragBehavior = d3.drag<SVGGElement, GraphNode>()
      .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
      .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null })

    const mkNodeTooltip = (sel: d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown>) => {
      sel.on('mouseover', (e, d) => setTooltip({ x: e.pageX + 15, y: e.pageY - 10, node: d }))
        .on('mousemove', e => setTooltip(prev => prev ? { ...prev, x: e.pageX + 15, y: e.pageY - 10 } : null))
        .on('mouseout', () => setTooltip(null))
    }

    // --- base nodes ---
    const node = g.append('g').selectAll<SVGGElement, GraphNode>('g')
      .data(baseNodes).join('g').call(dragBehavior)

    node.append('circle')
      .attr('class', 'base-node')
      .attr('r', d => d.r)
      .attr('fill', d => typeColors[d.type])
      .attr('fill-opacity', d => d.type === 'signal' ? 0.7 : 0.85)
      .attr('stroke', d => d3.color(typeColors[d.type])!.brighter(0.5).formatHex())
      .attr('stroke-width', d => d.type === 'major' ? 3 : d.type === 'signal' ? 1 : 2)
      .style('cursor', 'pointer')
    node.filter(d => d.type === 'major').select('circle').attr('filter', 'url(#glow)')

    node.append('text')
      .attr('class', d => `base-label ${d.type === 'signal' ? 'signal-label' : 'node-label'}`)
      .attr('dy', d => d.r + 14).attr('text-anchor', 'middle')
      .attr('fill', d => d.type === 'signal' ? '#999' : '#ccc')
      .attr('font-size', d => d.type === 'signal' ? '9px' : '11px')
      .attr('font-weight', d => d.type === 'signal' ? 'normal' : '600')
      .attr('pointer-events', 'none')
      .text(d => d.label)
    mkNodeTooltip(node)

    // --- instrument nodes (hidden until the lens is on) ---
    const instNode = g.append('g').selectAll<SVGGElement, GraphNode>('g')
      .data(instNodes).join('g')
      .attr('class', 'inst-node-group')
      .style('opacity', 0).style('pointer-events', 'none')
      .call(dragBehavior)

    instNode.append('rect')
      .attr('x', d => -d.r).attr('y', d => -d.r * 0.7)
      .attr('width', d => d.r * 2).attr('height', d => d.r * 1.4)
      .attr('rx', 4)
      .attr('fill', instrumentColor).attr('fill-opacity', 0.85)
      .attr('stroke', d3.color(instrumentColor)!.brighter(0.6).formatHex())
      .attr('stroke-width', 1.5).attr('stroke-dasharray', '3,2')
      .style('cursor', 'pointer')

    instNode.append('text')
      .attr('dy', d => d.r + 13).attr('text-anchor', 'middle')
      .attr('fill', '#aab').attr('font-size', '10px').attr('font-weight', '600')
      .attr('pointer-events', 'none').text(d => d.label)
    mkNodeTooltip(instNode)

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!).attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!).attr('y2', d => (d.target as GraphNode).y!)
      incLink
        .attr('x1', d => (d.source as unknown as GraphNode).x!).attr('y1', d => (d.source as unknown as GraphNode).y!)
        .attr('x2', d => (d.target as unknown as GraphNode).x!).attr('y2', d => (d.target as unknown as GraphNode).y!)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
      instNode.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // --- resize handling (was missing; graph used to break on resize) ---
    const handleResize = () => {
      width = window.innerWidth; height = window.innerHeight
      svg.attr('width', width).attr('height', height)
      simulation.force('center', d3.forceCenter(width / 2, height / 2))
      simulation.force('x', d3.forceX(width / 2).strength(0.03))
      simulation.force('y', d3.forceY(height / 2).strength(0.03))
      simulation.alpha(0.3).restart()
    }
    window.addEventListener('resize', handleResize)

    return () => { window.removeEventListener('resize', handleResize); simulation.stop() }
  }, [])

  // Hypothesis highlight lens — scoped to base nodes/links only.
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)

    if (!activeHypo) {
      svg.selectAll<SVGCircleElement, GraphNode>('circle.base-node')
        .attr('fill-opacity', d => d.type === 'signal' ? 0.7 : 0.85)
      svg.selectAll<SVGTextElement, GraphNode>('text.base-label')
        .attr('fill-opacity', 1)
      svg.selectAll<SVGLineElement, GraphEdge>('line.base-link')
        .attr('stroke-opacity', d => d.type === 'signal' ? 0.3 : 0.5)
      return
    }

    const hId = activeHypo
    svg.selectAll<SVGCircleElement, GraphNode>('circle.base-node')
      .attr('fill-opacity', d => {
        if (d.type !== 'signal') return 0.85
        const s = signalHypoSupport[d.id]
        return s ? (s[hId] >= 6 ? 1 : 0.15) : 0.2
      })
    svg.selectAll<SVGTextElement, GraphNode>('text.base-label')
      .attr('fill-opacity', d => {
        if (d.type !== 'signal') return 1
        const s = signalHypoSupport[d.id]
        return s ? (s[hId] >= 6 ? 1 : 0.2) : 0.2
      })
    svg.selectAll<SVGLineElement, GraphEdge>('line.base-link')
      .attr('stroke-opacity', d => {
        if (d.type !== 'signal') return 0.5
        const srcId = typeof d.source === 'object' ? (d.source as GraphNode).id : d.source
        const srcNode = rawNodes.find(n => n.id === srcId)
        if (!srcNode || srcNode.type !== 'signal') return 0.5
        const s = signalHypoSupport[srcNode.id]
        return (s && s[hId] >= 6) ? 0.7 : 0.05
      })
  }, [activeHypo])

  // Incentive lens — owns visibility of instrument nodes + incentive links,
  // and gently dims the base graph so the who-benefits layer reads on top.
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)

    svg.selectAll<SVGGElement, GraphNode>('g.inst-node-group')
      .transition().duration(300)
      .style('opacity', showIncentives ? 1 : 0)
      .style('pointer-events', showIncentives ? 'all' : 'none')

    svg.selectAll<SVGLineElement, IncentiveEdge>('line.inc-link')
      .transition().duration(300)
      .attr('stroke-opacity', d => showIncentives ? (0.2 + d.confidence * 0.6) : 0)

    if (!activeHypo) {
      svg.selectAll<SVGCircleElement, GraphNode>('circle.base-node')
        .transition().duration(300)
        .attr('fill-opacity', d =>
          showIncentives ? (d.type === 'signal' ? 0.35 : 0.45) : (d.type === 'signal' ? 0.7 : 0.85))
      svg.selectAll<SVGLineElement, GraphEdge>('line.base-link')
        .transition().duration(300)
        .attr('stroke-opacity', d =>
          showIncentives ? 0.12 : (d.type === 'signal' ? 0.3 : 0.5))
    }
  }, [showIncentives, activeHypo])

  return (
    <div className="relative w-screen" style={{ height: 'calc(100vh - 32px)', overflow: 'hidden' }}>
      <svg ref={svgRef} className="w-full h-full" />

      {/* Incentives lens toggle */}
      <button
        onClick={() => setShowIncentives(v => !v)}
        className="absolute top-3 left-1/2 -translate-x-1/2 z-50 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
        style={{
          background: showIncentives ? 'rgba(167,139,250,0.25)' : 'rgba(15,15,25,0.9)',
          border: `1px solid ${showIncentives ? '#a78bfa' : '#333'}`,
          color: showIncentives ? '#c4b5fd' : '#aaa',
        }}
      >
        {showIncentives ? '◉' : '◯'} Incentives Lens
      </button>

      {/* Node tooltip */}
      {tooltip && (
        <div className="absolute pointer-events-none z-[100]" style={{
          left: tooltip.x, top: tooltip.y, background: 'rgba(15,15,25,0.95)',
          border: '1px solid #444', borderRadius: 8, padding: '12px 16px', maxWidth: 380,
          fontSize: 13, lineHeight: 1.5, boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
        }}>
          <h3 className="text-white font-bold text-[15px] mb-1">{tooltip.node.label}</h3>
          <div className="text-[#aaa] whitespace-pre-line mb-1">{tooltip.node.detail}</div>
          {tooltip.node.type === 'signal' && signalHypoSupport[tooltip.node.id] && (
            <div className="mt-1.5">
              {hypotheses.map(h => {
                const val = signalHypoSupport[tooltip.node.id][h.id]
                return (
                  <div key={h.id} className="my-0.5">
                    <span className="font-semibold" style={{ color: h.color }}>{h.id}</span>{' '}
                    <span className="text-[#888]">{h.name}</span>
                    <span className="float-right font-bold">{val}/10</span>
                    <div className="bg-[#222] h-[3px] rounded mt-0.5">
                      <div className="h-[3px] rounded" style={{ background: h.color, width: `${val * 10}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Incentive-edge provenance tooltip */}
      {edgeTip && (
        <div className="absolute pointer-events-none z-[100]" style={{
          left: edgeTip.x, top: edgeTip.y, background: 'rgba(15,15,25,0.97)',
          border: `1px solid ${incentiveRelationColors[edgeTip.edge.relation]}`, borderRadius: 8,
          padding: '10px 14px', maxWidth: 340, fontSize: 12.5, lineHeight: 1.45,
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
        }}>
          <div className="font-bold mb-1" style={{ color: incentiveRelationColors[edgeTip.edge.relation] }}>
            {edgeTip.edge.source} <span className="text-[#888]">—{edgeTip.edge.relation}→</span> {edgeTip.edge.target}
          </div>
          <div className="text-[#bbb] italic mb-1.5">"{edgeTip.edge.provenance.quote}"</div>
          <div className="text-[10.5px] text-[#777] flex justify-between gap-3">
            <span>strength {edgeTip.edge.strength}/10 · conf {(edgeTip.edge.confidence * 100).toFixed(0)}%</span>
            <span>as of {edgeTip.edge.provenance.asOf}</span>
          </div>
          <div className="text-[10px] text-[#666] mt-0.5">src: {edgeTip.edge.provenance.sourceId}</div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-3 left-3 z-40 text-xs" style={{
        background: 'rgba(15,15,25,0.9)', border: '1px solid #333', borderRadius: 8, padding: '12px 16px'
      }}>
        <h2 className="text-white font-bold text-base mb-2">🎮 Geopolitical Graph</h2>
        <div className="text-[11px] text-[#888] mb-2">Snapshot: {SNAPSHOT_DATE} — Force-directed model</div>
        <div className="font-semibold text-[#aaa] mb-1">Node Types</div>
        {[
          { color: '#ff4444', label: 'Major Power' },
          { color: '#44aaff', label: 'Swing Actor' },
          { color: '#ffaa00', label: `Signal (${SNAPSHOT_DATE})` },
          { color: '#aa44ff', label: 'Domain / Theater' },
          { color: '#44ff88', label: 'Institution / Framework' },
          { color: instrumentColor, label: 'Instrument (lens)' },
        ].map(i => (
          <div key={i.label} className="flex items-center my-1">
            <div className="w-3 h-3 rounded-full mr-2 shrink-0" style={{ background: i.color }} />
            {i.label}
          </div>
        ))}
        {showIncentives && (
          <>
            <div className="font-semibold text-[#aaa] mt-2 mb-1">Incentive Relations</div>
            {Object.entries(incentiveRelationColors).map(([rel, color]) => (
              <div key={rel} className="flex items-center my-1">
                <div className="w-6 h-[3px] rounded mr-2 shrink-0" style={{ background: color }} />
                {rel}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Hypothesis Panel — now shows base vs. live (signal-derived) score */}
      <div className="absolute top-3 right-3 z-40 w-[290px] text-xs" style={{
        background: 'rgba(15,15,25,0.9)', border: '1px solid #333', borderRadius: 8, padding: '14px 18px'
      }}>
        <h2 className="text-white font-bold text-[15px] mb-1">Hypotheses — Scored</h2>
        <div className="text-[10.5px] text-[#777] mb-2.5">base prior · live = mean signal support</div>
        {sortedHypos.map(h => (
          <div key={h.id}
            className={`my-1.5 cursor-pointer p-1.5 rounded transition-colors ${activeHypo === h.id ? 'bg-white/10 border-l-[3px] border-l-[#ffcc00]' : 'hover:bg-white/5'}`}
            onClick={() => toggleHypo(h.id)}
          >
            <div>
              <span className="font-semibold" style={{ color: h.color }}>{h.id}: {h.name}</span>
              <span className="float-right font-bold" style={{ color: h.color }}>
                {h.score} <span className="text-[#777] font-normal">/ {liveScores[h.id]}</span>
              </span>
            </div>
            <div className="text-[11px] text-[#888] mt-0.5">{h.desc}</div>
            <div className="bg-[#222] h-1 rounded mt-1 relative">
              <div className="h-1 rounded transition-[width] duration-500" style={{ width: `${h.score / 10 * 100}%`, background: h.color }} />
              <div className="absolute top-0 h-1 w-[2px]" style={{ left: `${liveScores[h.id] / 10 * 100}%`, background: '#fff' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Signal Panel */}
      <div className="absolute bottom-3 left-3 right-3 z-40 text-[11px] max-h-[180px] overflow-y-auto" style={{
        background: 'rgba(15,15,25,0.9)', border: '1px solid #333', borderRadius: 8, padding: '12px 16px'
      }}>
        <h3 className="text-white font-bold text-[13px] mb-1.5">📡 Signals — Validated {SNAPSHOT_DATE}</h3>
        {signalNodes.map(s => {
          const support = signalHypoSupport[s.id]
          const bestH = hypotheses.reduce((best, h) => support[h.id] > support[best.id] ? h : best, hypotheses[0])
          return (
            <div key={s.id} className="flex items-start py-1 border-b border-[#1a1a2a] last:border-b-0">
              <div className="w-2 h-2 rounded-full bg-[#ffaa00] mr-2 mt-1 shrink-0" />
              <div className="flex-1">
                <strong>{s.label}</strong><br />
                <span className="text-[#888]">{s.detail.split('.')[0]}.</span>
              </div>
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap" style={{
                border: `1px solid ${bestH.color}`, color: bestH.color, background: '#222'
              }}>Best: {bestH.id} ({support[bestH.id]}/10)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
