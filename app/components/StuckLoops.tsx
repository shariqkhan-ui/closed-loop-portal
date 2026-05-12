'use client'

import { useMemo, useState } from 'react'
import { useIssues } from '../hooks/useIssues'
import StageBadge, { SeverityBadge } from './StageBadge'
import AgingClock from './AgingClock'
import IssueDrawer from './IssueDrawer'
import { ageTier, slaHoursFor, TIER_LABEL } from '@/lib/framework'

const TIER_ORDER: Record<string, number> = { tier4: 4, tier3: 3, tier2: 2, tier1: 1, tier0: 0 }

export default function StuckLoops() {
  const { issues, loading } = useIssues()
  const [drawer, setDrawer] = useState<string | null>(null)

  const stuck = useMemo(() => {
    return issues
      .filter(i => i.current_stage !== 'closed')
      .map(i => {
        const sla = slaHoursFor(i.current_stage, i.severity)
        const elapsed = (Date.now() - new Date(i.stage_entered_at).getTime()) / 3600 / 1000
        const tier = ageTier(elapsed, sla)
        return { issue: i, tier, elapsed, sla }
      })
      .filter(r => TIER_ORDER[r.tier] >= 1)
      .sort((a, b) => TIER_ORDER[b.tier] - TIER_ORDER[a.tier])
  }, [issues])

  return (
    <main className="min-h-screen">
      <header className="px-10 pt-10 pb-5 border-b" style={{ borderColor: 'var(--rule)' }}>
        <div className="eyebrow mb-2">Section 06 · Stuck-loops report</div>
        <h1 className="font-serif text-4xl tracking-tight">Loops past 1× SLA.</h1>
        <p className="font-serif italic mt-2 max-w-2xl" style={{ color: 'var(--ink-2)' }}>
          Not for blame — for unblocking. The goal is to find issues that have lost momentum and put them back in motion before they age into Tier 3 or Tier 4.
        </p>
      </header>

      <div className="px-10 py-6">
        {loading && <p className="text-sm" style={{ color: 'var(--ink-mute)' }}>Loading…</p>}
        {!loading && stuck.length === 0 && (
          <div className="border border-dashed p-10 text-center" style={{ borderColor: 'var(--rule)' }}>
            <p className="font-serif italic text-lg" style={{ color: 'var(--good)' }}>All open loops are within SLA. Quiet is good.</p>
          </div>
        )}

        <div className="divide-y" style={{ borderColor: 'var(--rule)' }}>
          {stuck.map(({ issue, tier }) => {
            const tierMeta = TIER_LABEL[tier]
            return (
              <button
                key={issue.id}
                onClick={() => setDrawer(issue.id)}
                className="w-full text-left py-4 grid grid-cols-[110px_60px_1fr_160px_140px_120px] gap-4 items-center hover:bg-[color:var(--paper-2)] transition px-2 -mx-2 rounded"
              >
                <span className="font-mono text-xs" style={{ color: 'var(--ink-mute)' }}>{issue.issue_code}</span>
                <SeverityBadge severity={issue.severity} />
                <div className="min-w-0">
                  <div className="text-[14px] font-medium truncate">{issue.title}</div>
                  <div className="text-[11px] truncate" style={{ color: 'var(--ink-mute)' }}>
                    {issue.owner_name || '—'}{issue.owner_team ? ` · ${issue.owner_team}` : ''}
                  </div>
                </div>
                <StageBadge stage={issue.current_stage} />
                <AgingClock issue={issue} compact />
                <span className={`inline-flex items-center justify-center font-mono text-[10px] px-2 py-0.5 border ${tierMeta.cls}`}>
                  {tier.toUpperCase()} · {tierMeta.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {drawer && <IssueDrawer issueId={drawer} onClose={() => setDrawer(null)} />}
    </main>
  )
}
