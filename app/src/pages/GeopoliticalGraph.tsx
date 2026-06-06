import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import {
  nodes as rawNodes, edges as rawEdges,
  typeColors, edgeColors,
  instruments, incentiveEdges, incentiveRelationColors, instrumentColor,
  captureNodes, captureEdges,
  sources, indicatorData, formatIndicator, signalProvenance,
} from '../data'
import type { GraphNode, GraphEdge, IncentiveEdge, SignalCohort } from '../data'

// Human label for the cohort tag shown next to signals lacking a precise event date.
const cohortLabel: Record<SignalCohort, string> = {
  'feb-2026': 'Feb 2026',
  'jun-2026': 'Jun 2026',
}

// Instruments that a capture edge points into (the BLOC_DEFENSE → INST_F35
// cross-link). These belong to the incentives layer, but the capture story
// needs them visible: an arrow into a hidden node reads as a dangling claim.
// So the Capture lens reveals exactly these, even with the Incentives lens off.
const captureLinkedInstrumentIds = new Set(
  captureEdges
    .map(e => e.target)
    .filter(id => instruments.some(i => i.id === id))
)

// Compact "age" string for an ISO date — used to convey indicator freshness
// alongside the literal asOf. Stops at years; not meant for ancient dates.
function relativeAge(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  if (days < 0) return 'future'
  if (days === 0) return 'today'
  if (days === 1) return '1d ago'
  if (days < 14) return `${days}d ago`
  if (days < 60) return `${Math.floor(days / 7)}w ago`
  if (days < 730) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export default function GeopoliticalGraph() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [showIncentives, setShowIncentives] = useState(false)
  const [showCapture, setShowCapture] = useState(false)
  const [showSources, setShowSources] = useState(false)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null)
  const [edgeTip, setEdgeTip] = useState<{ x: number; y: number; edge: IncentiveEdge } | null>(null)

  // ENH-04: export the full graph state as a JSON blob the user can download.
  const exportGraphJson = useCallback(() => {
    const payload = JSON.stringify({
      meta: { exportedAt: new Date().toISOString() },
      nodes: rawNodes,
      edges: rawEdges,
      instruments,
      incentiveEdges,
      captureNodes,
      captureEdges,
      indicatorData,
      signalProvenance,
      sources,
    }, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `geopolitics-graph-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const signalNodes = rawNodes.filter(n => n.type === 'signal')
  const indicatorNodes = rawNodes.filter(n => n.type === 'indicator')

  useEffect(() => {
    if (!svgRef.current) return

    // A11Y-01: respect the user's motion preference. If reduced motion is set,
    // settle the force simulation synchronously and skip all transitions —
    // gives motion-sensitive users a stable graph instead of a kinetic one.
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    let width = window.innerWidth
    let height = window.innerHeight
    svg.attr('width', width).attr('height', height)
      .attr('role', 'img')
      .attr('aria-labelledby', 'graph-title graph-desc')

    svg.append('title').attr('id', 'graph-title').text('Geopolitical structural graph')
    svg.append('desc').attr('id', 'graph-desc').text(
      'Force-directed graph of actors, domains, institutions, signals, indicators, ' +
      'incentive instruments, and capture blocs/documents. Use Tab to focus a node; Enter or Space to surface ' +
      'its detail; Escape to dismiss. Toggle the Incentives Lens and Capture Lens with their buttons.'
    )

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
    const capNodes = captureNodes.map(d => ({ ...d }))
    const allNodes = [...baseNodes, ...instNodes, ...capNodes]

    const baseEdges = rawEdges.map(d => ({ ...d }))
    const incEdges = incentiveEdges.map(d => ({ ...d }))
    const capEdges = captureEdges.map(d => ({ ...d }))
    const forceLinks: Array<GraphEdge | IncentiveEdge> = [...baseEdges, ...incEdges, ...capEdges]

    const isInc = (l: GraphEdge | IncentiveEdge): l is IncentiveEdge => 'relation' in l

    const simulation = d3.forceSimulation<GraphNode>(allNodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge | IncentiveEdge>(forceLinks)
        .id(d => d.id)
        .distance(l => isInc(l) ? 90 : (l.type === 'signal' ? 60 : l.type === 'influence' ? 100 : 120))
        .strength(l => isInc(l) ? 0.04 : (l as GraphEdge).strength / 15))
      .force('charge', d3.forceManyBody<GraphNode>()
        .strength(d => d.type === 'signal' ? -80
          : d.type === 'instrument' ? -120
            : d.type === 'document' ? -100
              : d.type === 'bloc' ? -180
                : d.type === 'institution' ? -220
                  : -250))
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

    const capLink = g.append('g').selectAll('line')
      .data(capEdges).join('line')
      .attr('class', 'cap-link')
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

    // First-sentence summary for a node's aria-label. Detail strings are
    // multi-line; we trim to the first sentence to keep screen-reader output short.
    const a11yLabel = (d: GraphNode): string => {
      const summary = d.detail.split(/[\n.]/)[0].trim()
      return `${d.label}. ${summary}.`
    }

    const mkNodeTooltip = (sel: d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown>) => {
      sel
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('aria-label', a11yLabel)
        .on('mouseover', (e, d) => setTooltip({ x: e.pageX + 15, y: e.pageY - 10, node: d }))
        .on('mousemove', e => setTooltip(prev => prev ? { ...prev, x: e.pageX + 15, y: e.pageY - 10 } : null))
        .on('mouseout', () => setTooltip(null))
        // Keyboard / focus access — anchor tooltip to node's screen rect since
        // there's no mouse event to pull pageX/pageY from.
        .on('focus', function (_, d) {
          const rect = (this as SVGGElement).getBoundingClientRect()
          setTooltip({ x: rect.right + window.scrollX + 5, y: rect.top + window.scrollY, node: d })
        })
        .on('blur', () => setTooltip(null))
        .on('keydown', function (e: KeyboardEvent, d) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            const rect = (this as SVGGElement).getBoundingClientRect()
            setTooltip({ x: rect.right + window.scrollX + 5, y: rect.top + window.scrollY, node: d })
          } else if (e.key === 'Escape') {
            setTooltip(null)
            ;(this as SVGGElement).blur()
          }
        })
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
      .text(d => {
        // Indicator nodes: compose label with formatted live value so the
        // graph reflects the datum, not a hand-edited string.
        const datum = indicatorData[d.id]
        return d.type === 'indicator' && datum
          ? `${d.label} ${formatIndicator(datum)}`
          : d.label
      })
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

    // --- capture nodes (hidden until the lens is on) ---
    const capNode = g.append('g').selectAll<SVGGElement, GraphNode>('g')
      .data(capNodes).join('g')
      .attr('class', 'capture-node-group')
      .style('opacity', 0).style('pointer-events', 'none')
      .call(dragBehavior)

    capNode.each(function (d) {
      const group = d3.select(this)
      if (d.type === 'document') {
        group.append('rect')
          .attr('x', -d.r).attr('y', -d.r * 0.7)
          .attr('width', d.r * 2).attr('height', d.r * 1.4)
          .attr('rx', 4)
          .attr('fill', typeColors[d.type]).attr('fill-opacity', 0.9)
          .attr('stroke', d3.color(typeColors[d.type])!.brighter(0.6).formatHex())
          .attr('stroke-width', 1.5).attr('stroke-dasharray', '3,2')
          .style('cursor', 'pointer')
      } else {
        group.append('circle')
          .attr('r', d.r)
          .attr('fill', typeColors[d.type]).attr('fill-opacity', d.type === 'institution' ? 0.9 : 0.85)
          .attr('stroke', d3.color(typeColors[d.type])!.brighter(0.5).formatHex())
          .attr('stroke-width', d.type === 'institution' ? 3 : 2)
          .style('cursor', 'pointer')
      }
    })
    capNode.filter(d => d.type === 'institution').select('circle').attr('filter', 'url(#glow)')

    capNode.append('text')
      .attr('dy', d => d.type === 'document' ? d.r + 13 : d.r + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.type === 'document' ? '#cbd5e1' : '#ddd')
      .attr('font-size', d => d.type === 'document' ? '10px' : '11px')
      .attr('font-weight', '600')
      .attr('pointer-events', 'none')
      .text(d => d.label)
    mkNodeTooltip(capNode)

    const tick = () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!).attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!).attr('y2', d => (d.target as GraphNode).y!)
      incLink
        .attr('x1', d => (d.source as unknown as GraphNode).x!).attr('y1', d => (d.source as unknown as GraphNode).y!)
        .attr('x2', d => (d.target as unknown as GraphNode).x!).attr('y2', d => (d.target as unknown as GraphNode).y!)
      capLink
        .attr('x1', d => (d.source as unknown as GraphNode).x!).attr('y1', d => (d.source as unknown as GraphNode).y!)
        .attr('x2', d => (d.target as unknown as GraphNode).x!).attr('y2', d => (d.target as unknown as GraphNode).y!)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
      instNode.attr('transform', d => `translate(${d.x},${d.y})`)
      capNode.attr('transform', d => `translate(${d.x},${d.y})`)
    }
    simulation.on('tick', tick)

    // A11Y-01: under prefers-reduced-motion, settle the layout synchronously
    // and stop the simulation so the graph appears static with no animation.
    if (reducedMotion) {
      simulation.stop()
      for (let i = 0; i < 300; i++) simulation.tick()
      tick()
    }

    // --- resize handling (was missing; graph used to break on resize) ---
    const handleResize = () => {
      width = window.innerWidth; height = window.innerHeight
      svg.attr('width', width).attr('height', height)
      simulation.force('center', d3.forceCenter(width / 2, height / 2))
      simulation.force('x', d3.forceX(width / 2).strength(0.03))
      simulation.force('y', d3.forceY(height / 2).strength(0.03))
      if (reducedMotion) {
        simulation.stop()
        for (let i = 0; i < 100; i++) simulation.tick()
        tick()
      } else {
        simulation.alpha(0.3).restart()
      }
    }
    window.addEventListener('resize', handleResize)

    return () => { window.removeEventListener('resize', handleResize); simulation.stop() }
  }, [])

  // Incentive lens — owns visibility of instrument nodes + incentive links,
  // and gently dims the base graph so the who-benefits layer reads on top.
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dur = reducedMotion ? 0 : 300
    const anyLensOn = showIncentives || showCapture

    // Incentives lens shows all instruments; the Capture lens additionally
    // reveals the specific instruments its edges terminate on, so no capture
    // arrow points at an invisible node.
    const instrumentVisible = (d: GraphNode) =>
      showIncentives || (showCapture && captureLinkedInstrumentIds.has(d.id))
    svg.selectAll<SVGGElement, GraphNode>('g.inst-node-group')
      .transition().duration(dur)
      .style('opacity', d => instrumentVisible(d) ? 1 : 0)
      .style('pointer-events', d => instrumentVisible(d) ? 'all' : 'none')

    svg.selectAll<SVGGElement, GraphNode>('g.capture-node-group')
      .transition().duration(dur)
      .style('opacity', showCapture ? 1 : 0)
      .style('pointer-events', showCapture ? 'all' : 'none')

    svg.selectAll<SVGLineElement, IncentiveEdge>('line.inc-link')
      .transition().duration(dur)
      .attr('stroke-opacity', d => showIncentives ? (0.2 + d.confidence * 0.6) : 0)

    svg.selectAll<SVGLineElement, IncentiveEdge>('line.cap-link')
      .transition().duration(dur)
      .attr('stroke-opacity', d => showCapture ? (0.2 + d.confidence * 0.6) : 0)

    svg.selectAll<SVGCircleElement, GraphNode>('circle.base-node')
      .transition().duration(dur)
      .attr('fill-opacity', d =>
        anyLensOn ? (d.type === 'signal' ? 0.35 : 0.45) : (d.type === 'signal' ? 0.7 : 0.85))
    svg.selectAll<SVGLineElement, GraphEdge>('line.base-link')
      .transition().duration(dur)
      .attr('stroke-opacity', d =>
        anyLensOn ? 0.12 : (d.type === 'signal' ? 0.3 : 0.5))
  }, [showIncentives, showCapture])

  return (
    <div className="relative w-screen" style={{ height: 'calc(100vh - 32px)', overflow: 'hidden' }}>
      <svg ref={svgRef} className="w-full h-full" />

      {/* Lens toggles */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
        <button
          onClick={() => setShowCapture(v => !v)}
          className="text-xs font-semibold px-3 py-1.5 rounded transition-colors"
          style={{
            background: showCapture ? 'rgba(34,211,238,0.22)' : 'rgba(15,15,25,0.9)',
            border: `1px solid ${showCapture ? '#22d3ee' : '#333'}`,
            color: showCapture ? '#a5f3fc' : '#aaa',
          }}
        >
          {showCapture ? '◉' : '◯'} Capture Lens
        </button>
        <button
          onClick={() => setShowIncentives(v => !v)}
          className="text-xs font-semibold px-3 py-1.5 rounded transition-colors"
          style={{
            background: showIncentives ? 'rgba(167,139,250,0.25)' : 'rgba(15,15,25,0.9)',
            border: `1px solid ${showIncentives ? '#a78bfa' : '#333'}`,
            color: showIncentives ? '#c4b5fd' : '#aaa',
          }}
        >
          {showIncentives ? '◉' : '◯'} Incentives Lens
        </button>
      </div>

      {/* Node tooltip */}
      {tooltip && (
        <div className="absolute pointer-events-none z-[100]" style={{
          left: tooltip.x, top: tooltip.y, background: 'rgba(15,15,25,0.95)',
          border: '1px solid #444', borderRadius: 8, padding: '12px 16px', maxWidth: 380,
          fontSize: 13, lineHeight: 1.5, boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
        }}>
          <h3 className="text-white font-bold text-[15px] mb-1">{tooltip.node.label}</h3>
          {tooltip.node.ids && (
            <div className="flex flex-wrap gap-1 mb-1.5 font-mono text-[9.5px]">
              {tooltip.node.ids.wikidata && (
                <span className="px-1.5 py-[1px] rounded" style={{ background: '#1a1d2e', color: '#a5b4fc', border: '1px solid #2a2f4a' }}>
                  WD:{tooltip.node.ids.wikidata}
                </span>
              )}
              {tooltip.node.ids.ticker && (
                <span className="px-1.5 py-[1px] rounded" style={{ background: '#0c1f1a', color: '#86efac', border: '1px solid #1a3a2e' }}>
                  ${tooltip.node.ids.ticker}
                </span>
              )}
              {tooltip.node.ids.cik && (
                <span className="px-1.5 py-[1px] rounded" style={{ background: '#1f1a0c', color: '#fcd34d', border: '1px solid #3a2e1a' }}>
                  CIK:{tooltip.node.ids.cik}
                </span>
              )}
              {tooltip.node.ids.lei && (
                <span className="px-1.5 py-[1px] rounded" style={{ background: '#1f1a0c', color: '#fdba74', border: '1px solid #3a2e1a' }}>
                  LEI:{tooltip.node.ids.lei}
                </span>
              )}
              {tooltip.node.ids.bioguide && (
                <span className="px-1.5 py-[1px] rounded" style={{ background: '#1a0c1f', color: '#f0abfc', border: '1px solid #2e1a3a' }}>
                  BG:{tooltip.node.ids.bioguide}
                </span>
              )}
            </div>
          )}
          <div className="text-[#aaa] whitespace-pre-line mb-1">{tooltip.node.detail}</div>
          {tooltip.node.type === 'signal' && signalProvenance[tooltip.node.id] && (() => {
            const p = signalProvenance[tooltip.node.id]
            const src = sources[p.sourceId]
            return (
              <div className="mt-2 pt-2 border-t border-[#2a3540] text-[12px]">
                <div className="italic text-[#bbb] mb-1">"{p.quote}"</div>
                <div className="text-[10.5px] text-[#778]">
                  {src?.name ?? p.sourceId}{src ? ` (${src.tier})` : ''} · captured {p.asOf}
                  {tooltip.node.date && tooltip.node.date !== p.asOf && (
                    <span className="text-[#556]"> · event {tooltip.node.date}</span>
                  )}
                </div>
              </div>
            )
          })()}
          {tooltip.node.type === 'indicator' && indicatorData[tooltip.node.id] && (() => {
            const d = indicatorData[tooltip.node.id]
            const src = sources[d.sourceId]
            return (
              <div className="mt-2 pt-2 border-t border-[#2a3540]">
                <div className="font-mono font-bold text-[#cffafe] text-[14px]">{formatIndicator(d)}</div>
                {(d.changeYtd !== undefined || d.changePct1y !== undefined) && (
                  <div className="font-mono text-[11px] mt-0.5">
                    {d.changeYtd !== undefined && (
                      <span style={{ color: d.changeYtd >= 0 ? '#86efac' : '#fca5a5' }}>
                        YTD {d.changeYtd >= 0 ? '+' : ''}{d.changeYtd}%
                      </span>
                    )}
                    {d.changeYtd !== undefined && d.changePct1y !== undefined && <span className="text-[#556]"> · </span>}
                    {d.changePct1y !== undefined && (
                      <span style={{ color: d.changePct1y >= 0 ? '#86efac' : '#fca5a5' }}>
                        1Y {d.changePct1y >= 0 ? '+' : ''}{d.changePct1y}%
                      </span>
                    )}
                  </div>
                )}
                <div className="text-[10.5px] text-[#778] mt-1">
                  as of {d.asOf} <span className="text-[#556]">({relativeAge(d.asOf)})</span> · {src?.name ?? d.sourceId}{src ? ` (${src.tier})` : ''}
                </div>
              </div>
            )
          })()}
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
        <div className="text-[11px] text-[#888] mb-2">Feb baseline + Jun refresh — Force-directed model with incentive + capture lenses</div>
        <div className="font-semibold text-[#aaa] mb-1">Node Types</div>
        {[
          { color: '#ff4444', label: 'Major Power' },
          { color: '#44aaff', label: 'Swing Actor' },
          { color: '#ffaa00', label: 'Signal (event)' },
          { color: '#aa44ff', label: 'Domain / Theater' },
          { color: '#44ff88', label: 'Institution / Framework' },
          { color: '#22d3ee', label: 'Indicator (live market)' },
          { color: instrumentColor, label: 'Instrument (lens)' },
          { color: typeColors.bloc, label: 'Bloc (capture)' },
          { color: typeColors.document, label: 'Document (capture)' },
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
            {indicatorNodes.map(ind => {
              const d = indicatorData[ind.id]
              const src = d ? sources[d.sourceId] : undefined
              return (
                <div key={ind.id} className="rounded-md border border-[#1f2a30] bg-[#0c1418] px-2.5 py-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-semibold text-[#a5f3fc] text-[11.5px]">{ind.label}</div>
                    {d && (
                      <div className="font-mono font-bold text-[11.5px] text-[#cffafe] whitespace-nowrap">
                        {formatIndicator(d)}
                      </div>
                    )}
                  </div>
                  {d && (d.changeYtd !== undefined || d.changePct1y !== undefined) && (
                    <div className="text-[10px] mt-0.5 font-mono">
                      {d.changeYtd !== undefined && (
                        <span style={{ color: d.changeYtd >= 0 ? '#86efac' : '#fca5a5' }}>
                          YTD {d.changeYtd >= 0 ? '+' : ''}{d.changeYtd}%
                        </span>
                      )}
                      {d.changeYtd !== undefined && d.changePct1y !== undefined && <span className="text-[#445]"> · </span>}
                      {d.changePct1y !== undefined && (
                        <span style={{ color: d.changePct1y >= 0 ? '#86efac' : '#fca5a5' }}>
                          1Y {d.changePct1y >= 0 ? '+' : ''}{d.changePct1y}%
                        </span>
                      )}
                    </div>
                  )}
                  {d?.notes && (
                    <div className="text-[10.5px] text-[#7a8a90] mt-0.5">{d.notes}</div>
                  )}
                  {d && (
                    <div className="text-[10px] text-[#556] mt-1">
                      as of {d.asOf} <span className="text-[#445]">({relativeAge(d.asOf)})</span> · {src?.name ?? d.sourceId}
                    </div>
                  )}
                </div>
              )
            })}
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

        <div className="my-3 border-t border-[#2a2a3a]" />

        <section>
          <h2 className="text-white font-bold text-[15px] mb-1">🏛️ Capture Layer</h2>
          <div className="text-[10.5px] text-[#777] mb-2.5">
            A symmetric bloc-to-government receipt map — the claims behind the thesis.
          </div>

          <div className="rounded-md border border-[#242434] bg-[#10101a] px-3 py-2 mb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#ccc]">Lens status</span>
              <span className="font-bold" style={{ color: showCapture ? '#67e8f9' : '#888' }}>
                {showCapture ? 'Active' : 'Off'}
              </span>
            </div>
            <div className="mt-1 text-[10.5px] text-[#888]">
              {showCapture
                ? 'Blocs, documents, and the contested institution are visible on the graph.'
                : 'Turn on the Capture Lens to surface blocs, documents, and constitutional government.'}
            </div>
          </div>

          <div className="space-y-2 mb-3">
            {captureNodes.map(node => (
              <div key={node.id} className="rounded-md border border-[#242434] bg-[#10101a] px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold" style={{ color: typeColors[node.type] }}>{node.label}</div>
                  <span className="text-[9px] uppercase tracking-wider text-[#667]">{node.type}</span>
                </div>
                <div className="text-[10.5px] text-[#888] mt-0.5">
                  {node.detail.split('.')[0]}.
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

        <div className="my-3 border-t border-[#2a2a3a]" />

        {/* ENH-04: Sources & Export */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white font-bold text-[15px]">🗂️ Sources & Export</h2>
            <button
              onClick={exportGraphJson}
              className="text-[10.5px] px-2 py-1 rounded hover:bg-white/10 transition-colors"
              style={{ border: '1px solid #2a3a4a', color: '#a5b4fc' }}
              title="Download the full graph (nodes, edges, instruments, capture nodes/edges, indicators, signal provenance, sources) as JSON"
            >
              📥 Export JSON
            </button>
          </div>

          <button
            onClick={() => setShowSources(v => !v)}
            className="w-full text-left text-[10.5px] text-[#888] hover:text-[#ccc] transition-colors flex items-center justify-between"
          >
            <span>{showSources ? '▾' : '▸'} Registry ({Object.keys(sources).length} sources, 6 tiers)</span>
          </button>

          {showSources && (() => {
            const tierOrder: Array<'structural' | 'primary' | 'market' | 'feed' | 'model' | 'news'> =
              ['structural', 'primary', 'market', 'feed', 'model', 'news']
            const byTier = tierOrder.map(tier => ({
              tier,
              entries: Object.values(sources).filter(s => s.tier === tier).sort((a, b) => a.name.localeCompare(b.name)),
            })).filter(g => g.entries.length > 0)
            return (
              <div className="mt-2 space-y-2">
                {byTier.map(({ tier, entries }) => (
                  <div key={tier}>
                    <div className="text-[10px] uppercase tracking-wider text-[#667] font-semibold mb-1">
                      {tier} ({entries.length})
                    </div>
                    <ul className="space-y-0.5 text-[10.5px]">
                      {entries.map(s => (
                        <li key={s.id} className="text-[#aab] leading-snug">
                          <span className="font-semibold">{s.name}</span>{' '}
                          <span className="text-[#556]">({s.id})</span>{' '}
                          {s.url && (
                            <a href={s.url} target="_blank" rel="noopener noreferrer"
                               className="text-[#7dd3fc] hover:underline">↗</a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )
          })()}
        </section>
      </div>

      {/* Signal Panel */}
      <div className="absolute bottom-3 left-3 right-3 z-40 text-[11px] max-h-[180px] overflow-y-auto" style={{
        background: 'rgba(15,15,25,0.9)', border: '1px solid #333', borderRadius: 8, padding: '12px 16px'
      }}>
        <h3 className="text-white font-bold text-[13px] mb-1.5">📡 Signals — Feb baseline + Jun refresh</h3>
        {signalNodes.map(s => {
          // Prefer the per-signal event date; fall back to the cohort label
          // when the source material doesn't pin a date.
          const tag = s.date ?? (s.cohort ? cohortLabel[s.cohort] : '')
          return (
            <div key={s.id} className="flex items-start py-1 border-b border-[#1a1a2a] last:border-b-0">
              <div className="w-2 h-2 rounded-full bg-[#ffaa00] mr-2 mt-1 shrink-0" />
              <div className="flex-1">
                <strong>{s.label}</strong><br />
                <span className="text-[#888]">{s.detail.split('.')[0]}.</span>
              </div>
              {tag && (
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-mono whitespace-nowrap"
                      style={{ border: '1px solid #2a3540', color: '#7a8a90', background: '#0c1418' }}>
                  {tag}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
