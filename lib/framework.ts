import type { LoopStage, LoopSeverity } from './supabase'

export interface StageDef {
  key: LoopStage
  num: string
  name: string
  owner: string
  output: string
  signOff: string
  clockP1: string
  blurb: string
  /** Hours of SLA for the P1 cadence — used to compute aging. 0 means criteria-driven. */
  slaHoursP1: number
}

export const STAGES: StageDef[] = [
  {
    key: 'sense',
    num: '01',
    name: 'Sense',
    owner: 'Source teams',
    output: 'Raw signal → Issue-ID',
    signOff: 'Auto on intake',
    clockP1: '24h',
    slaHoursP1: 24,
    blurb:
      'Every signal source feeds one inbox. Device offline alerts, customer ticket clusters, field RCA observations, CSP partner reports, internal audits, TFF lab failure trends, NPS verbatims. Provenance preserved — trace any open issue back to the exact signal and timestamp.',
  },
  {
    key: 'triage',
    num: '02',
    name: 'Triage',
    owner: 'Ops triage desk',
    output: 'Classified, scoped, assigned',
    signOff: 'Triage team',
    clockP1: '24h',
    slaHoursP1: 24,
    blurb:
      'Every candidate gets four tags: severity (P0/P1/P2), category, scope, owner. Triage is also a gate — if the signal cannot be reproduced or scope cannot be defined, it goes back to Sense for sharpening.',
  },
  {
    key: 'diagnose',
    num: '03',
    name: 'Diagnose',
    owner: 'Category team (varies)',
    output: 'Root cause hypothesis + evidence',
    signOff: 'Category team',
    clockP1: '2 days',
    slaHoursP1: 48,
    blurb:
      'Root-cause analysis with evidence attached. Hardware: field RCA, TFF teardown, device logs. Process: workflow trace, audits. Partner: site visits, performance data. Ends with a written hypothesis backed by observation.',
  },
  {
    key: 'design',
    num: '04',
    name: 'Design fix',
    owner: 'Category team + Ops team',
    output: 'Fix plan + success criteria',
    signOff: 'Ops + Category teams',
    clockP1: '24h',
    slaHoursP1: 24,
    blurb:
      'Two artifacts: the fix plan and the success criteria (signal, threshold, observation window). The second is non-negotiable — a fix proposal without success criteria cannot move to Pilot.',
  },
  {
    key: 'pilot',
    num: '05',
    name: 'Pilot',
    owner: 'Field / Ops execution',
    output: 'Pilot result vs success criteria',
    signOff: 'Ops + Category teams',
    clockP1: '4–11 days',
    slaHoursP1: 11 * 24,
    blurb:
      'Fix runs on a defined small cohort — typically 5–10% of scope, or a single city/partner. Time-boxed with explicit pass/fail against success criteria. A control cohort runs in parallel where possible.',
  },
  {
    key: 'rollout',
    num: '06',
    name: 'Rollout',
    owner: 'Field / Ops + comms',
    output: 'Fix applied to full scope',
    signOff: 'Ops team per wave',
    clockP1: 'Scope-dependent',
    slaHoursP1: 0,
    blurb:
      'Phased deployment in four cumulative waves (10% → 25% → 50% → 100%), each with a hold period and a sign-off gate. The original detector re-runs on the just-deployed cohort before the next wave.',
  },
  {
    key: 'verify',
    num: '07',
    name: 'Verify',
    owner: 'Verification team (independent)',
    output: 'Closed-fixed / closed-not-fixed / held-open',
    signOff: 'Verification team',
    clockP1: 'Criteria-driven',
    slaHoursP1: 0,
    blurb:
      'The detector that surfaced the original signal runs again on the post-fix state for the observation window. If it stays quiet, the issue closes. If it returns, the issue reopens automatically. The team that fixed it does not mark it fixed.',
  },
]

export const STAGE_BY_KEY: Record<LoopStage, StageDef | undefined> = Object.fromEntries(
  STAGES.map(s => [s.key, s])
) as Record<LoopStage, StageDef | undefined>

export function nextStage(stage: LoopStage): LoopStage | null {
  const idx = STAGES.findIndex(s => s.key === stage)
  if (idx === -1) return null
  if (idx === STAGES.length - 1) return 'closed'
  return STAGES[idx + 1].key
}

export function prevStage(stage: LoopStage): LoopStage | null {
  const idx = STAGES.findIndex(s => s.key === stage)
  if (idx <= 0) return null
  return STAGES[idx - 1].key
}

/** P0 = 4–6× tighter than P1. P2 = ~2× slower. */
export function slaHoursFor(stage: LoopStage, severity?: LoopSeverity | null): number {
  const def = STAGE_BY_KEY[stage]
  if (!def || !def.slaHoursP1) return 0
  if (severity === 'P0') return Math.max(1, Math.round(def.slaHoursP1 / 5))
  if (severity === 'P2') return Math.round(def.slaHoursP1 * 2)
  return def.slaHoursP1
}

export function ageTier(hoursElapsed: number, slaHours: number):
  | 'tier0' | 'tier1' | 'tier2' | 'tier3' | 'tier4' {
  if (slaHours <= 0) return 'tier0'
  const ratio = hoursElapsed / slaHours
  if (ratio <= 1) return 'tier0'
  if (ratio <= 1.5) return 'tier1'
  if (ratio <= 2) return 'tier2'
  if (ratio <= 3) return 'tier3'
  return 'tier4'
}

export const TIER_LABEL: Record<string, { label: string; cls: string }> = {
  tier0: { label: 'Within SLA', cls: 'bg-good-soft text-good border-good/30' },
  tier1: { label: 'Amber', cls: 'bg-warm-soft text-warm border-warm/30' },
  tier2: { label: 'Red', cls: 'bg-warm-soft text-warm border-warm/40' },
  tier3: { label: 'Critical', cls: 'bg-warm-soft text-warm border-warm/60' },
  tier4: { label: 'Stuck', cls: 'bg-warm text-paper border-warm' },
}

export const STAGE_COLOR: Record<LoopStage, string> = {
  sense: '#6F6B62',
  triage: '#1B3A66',
  diagnose: '#1B3A66',
  design: '#A8462A',
  pilot: '#A8462A',
  rollout: '#1B3A66',
  verify: '#3A6645',
  closed: '#3A6645',
  reopened: '#A8462A',
}

export const SEVERITY_COLOR: Record<LoopSeverity, string> = {
  P0: '#A8462A',
  P1: '#1B3A66',
  P2: '#6F6B62',
}
