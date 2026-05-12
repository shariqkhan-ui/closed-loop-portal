'use client'

import { useMemo, useState } from 'react'
import { useIssues } from '../hooks/useIssues'
import { STAGES, STAGE_COLOR } from '@/lib/framework'
import IssueDrawer from './IssueDrawer'
import { SeverityBadge } from './StageBadge'
import AgingClock from './AgingClock'
import type { LoopStage } from '@/lib/supabase'

export default function Board() {
  const { issues, loading } = useIssues()
  const [drawer, setDrawer] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const map: Record<string, typeof issues> = {}
    STAGES.forEach(s => (map[s.key] = []))
    issues.forEach(i => {
      if (i.current_stage === 'closed' || i.current_stage === 'reopened') return
      ;(map[i.current_stage] = map[i.current_stage] || []).push(i)
    })
    return map
  }, [issues])

  return (
    <main className="min-h-screen">
      <header className="px-10 pt-10 pb-5 border-b" style={{ borderColor: 'var(--rule)' }}>
        <div className="eyebrow mb-2">Section 04</div>
        <h1 className="font-serif text-4xl tracking-tight">Stage board.</h1>
        <p className="font-serif italic mt-2" style={{ color: 'var(--ink-2)' }}>
          Seven columns, one per stage. Click any card for the full loop.
        </p>
      </header>

      {loading && <p className="px-10 py-6 text-sm" style={{ color: 'var(--ink-mute)' }}>Loading…</p>}

      <div className="overflow-x-auto">
        <div className="px-10 py-6 flex gap-3 min-w-max">
          {STAGES.map(s => {
            const items = grouped[s.key] || []
            const color = STAGE_COLOR[s.key as LoopStage]
            return (
              <div key={s.key} className="w-[260px] shrink-0">
                <div className="border-t-2 pt-3" style={{ borderColor: color }}>
                  <div className="flex items-baseline justify-between mb-3 px-1">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--ink-mute)' }}>{s.num}</div>
                      <div className="font-serif text-lg leading-tight">{s.name}</div>
                    </div>
                    <span className="font-serif text-2xl font-light" style={{ color: 'var(--ink-faint)' }}>{items.length}</span>
                  </div>
                  <div className="text-[10px] font-mono mb-3 px-1" style={{ color: 'var(--ink-mute)' }}>
                    {s.owner.toUpperCase()} · {s.clockP1}
                  </div>
                  <div className="space-y-2">
                    {items.length === 0 && (
                      <div className="text-[11px] italic px-1" style={{ color: 'var(--ink-faint)' }}>—</div>
                    )}
                    {items.map(i => (
                      <button
                        key={i.id}
                        onClick={() => setDrawer(i.id)}
                        className="w-full text-left border p-3 hover:shadow transition"
                        style={{ borderColor: 'var(--rule)', background: 'var(--paper)' }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px]" style={{ color: 'var(--ink-mute)' }}>{i.issue_code}</span>
                          <SeverityBadge severity={i.severity} />
                        </div>
                        <div className="text-[13px] font-medium leading-snug mb-1.5 line-clamp-3">{i.title}</div>
                        {i.owner_name && (
                          <div className="text-[11px]" style={{ color: 'var(--ink-mute)' }}>
                            {i.owner_name}{i.owner_team ? ` · ${i.owner_team}` : ''}
                          </div>
                        )}
                        <div className="mt-2"><AgingClock issue={i} compact /></div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {drawer && <IssueDrawer issueId={drawer} onClose={() => setDrawer(null)} />}
    </main>
  )
}
