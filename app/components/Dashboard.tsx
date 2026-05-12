'use client'

import { useMemo, useState } from 'react'
import { useIssues } from '../hooks/useIssues'
import { STAGES } from '@/lib/framework'
import { supabaseConfigured } from '@/lib/supabase'
import { AlertTriangle, ArrowRight, Activity, Clock } from 'lucide-react'
import IssueDrawer from './IssueDrawer'
import StageBadge, { SeverityBadge } from './StageBadge'
import AgingClock from './AgingClock'
import type { PageKey } from '../page'

export default function Dashboard({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  const { issues, loading } = useIssues()
  const [drawer, setDrawer] = useState<string | null>(null)

  const stageCounts = useMemo(() => {
    const map: Record<string, number> = {}
    STAGES.forEach(s => (map[s.key] = 0))
    map['closed'] = 0
    map['reopened'] = 0
    issues.forEach(i => { map[i.current_stage] = (map[i.current_stage] || 0) + 1 })
    return map
  }, [issues])

  const sevCounts = useMemo(() => {
    const map = { P0: 0, P1: 0, P2: 0, none: 0 }
    issues.forEach(i => {
      if (i.current_stage === 'closed') return
      if (i.severity === 'P0') map.P0++
      else if (i.severity === 'P1') map.P1++
      else if (i.severity === 'P2') map.P2++
      else map.none++
    })
    return map
  }, [issues])

  const recent = useMemo(() => [...issues].slice(0, 6), [issues])
  const openCount = issues.filter(i => i.current_stage !== 'closed').length

  return (
    <main className="min-h-screen">
      {!supabaseConfigured && (
        <div className="px-10 pt-6">
          <div className="border-l-4 px-4 py-3 text-sm font-mono" style={{ borderColor: 'var(--warm)', background: 'var(--warm-soft)', color: 'var(--warm)' }}>
            DEMO MODE · Supabase env vars not set. Data lives in memory only. See README to wire up.
          </div>
        </div>
      )}

      <header className="px-10 pt-10 pb-6 border-b" style={{ borderColor: 'var(--rule)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="eyebrow">Netbox · {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          <div className="eyebrow" style={{ color: 'var(--warm)' }}>Netbox Loop · v1</div>
        </div>
        <h1 className="font-serif text-5xl leading-[0.95] tracking-tight" style={{ color: 'var(--ink)' }}>
          Every signal becomes a loop.<br />
          <em className="italic font-light" style={{ color: 'var(--accent)' }}>Every loop has to close.</em>
        </h1>
        <p className="font-serif italic text-lg mt-5 max-w-2xl" style={{ color: 'var(--ink-2)' }}>
          {openCount} open · {stageCounts['closed'] || 0} verified closed · {sevCounts.P0} P0 in flight
        </p>
      </header>

      <section className="px-10 py-8 border-b" style={{ borderColor: 'var(--rule)' }}>
        <div className="flex items-baseline gap-5 mb-5">
          <span className="font-serif text-5xl font-light" style={{ color: 'var(--ink-faint)' }}>01</span>
          <h2 className="font-serif text-3xl tracking-tight">Where issues stand.</h2>
        </div>

        <div className="grid grid-cols-7 gap-0 border-t border-l" style={{ borderColor: 'var(--rule)' }}>
          {STAGES.map(s => {
            const n = stageCounts[s.key] || 0
            return (
              <button
                key={s.key}
                onClick={() => onNavigate('board')}
                className="text-left p-4 border-r border-b hover:bg-[color:var(--paper-2)] transition"
                style={{ borderColor: 'var(--rule)' }}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--ink-mute)' }}>{s.num}</span>
                  <span className="font-serif text-3xl font-light leading-none" style={{ color: n > 0 ? 'var(--ink)' : 'var(--ink-faint)' }}>{n}</span>
                </div>
                <div className="font-serif text-base leading-tight">{s.name}</div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--ink-mute)' }}>{s.clockP1}</div>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-3 mt-6 gap-3">
          <StatCard label="P0 · Critical" value={sevCounts.P0} accent="var(--warm)" />
          <StatCard label="P1 · Default" value={sevCounts.P1} accent="var(--accent)" />
          <StatCard label="P2 · Standard" value={sevCounts.P2} accent="var(--ink-mute)" />
        </div>
      </section>

      <section className="px-10 py-8 border-b" style={{ borderColor: 'var(--rule)' }}>
        <div className="flex items-baseline gap-5 mb-5">
          <span className="font-serif text-5xl font-light" style={{ color: 'var(--ink-faint)' }}>02</span>
          <h2 className="font-serif text-3xl tracking-tight">Recent activity.</h2>
          <button onClick={() => onNavigate('list')} className="ml-auto text-sm font-mono uppercase tracking-wider flex items-center gap-1 hover:underline" style={{ color: 'var(--accent)' }}>
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading && <p className="text-sm" style={{ color: 'var(--ink-mute)' }}>Loading…</p>}
        {!loading && recent.length === 0 && (
          <div className="border border-dashed p-10 text-center" style={{ borderColor: 'var(--rule)' }}>
            <Activity className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--ink-faint)' }} />
            <p className="font-serif italic" style={{ color: 'var(--ink-mute)' }}>No issues yet. Use “New Issue” in the sidebar to create one.</p>
          </div>
        )}

        <div className="divide-y" style={{ borderColor: 'var(--rule)' }}>
          {recent.map(i => (
            <button
              key={i.id}
              onClick={() => setDrawer(i.id)}
              className="w-full text-left py-4 grid grid-cols-[120px_80px_1fr_auto_auto] gap-4 items-center hover:bg-[color:var(--paper-2)] transition px-3 -mx-3 rounded"
            >
              <span className="font-mono text-xs" style={{ color: 'var(--ink-mute)' }}>{i.issue_code}</span>
              <SeverityBadge severity={i.severity} />
              <div>
                <div className="font-medium text-[15px] leading-tight">{i.title}</div>
                {i.scope_detail && <div className="text-[12px] mt-0.5" style={{ color: 'var(--ink-mute)' }}>{i.scope_detail}</div>}
              </div>
              <StageBadge stage={i.current_stage} />
              <AgingClock issue={i} compact />
            </button>
          ))}
        </div>
      </section>

      <section className="px-10 py-8">
        <div className="flex items-baseline gap-5 mb-5">
          <span className="font-serif text-5xl font-light" style={{ color: 'var(--ink-faint)' }}>03</span>
          <h2 className="font-serif text-3xl tracking-tight">The loop in one line.</h2>
        </div>
        <p className="font-serif italic text-base max-w-2xl mb-5" style={{ color: 'var(--ink-2)' }}>
          Seven stages. One canonical ID per issue, end to end. Every stage has an owner, a defined output, and a clock. The loop only closes when verification re-runs the original signal.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {STAGES.map((s, idx) => (
            <div key={s.key} className="flex items-center">
              <div className="px-3 py-2 border" style={{ borderColor: 'var(--rule)', background: 'var(--paper-2)' }}>
                <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--ink-mute)' }}>{s.num}</div>
                <div className="font-serif text-sm">{s.name}</div>
              </div>
              {idx < STAGES.length - 1 && <ArrowRight className="w-3 h-3 mx-1" style={{ color: 'var(--ink-faint)' }} />}
            </div>
          ))}
        </div>
        <button
          onClick={() => onNavigate('framework')}
          className="mt-5 font-mono text-[11px] uppercase tracking-wider underline"
          style={{ color: 'var(--accent)' }}
        >
          Read the full framework →
        </button>
      </section>

      {drawer && <IssueDrawer issueId={drawer} onClose={() => setDrawer(null)} />}
    </main>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="border p-4 flex items-center justify-between" style={{ borderColor: 'var(--rule)', background: 'var(--paper)' }}>
      <div className="eyebrow" style={{ color: accent }}>{label}</div>
      <div className="font-serif text-3xl font-light" style={{ color: 'var(--ink)' }}>{value}</div>
    </div>
  )
}
