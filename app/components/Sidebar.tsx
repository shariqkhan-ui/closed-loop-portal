'use client'

import { LayoutDashboard, KanbanSquare, List, AlertTriangle, BookOpen, Menu, ChevronLeft, Plus, LogOut } from 'lucide-react'
import type { PageKey } from '../page'
import { useState } from 'react'
import NewIssueModal from './NewIssueModal'
import { doSignOut } from '../actions'

interface Props {
  active: PageKey
  onChange: (p: PageKey) => void
  isOpen: boolean
  onToggle: (v: boolean) => void
}

export default function Sidebar({ active, onChange, isOpen, onToggle }: Props) {
  const [showNew, setShowNew] = useState(false)

  const items: { id: PageKey; label: string; icon: React.ElementType; hint?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, hint: 'Counts by stage and severity' },
    { id: 'board', label: 'Stage Board', icon: KanbanSquare, hint: '7-column kanban' },
    { id: 'list', label: 'All Issues', icon: List },
    { id: 'stuck', label: 'Stuck Loops', icon: AlertTriangle, hint: 'Past 1.5× SLA' },
    { id: 'framework', label: 'Framework', icon: BookOpen, hint: 'The 7-stage reference' },
  ]

  return (
    <>
      <button
        onClick={() => onToggle(!isOpen)}
        className={`fixed top-4 z-50 p-2 rounded-md border transition-all ${isOpen ? 'left-60' : 'left-4'}`}
        style={{ background: 'var(--paper)', borderColor: 'var(--rule)' }}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 transition-transform duration-300 border-r ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--paper)', borderColor: 'var(--rule)' }}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 pt-7 pb-5 border-b" style={{ borderColor: 'var(--rule)' }}>
            <div className="eyebrow mb-2">Wiom · Netbox</div>
            <h1 className="font-serif text-2xl leading-none" style={{ color: 'var(--ink)' }}>
              Netbox <em className="italic font-light" style={{ color: 'var(--accent)' }}>Issue</em>
            </h1>
            <p className="text-[11px] font-mono mt-2" style={{ color: 'var(--ink-mute)' }}>
              Detection → Closure
            </p>
          </div>

          <div className="px-4 pt-4">
            <button
              onClick={() => setShowNew(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md font-medium text-sm transition"
              style={{ background: 'var(--accent)', color: 'var(--paper)' }}
            >
              <Plus className="w-4 h-4" /> New Issue
            </button>
          </div>

          <nav className="flex-1 px-3 pt-5 space-y-1">
            {items.map(item => {
              const Icon = item.icon
              const isActive = active === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onChange(item.id)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition-colors`}
                  style={{
                    background: isActive ? 'var(--paper-2)' : 'transparent',
                    color: isActive ? 'var(--ink)' : 'var(--ink-2)',
                  }}
                >
                  <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium leading-tight">{item.label}</div>
                    {item.hint && (
                      <div className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--ink-mute)' }}>
                        {item.hint}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </nav>

          <div className="px-4 py-4 border-t space-y-2" style={{ borderColor: 'var(--rule)' }}>
            <p className="px-1 text-[11px] font-mono leading-relaxed" style={{ color: 'var(--ink-mute)' }}>
              Issue-ID travels every stage.<br />
              Aging clock per stage.<br />
              Stuck loops auto-escalate.
            </p>
            <form action={doSignOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition hover:bg-[color:var(--paper-2)]"
                style={{ color: 'var(--ink-2)' }}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {showNew && <NewIssueModal onClose={() => setShowNew(false)} />}
    </>
  )
}
