import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#080810' }}>
      <nav className="fixed top-0 left-0 right-0 z-[200] flex items-center gap-4 px-4 py-2 text-xs"
           style={{ background: 'rgba(8,8,16,0.92)', borderBottom: '1px solid #1a1a2a', backdropFilter: 'blur(8px)' }}>
        <NavLink to="/" end className={({ isActive }) =>
          `px-3 py-1 rounded transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`
        }>⚖️ Thesis</NavLink>
        <NavLink to="/graph" className={({ isActive }) =>
          `px-3 py-1 rounded transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`
        }>🎮 Graph</NavLink>
        <NavLink to="/republic-health" className={({ isActive }) =>
          `px-3 py-1 rounded transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`
        }>🏛️ Republic Health</NavLink>
        <NavLink to="/common-sense" className={({ isActive }) =>
          `px-3 py-1 rounded transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`
        }>📜 Common Sense</NavLink>
      </nav>
      <div className="pt-8">
        {children}
      </div>
    </div>
  )
}
