'use client'

import { useMemo, useState } from 'react'
import { useIssues } from '../hooks/useIssues'
import StageBadge, { SeverityBadge } from './StageBadge'
import AgingClock from './AgingClock'
import IssueDrawer from './IssueDrawer'
import { Search } from 'lucide-react'
import { STAGES } from '@/lib/framework'
import type { LoopStage } from '@/lib/supabase'

export default function IssueList() {
  const { issues, loading } = useIssues()
  const [drawer, setDrawer] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [stageFilter, setStageFilter] = useState<LoopStage | 'all'>('all')
  const [sevFilter, setSevFilter] = useState<'all' | 'P0' | 'P1' | 'P2'>('all')

  const filtered = useMemo(() => {
    return issues.filter(i => {
      if (stageFilter !== 'all' && i.current_stage !== stageFilter) return false
      if (sevFilter !== 'all' && i.severity !== sevFilter) return false
      if (q) {
        const blob = (i.issue_code + ' ' + i.title + ' ' + (i.scope_detail || '') + ' ' + (i.owner_name || '')).toLowerCase()
        if (!blob.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [issues, stageFilter, sevFilter, q])

  return (
    <main className="min-h-screen">
      <header className="px-10 pt-10 pb-5 border-b" style={{ borderColor: 'var(--rule)' }}>
        <div className="eyebrow mb-2">All issues</div>
        <h1 className="font-serif text-4xl tracking-tight">{filtered.length} of {issues.length}</h1>
      </header>

      <div className="px-10 py-4 flex flex-wrap gap-3 items-center border-b" style={{ borderColor: 'var(--rule)' }}>
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-mute)' }} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by ID, title, owner, scope…"
            className="w-full pl-9 pr-3 py-2 border text-sm focus:outline-none"
            style={{ borderColor: 'var(--rule)', background: 'var(--paper)' }}
          />
        </div>
        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value as LoopStage | 'all')}
          className="border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--rule)', background: 'var(--paper)' }}
        >
          <option value="all">All stages</option>
          {STAGES.map(s => <option key={s.key} value={s.key}>{s.num} · {s.name}</option>)}
          <option value="closed">Closed</option>
          <option value="reopened">Reopened</option>
        </select>
        <select
          value={sevFilter}
          onChange={e => setSevFilter(e.target.value as 'all' | 'P0' | 'P1' | 'P2')}
          className="border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--rule)', background: 'var(--paper)' }}
        >
          <option value="all">All severities</option>
          <option value="P0">P0 · Critical</option>
          <option value="P1">P1 · Default</option>
          <option value="P2">P2 · Standard</option>
        </select>
      </div>

      <div className="px-10 py-6">
        {loading && <p className="text-sm" style={{ color: 'var(--ink-mute)' }}>Loading…</p>}
        {!loading && filtered.length === 0 && (
          <p className="font-serif italic" style={{ color: 'var(--ink-mute)' }}>No issues match the current filter.</p>
        )}
        <div className="divide-y" style={{ borderColor: 'var(--rule)' }}>
          {filtered.map(i => (
            <button
              key={i.id}
              onClick={() => setDrawer(i.id)}
              className="w-full text-left py-3 grid grid-cols-[120px_70px_1fr_180px_120px_120px] gap-4 items-center hover:bg-[color:var(--paper-2)] transition px-2 -mx-2 rounded"
            >
              <span className="font-mono text-xs" style={{ color: 'var(--ink-mute)' }}>{i.issue_code}</span>
              <SeverityBadge severity={i.severity} />
              <div className="min-w-0">
                <div className="text-[14px] font-medium truncate">{i.title}</div>
                {i.scope_detail && <div className="text-[11px] truncate" style={{ color: 'var(--ink-mute)' }}>{i.scope_detail}</div>}
              </div>
              <div className="text-[12px]" style={{ color: 'var(--ink-2)' }}>{i.owner_name || '—'}</div>
              <StageBadge stage={i.current_stage} />
              <AgingClock issue={i} compact />
            </button>
          ))}
        </div>
      </div>

      {drawer && <IssueDrawer issueId={drawer} onClose={() => setDrawer(null)} />}
    </main>
  )
}
