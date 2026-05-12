'use client'

import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Board from './components/Board'
import IssueList from './components/IssueList'
import FrameworkView from './components/FrameworkView'
import StuckLoops from './components/StuckLoops'

export type PageKey = 'dashboard' | 'board' | 'list' | 'stuck' | 'framework'

export default function Home() {
  const [active, setActive] = useState<PageKey>('dashboard')
  const [open, setOpen] = useState(true)

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <Sidebar active={active} onChange={setActive} isOpen={open} onToggle={setOpen} />
      <div className={`transition-all duration-300 ${open ? 'ml-64' : 'ml-0'}`}>
        {active === 'dashboard' && <Dashboard onNavigate={setActive} />}
        {active === 'board' && <Board />}
        {active === 'list' && <IssueList />}
        {active === 'stuck' && <StuckLoops />}
        {active === 'framework' && <FrameworkView />}
      </div>
    </div>
  )
}
