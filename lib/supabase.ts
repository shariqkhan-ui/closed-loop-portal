import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as ReturnType<typeof createClient>)

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export type LoopStage =
  | 'sense' | 'triage' | 'diagnose' | 'design' | 'pilot' | 'rollout' | 'verify' | 'closed' | 'reopened'

export type LoopSeverity = 'P0' | 'P1' | 'P2'
export type LoopCategory = 'hardware' | 'firmware' | 'process' | 'partner' | 'customer' | 'ambiguous'
export type LoopScope = 'single_csp' | 'csp_cohort' | 'city_wide' | 'network_wide'
export type PilotResult = 'pending' | 'pass' | 'pass_with_revision' | 'fail'
export type VerifyStatus = 'pending' | 'closed_fixed' | 'closed_not_fixed' | 'held_open'

export interface Issue {
  id: string
  issue_code: string
  title: string
  description?: string | null

  signal_source?: string | null
  signal_evidence?: string | null
  sensed_at?: string | null

  severity?: LoopSeverity | null
  category?: LoopCategory | null
  scope?: LoopScope | null
  scope_detail?: string | null
  owner_name?: string | null
  owner_team?: string | null

  root_cause_hypothesis?: string | null
  evidence_attached?: string | null

  fix_plan?: string | null
  success_criteria?: string | null
  detector?: string | null
  observation_window_days?: number | null

  pilot_cohort?: string | null
  pilot_started_at?: string | null
  pilot_result?: PilotResult | null
  pilot_notes?: string | null
  control_cohort?: string | null

  rollout_wave?: number | null
  rollout_notes?: string | null

  verify_status?: VerifyStatus | null
  verify_started_at?: string | null
  verify_closed_at?: string | null
  verify_notes?: string | null

  current_stage: LoopStage
  stage_entered_at: string
  created_at: string
  updated_at: string
}

export interface StageHistoryRow {
  id: string
  issue_id: string
  from_stage: LoopStage | null
  to_stage: LoopStage
  signed_off_by?: string | null
  rationale?: string | null
  occurred_at: string
}
