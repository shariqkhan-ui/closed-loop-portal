'use client'

import { STAGE_BY_KEY, STAGE_COLOR } from '@/lib/framework'
import type { LoopStage } from '@/lib/supabase'

export default function StageBadge({ stage, size = 'sm' }: { stage: LoopStage; size?: 'sm' | 'md' }) {
  const def = STAGE_BY_KEY[stage]
  const color = STAGE_COLOR[stage] || '#6F6B62'
  const label = def?.name || (stage === 'closed' ? 'Closed' : stage === 'reopened' ? 'Reopened' : stage)
  const num = def?.num || (stage === 'closed' ? '✓' : '↺')
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider border ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1'}`}
      style={{ color, borderColor: color + '55', background: color + '0F' }}
    >
      <span className="font-medium">{num}</span>
      <span>{label}</span>
    </span>
  )
}

export function SeverityBadge({ severity }: { severity?: string | null }) {
  if (!severity) return <span className="text-[11px] font-mono text-[color:var(--ink-faint)]">—</span>
  const color = severity === 'P0' ? '#A8462A' : severity === 'P1' ? '#1B3A66' : '#6F6B62'
  return (
    <span
      className="inline-flex items-center font-mono text-[10px] px-1.5 py-0.5 border font-medium"
      style={{ color, borderColor: color + '55', background: color + '12' }}
    >
      {severity}
    </span>
  )
}
