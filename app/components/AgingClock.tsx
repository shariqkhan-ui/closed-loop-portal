'use client'

import { ageTier, slaHoursFor, TIER_LABEL } from '@/lib/framework'
import type { Issue } from '@/lib/supabase'

function hoursSince(iso?: string | null): number {
  if (!iso) return 0
  const ms = Date.now() - new Date(iso).getTime()
  return Math.max(0, ms / 3600 / 1000)
}

function fmtHours(h: number): string {
  if (h < 1) return Math.round(h * 60) + 'm'
  if (h < 48) return Math.round(h) + 'h'
  return Math.round(h / 24) + 'd'
}

export default function AgingClock({ issue, compact = false }: { issue: Issue; compact?: boolean }) {
  const sla = slaHoursFor(issue.current_stage, issue.severity)
  const elapsed = hoursSince(issue.stage_entered_at)
  const tier = ageTier(elapsed, sla)
  const tierMeta = TIER_LABEL[tier]
  if (sla === 0) {
    return (
      <span className="font-mono text-[11px]" style={{ color: 'var(--ink-mute)' }}>
        {compact ? fmtHours(elapsed) : `${fmtHours(elapsed)} in stage · criteria-driven`}
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 border ${tierMeta.cls}`}
      title={`${fmtHours(elapsed)} elapsed of ${fmtHours(sla)} SLA`}
    >
      <span>{fmtHours(elapsed)} / {fmtHours(sla)}</span>
      {!compact && <span className="opacity-70">· {tierMeta.label}</span>}
    </span>
  )
}
