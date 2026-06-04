import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import {
  nodes as rawNodes, edges as rawEdges,
  typeColors, edgeColors,
  instruments, incentiveEdges, incentiveRelationColors, instrumentColor,
  sources,
} from '../data/geopolitical'
import type { GraphNode, GraphEdge, IncentiveEdge } from '../data/geopolitical'

const SNAPSHOT_DATE = 'Jun 2026'   // baseline signals (S1–S20) are Feb 2026; S21+ and indicators are current

export default function GeopoliticalGraph() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [showIncentives, setShowIncentives] = useState(false)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null)
  const [edgeTip, setEdgeTip] = useState<{ x: number; y: number; edge: IncentiveEdge } | null>(null)

  const signalNodes = rawNodes.filter(n => n.type === 'signal')
  const indicatorNodes = rawNodes.filter(n => n.type === 'indicator')

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

    svg.selectAll<SVGCircleElement, GraphNode>('circle.base-node')
      .transition().duration(300)
      .attr('fill-opacity', d =>
        showIncentives ? (d.type === 'signal' ? 0.35 : 0.45) : (d.type === 'signal' ? 0.7 : 0.85))
    svg.selectAll<SVGLineElement, GraphEdge>('line.base-link')
      .transition().duration(300)
      .attr('stroke-opacity', d =>
        showIncentives ? 0.12 : (d.type === 'signal' ? 0.3 : 0.5))
  }, [showIncentives])

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
        </div>
      )}

      {/* Incentive-edge provenance tooltip */}
      {edgeTip && (() => {
        const src = sources[edgeTip.edge.provenance.sourceId]
        return (
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
            <div className="text-[10px] text-[#666] mt-0.5">
              {src
                ? <>src: <span className="text-[#aaa]">{src.name}</span> <span className="text-[#555]">({src.tier})</span></>
                : <>src: {edgeTip.edge.provenance.sourceId}</>}
            </div>
          </div>
        )
      })()}

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
          { color: '#22d3ee', label: 'Indicator (live market)' },
          { color: instrumentColor, label: 'Instrument (lens)' },
        ].map(i => (
          <div key={i.label} className="flex items-center my-1">
            <div className="w-3 h-3 rounded-full mr-2 shrink-0" style={{ background: i.color }} />
            {i.label}
          </div>
        ))}
        <div className="font-semibold text-[#aaa] mt-2 mb-1">Edge Types</div>
        {[
          { color: '#22d3ee', label: 'Structural (indicator → domain)' },
        ].map(e => (
          <div key={e.label} className="flex items-center my-1">
            <div className="w-6 h-[2px] rounded mr-2 shrink-0" style={{ background: e.color }} />
            {e.label}
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

      {/* Right panel — Market Indicators + Incentive Levers */}
      <div className="absolute top-3 right-3 z-40 w-[320px] max-h-[calc(100vh-48px)] overflow-y-auto text-xs" style={{
        background: 'rgba(15,15,25,0.9)', border: '1px solid #333', borderRadius: 8, padding: '14px 18px'
      }}>
        <section>
          <h2 className="text-white font-bold text-[15px] mb-1">📊 Market Indicators</h2>
          <div className="text-[10.5px] text-[#777] mb-2.5">structural signals — what capital is pricing today</div>
          <div className="space-y-1.5">
            {indicatorNodes.map(ind => (
              <div key={ind.id} className="rounded-md border border-[#1f2a30] bg-[#0c1418] px-2.5 py-1.5">
                <div className="font-semibold text-[#a5f3fc] text-[11.5px]">{ind.label}</div>
                <div className="text-[10.5px] text-[#7a8a90] mt-0.5">{ind.detail.split('.')[0]}.</div>
              </div>
            ))}
          </div>
        </section>

        <div className="my-3 border-t border-[#2a2a3a]" />

        <section>
          <h2 className="text-white font-bold text-[15px] mb-1">Incentives — Key Levers</h2>
          <div className="text-[10.5px] text-[#777] mb-2.5">
            The who-benefits layer: instruments, relations, and the lens state.
          </div>

          <div className="rounded-md border border-[#242434] bg-[#10101a] px-3 py-2 mb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#ccc]">Lens status</span>
              <span className="font-bold" style={{ color: showIncentives ? '#c4b5fd' : '#888' }}>
                {showIncentives ? 'Active' : 'Off'}
              </span>
            </div>
            <div className="mt-1 text-[10.5px] text-[#888]">
              {showIncentives ? 'Instrument nodes and relation edges are visible on the graph.' : 'Turn on the Incentives Lens to surface instrument nodes and relations.'}
            </div>
          </div>

          <div className="space-y-2 mb-3">
            {instruments.map(inst => (
              <div key={inst.id} className="rounded-md border border-[#242434] bg-[#10101a] px-3 py-2">
                <div className="font-semibold" style={{ color: instrumentColor }}>{inst.label}</div>
                <div className="text-[10.5px] text-[#888] mt-0.5">
                  {inst.detail.split('.')[0]}.
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="font-semibold text-[#aaa] mb-1">Relation types</div>
            {Object.entries(incentiveRelationColors).map(([rel, color]) => (
              <div key={rel} className="flex items-center my-1">
                <div className="w-6 h-[3px] rounded mr-2 shrink-0" style={{ background: color }} />
                {rel}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Signal Panel */}
      <div className="absolute bottom-3 left-3 right-3 z-40 text-[11px] max-h-[180px] overflow-y-auto" style={{
        background: 'rgba(15,15,25,0.9)', border: '1px solid #333', borderRadius: 8, padding: '12px 16px'
      }}>
        <h3 className="text-white font-bold text-[13px] mb-1.5">📡 Signals — Validated {SNAPSHOT_DATE}</h3>
        {signalNodes.map(s => (
          <div key={s.id} className="flex items-start py-1 border-b border-[#1a1a2a] last:border-b-0">
            <div className="w-2 h-2 rounded-full bg-[#ffaa00] mr-2 mt-1 shrink-0" />
            <div className="flex-1">
              <strong>{s.label}</strong><br />
              <span className="text-[#888]">{s.detail.split('.')[0]}.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
