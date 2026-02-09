import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { nodes as rawNodes, edges as rawEdges, hypotheses, signalHypoSupport, typeColors, edgeColors } from '../data/geopolitical'
import type { GraphNode, GraphEdge } from '../data/geopolitical'

export default function GeopoliticalGraph() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [activeHypo, setActiveHypo] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null)
  const simRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null)

  const sortedHypos = [...hypotheses].sort((a, b) => b.score - a.score)

  // Compute live scores
  const liveScores: Record<string, number> = {}
  sortedHypos.forEach(h => {
    let total = 0, count = 0
    Object.keys(signalHypoSupport).forEach(sId => {
      total += signalHypoSupport[sId][h.id]
      count++
    })
    liveScores[h.id] = parseFloat((total / count).toFixed(1))
  })

  const signalNodes = rawNodes.filter(n => n.type === 'signal')

  const toggleHypo = useCallback((hId: string) => {
    setActiveHypo(prev => prev === hId ? null : hId)
  }, [])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = window.innerWidth
    const height = window.innerHeight

    svg.attr('width', width).attr('height', height)

    const g = svg.append('g')

    svg.call(d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', e => g.attr('transform', e.transform))
    )

    // Defs for glow
    svg.append('defs').append('filter').attr('id', 'glow')
      .append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur')

    const nodesCopy = rawNodes.map(d => ({ ...d }))
    const edgesCopy = rawEdges.map(d => ({ ...d }))

    const simulation = d3.forceSimulation<GraphNode>(nodesCopy)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(edgesCopy)
        .id(d => d.id)
        .distance(d => {
          if (d.type === 'signal') return 60
          if (d.type === 'influence') return 100
          return 120
        })
        .strength(d => d.strength / 15))
      .force('charge', d3.forceManyBody<GraphNode>().strength(d => d.type === 'signal' ? -80 : -250))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<GraphNode>().radius(d => d.r + 5))
      .force('x', d3.forceX(width / 2).strength(0.03))
      .force('y', d3.forceY(height / 2).strength(0.03))

    simRef.current = simulation

    const link = g.append('g').selectAll('line')
      .data(edgesCopy)
      .join('line')
      .attr('stroke', d => edgeColors[d.type] || '#333')
      .attr('stroke-width', d => Math.max(0.5, d.strength / 3))
      .attr('stroke-opacity', d => d.type === 'signal' ? 0.3 : 0.5)
      .attr('stroke-dasharray', d => d.type === 'influence' ? '4,4' : d.type === 'signal' ? '2,3' : null)

    const node = g.append('g').selectAll<SVGGElement, GraphNode>('g')
      .data(nodesCopy)
      .join('g')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
        .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null })
      )

    node.append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => typeColors[d.type])
      .attr('fill-opacity', d => d.type === 'signal' ? 0.7 : 0.85)
      .attr('stroke', d => d3.color(typeColors[d.type])!.brighter(0.5).formatHex())
      .attr('stroke-width', d => d.type === 'major' ? 3 : d.type === 'signal' ? 1 : 2)
      .style('cursor', 'pointer')

    node.filter(d => d.type === 'major').select('circle')
      .attr('filter', 'url(#glow)')

    node.append('text')
      .attr('class', d => d.type === 'signal' ? 'signal-label' : 'node-label')
      .attr('dy', d => d.r + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.type === 'signal' ? '#999' : '#ccc')
      .attr('font-size', d => d.type === 'signal' ? '9px' : '11px')
      .attr('font-weight', d => d.type === 'signal' ? 'normal' : '600')
      .attr('pointer-events', 'none')
      .text(d => d.label)

    // Tooltip events
    node.on('mouseover', (e, d) => {
      setTooltip({ x: e.pageX + 15, y: e.pageY - 10, node: d })
    })
    .on('mousemove', (e) => {
      setTooltip(prev => prev ? { ...prev, x: e.pageX + 15, y: e.pageY - 10 } : null)
    })
    .on('mouseout', () => setTooltip(null))

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => { simulation.stop() }
  }, [])

  // Highlight effect when activeHypo changes
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)

    if (!activeHypo) {
      svg.selectAll('circle')
        .attr('fill-opacity', (d: any) => d.type === 'signal' ? 0.7 : 0.85)
      svg.selectAll('text')
        .attr('fill-opacity', 1)
      svg.selectAll('line')
        .attr('stroke-opacity', (d: any) => d.type === 'signal' ? 0.3 : 0.5)
      return
    }

    const hId = activeHypo
    svg.selectAll<SVGCircleElement, GraphNode>('circle')
      .attr('fill-opacity', d => {
        if (d.type !== 'signal') return 0.85
        const s = signalHypoSupport[d.id]
        if (!s) return 0.2
        return s[hId] >= 6 ? 1 : 0.15
      })
    svg.selectAll<SVGTextElement, GraphNode>('text')
      .attr('fill-opacity', d => {
        if (d.type !== 'signal') return 1
        const s = signalHypoSupport[d.id]
        if (!s) return 0.2
        return s[hId] >= 6 ? 1 : 0.2
      })
    svg.selectAll<SVGLineElement, GraphEdge>('line')
      .attr('stroke-opacity', d => {
        if (d.type !== 'signal') return 0.5
        const srcNode = rawNodes.find(n => n.id === (typeof d.source === 'object' ? (d.source as GraphNode).id : d.source))
        if (!srcNode || srcNode.type !== 'signal') return 0.5
        const s = signalHypoSupport[srcNode.id]
        return (s && s[hId] >= 6) ? 0.7 : 0.05
      })
  }, [activeHypo])

  return (
    <div className="relative w-screen" style={{ height: 'calc(100vh - 32px)', overflow: 'hidden' }}>
      <svg ref={svgRef} className="w-full h-full" />

      {/* Tooltip */}
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

      {/* Legend */}
      <div className="absolute top-3 left-3 z-50 text-xs" style={{
        background: 'rgba(15,15,25,0.9)', border: '1px solid #333', borderRadius: 8, padding: '12px 16px'
      }}>
        <h2 className="text-white font-bold text-base mb-2">🎮 Geopolitical Graph</h2>
        <div className="text-[11px] text-[#888] mb-2">Feb 2026 — Force-directed model</div>
        <div className="font-semibold text-[#aaa] mb-1">Node Types</div>
        {[
          { color: '#ff4444', label: 'Major Power' },
          { color: '#44aaff', label: 'Swing Actor' },
          { color: '#ffaa00', label: 'Live Signal (Feb 2026)' },
          { color: '#aa44ff', label: 'Domain / Theater' },
          { color: '#44ff88', label: 'Institution / Framework' },
        ].map(i => (
          <div key={i.label} className="flex items-center my-1">
            <div className="w-3 h-3 rounded-full mr-2 shrink-0" style={{ background: i.color }} />
            {i.label}
          </div>
        ))}
        <div className="font-semibold text-[#aaa] mt-2 mb-1">Edge Types</div>
        {[
          { color: '#ff6666', label: 'Conflict / Tension' },
          { color: '#66ff66', label: 'Alliance / Cooperation' },
          { color: '#ffcc00', label: 'Economic Leverage' },
          { color: '#cc66ff', label: 'Signal Connection' },
          { color: '#666', label: 'Influence / Proxy' },
        ].map(i => (
          <div key={i.label} className="flex items-center my-1">
            <div className="w-6 h-[3px] rounded mr-2 shrink-0" style={{ background: i.color }} />
            {i.label}
          </div>
        ))}
      </div>

      {/* Hypothesis Panel */}
      <div className="absolute top-3 right-3 z-50 w-[280px] text-xs" style={{
        background: 'rgba(15,15,25,0.9)', border: '1px solid #333', borderRadius: 8, padding: '14px 18px'
      }}>
        <h2 className="text-white font-bold text-[15px] mb-2.5">Hypotheses — Scored</h2>
        {sortedHypos.map(h => (
          <div key={h.id}
            className={`my-1.5 cursor-pointer p-1.5 rounded transition-colors ${activeHypo === h.id ? 'bg-white/10 border-l-[3px] border-l-[#ffcc00]' : 'hover:bg-white/5'}`}
            onClick={() => toggleHypo(h.id)}
          >
            <div>
              <span className="font-semibold" style={{ color: h.color }}>{h.id}: {h.name}</span>
              <span className="float-right font-bold" style={{ color: h.color }}>{h.score}/10</span>
            </div>
            <div className="text-[11px] text-[#888] mt-0.5">{h.desc}</div>
            <div className="bg-[#222] h-1 rounded mt-1">
              <div className="h-1 rounded transition-[width] duration-500" style={{ width: `${h.score / 10 * 100}%`, background: h.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Signal Panel */}
      <div className="absolute bottom-3 left-3 right-3 z-50 text-[11px] max-h-[180px] overflow-y-auto" style={{
        background: 'rgba(15,15,25,0.9)', border: '1px solid #333', borderRadius: 8, padding: '12px 16px'
      }}>
        <h3 className="text-white font-bold text-[13px] mb-1.5">📡 Live Signals — Validated Feb 8-9, 2026</h3>
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
