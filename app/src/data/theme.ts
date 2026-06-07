// Display colors keyed by node type / edge type / incentive relation.
// Pure config; no runtime mutation.

import type { IncentiveRelation } from './types'

export const typeColors: Record<string, string> = {
  major:      '#ff4444',
  swing:      '#44aaff',
  signal:     '#ffaa00',
  domain:     '#aa44ff',
  institution:'#44ff88',
  indicator:  '#22d3ee',
  instrument: '#8899bb',
  bloc:       '#e879f9',
  document:   '#cbd5e1',
  person:     '#fde68a',
}

export const edgeColors: Record<string, string> = {
  conflict:    '#ff6666',
  cooperation: '#66ff66',
  economic:    '#ffcc00',
  signal:      '#cc66ff',
  influence:   '#555',
  structural:  '#22d3ee',
}

export const incentiveRelationColors: Record<IncentiveRelation, string> = {
  holds:          '#7dd3fc',
  donates_to:     '#fbbf24',
  lobbies_on:     '#f472b6',
  sponsors:       '#34d399',
  benefits_from:  '#a78bfa',
  controls:       '#fb923c',
  conflicts_with: '#f87171',
  authored:       '#cbd5e1',
  named_in:       '#fde68a',
}

// instrument node color — exported for direct use in the legend; also folded
// into typeColors above so any consumer keying off node.type works uniformly.
export const instrumentColor = '#8899bb'
