'use client'

import { useEffect, useState } from 'react'
import { X, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Lock } from 'lucide-react'
import { supabase, supabaseConfigured, type Issue, type LoopStage } from '@/lib/supabase'
import { STAGES, STAGE_BY_KEY, nextStage, prevStage } from '@/lib/framework'
import StageBadge, { SeverityBadge } from './StageBadge'
import AgingClock from './AgingClock'
import { useIssues, updateIssue } from '../hooks/useIssues'

interface Props { issueId: string; onClose: () => void }

export default function IssueDrawer({ issueId, onClose }: Props) {
  const { issues, refresh } = useIssues()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [edit, setEdit] = useState<Partial<Issue>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const found = issues.find(i => i.id === issueId) || null
    setIssue(found)
  }, [issues, issueId])

  if (!issue) return null

  const stageDef = STAGE_BY_KEY[issue.current_stage]
  const currentStageIdx = STAGES.findIndex(s => s.key === issue.current_stage)
  const next = nextStage(issue.current_stage)
  const prev = prevStage(issue.current_stage)

  const gateBlocker = checkGate(issue, { ...edit })

  async function save(patch: Partial<Issue>) {
    setSaving(true)
    setError(null)
    const updated = await updateIssue(issue!.id, patch)
    if (!updated) setError('Save failed — check connection.')
    setEdit({})
    await refresh()
    setSaving(false)
  }

  async function advance() {
    if (!next) return
    if (gateBlocker) { setError(gateBlocker); return }
    const patch: Partial<Issue> = { current_stage: next as LoopStage }
    if (next === 'verify') patch.verify_started_at = new Date().toISOString()
    if (next === 'closed') {
      patch.verify_status = 'closed_fixed'
      patch.verify_closed_at = new Date().toISOString()
    }
    if (issue!.current_stage === 'sense' && !issue!.sensed_at) patch.sensed_at = new Date().toISOString()
    if (issue!.current_stage === 'design' && next === 'pilot') patch.pilot_started_at = new Date().toISOString()
    await save({ ...edit, ...patch })
  }

  async function rollback() {
    if (!prev) return
    await save({ current_stage: prev as LoopStage })
  }

  async function reopen() {
    await save({ current_stage: 'sense', verify_status: 'pending', verify_closed_at: null })
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1" style={{ background: 'rgba(20, 17, 13, 0.35)' }} />
      <aside
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[820px] h-full overflow-y-auto shadow-2xl animate-slide-in"
        style={{ background: 'var(--paper)' }}
      >
        <div className="sticky top-0 z-10 px-8 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--rule)', background: 'var(--paper)' }}>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs" style={{ color: 'var(--ink-mute)' }}>{issue.issue_code}</span>
            <SeverityBadge severity={issue.severity} />
            <StageBadge stage={issue.current_stage} />
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[color:var(--paper-2)] rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-6">
          <h2 className="font-serif text-3xl leading-tight mb-2">{issue.title}</h2>
          {issue.description && <p className="text-[14px]" style={{ color: 'var(--ink-2)' }}>{issue.description}</p>}
          <div className="mt-3"><AgingClock issue={issue} /></div>
        </div>

        <div className="px-8 pb-6">
          <StagePath currentStage={issue.current_stage} currentIdx={currentStageIdx} />
        </div>

        {error && (
          <div className="mx-8 mb-4 border-l-4 px-4 py-2 text-sm" style={{ borderColor: 'var(--warm)', background: 'var(--warm-soft)', color: 'var(--warm)' }}>
            {error}
          </div>
        )}

        <div className="px-8 pb-10 space-y-6">
          {STAGES.map((s, idx) => {
            const filled = idx <= currentStageIdx
            const isCurrent = idx === currentStageIdx
            return (
              <details key={s.key} open={isCurrent} className="border" style={{ borderColor: 'var(--rule)' }}>
                <summary className="cursor-pointer px-4 py-3 flex items-center justify-between" style={{ background: filled ? 'var(--paper-2)' : 'var(--paper)' }}>
                  <div className="flex items-center gap-3">
                    {filled
                      ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--good)' }} />
                      : <Lock className="w-4 h-4" style={{ color: 'var(--ink-faint)' }} />}
                    <span className="font-mono text-[10px]" style={{ color: 'var(--ink-mute)' }}>{s.num}</span>
                    <span className="font-serif text-lg">{s.name}</span>
                  </div>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--ink-mute)' }}>{s.signOff}</span>
                </summary>
                <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--rule)' }}>
                  <StageFields stage={s.key} issue={issue} edit={edit} setEdit={setEdit} disabled={!filled} />
                </div>
              </details>
            )
          })}
        </div>

        {issue.current_stage !== 'closed' && (
          <div className="sticky bottom-0 px-8 py-4 border-t flex items-center justify-between gap-3" style={{ borderColor: 'var(--rule)', background: 'var(--paper)' }}>
            <button
              onClick={rollback}
              disabled={!prev || saving}
              className="px-4 py-2 border text-sm font-medium flex items-center gap-2 disabled:opacity-40"
              style={{ borderColor: 'var(--rule)', color: 'var(--ink-2)' }}
            >
              <ArrowLeft className="w-4 h-4" /> Rollback
            </button>

            <div className="flex items-center gap-2">
              {Object.keys(edit).length > 0 && (
                <button
                  onClick={() => save(edit)}
                  disabled={saving}
                  className="px-4 py-2 border text-sm font-medium"
                  style={{ borderColor: 'var(--rule)', background: 'var(--paper-2)' }}
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              )}
              {gateBlocker && (
                <span className="text-[12px] font-mono flex items-center gap-1.5" style={{ color: 'var(--warm)' }}>
                  <AlertCircle className="w-3.5 h-3.5" /> {gateBlocker}
                </span>
              )}
              <button
                onClick={advance}
                disabled={saving || !!gateBlocker}
                className="px-5 py-2 text-sm font-medium flex items-center gap-2 disabled:opacity-40"
                style={{ background: 'var(--accent)', color: 'var(--paper)' }}
              >
                {next === 'closed' ? 'Mark verified-closed' : `Advance to ${STAGE_BY_KEY[next as LoopStage]?.name || next}`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {issue.current_stage === 'closed' && (
          <div className="sticky bottom-0 px-8 py-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--rule)', background: 'var(--good-soft)' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--good)' }}>
              <CheckCircle2 className="w-4 h-4" /> Loop verified-closed. The detector keeps watching.
            </div>
            <button onClick={reopen} className="px-4 py-2 border text-sm" style={{ borderColor: 'var(--warm)', color: 'var(--warm)' }}>
              Reopen
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

function StagePath({ currentStage, currentIdx }: { currentStage: LoopStage; currentIdx: number }) {
  if (currentStage === 'closed') {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--good)' }}>
        <CheckCircle2 className="w-4 h-4" /> Verified-closed · all seven stages cleared.
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STAGES.map((s, idx) => {
        const done = idx < currentIdx
        const here = idx === currentIdx
        return (
          <div key={s.key} className="flex items-center">
            <div
              className={`px-2.5 py-1 border text-[11px] font-mono ${here ? 'font-medium' : ''}`}
              style={{
                borderColor: here ? 'var(--accent)' : 'var(--rule)',
                background: done ? 'var(--good-soft)' : here ? 'var(--accent-soft)' : 'var(--paper)',
                color: done ? 'var(--good)' : here ? 'var(--accent)' : 'var(--ink-mute)',
              }}
            >
              {s.num} · {s.name}
            </div>
            {idx < STAGES.length - 1 && <span className="mx-1 text-[10px]" style={{ color: 'var(--ink-faint)' }}>→</span>}
          </div>
        )
      })}
    </div>
  )
}

/* ───── Per-stage form fields ───── */

function StageFields({ stage, issue, edit, setEdit, disabled }: {
  stage: LoopStage
  issue: Issue
  edit: Partial<Issue>
  setEdit: (e: Partial<Issue>) => void
  disabled: boolean
}) {
  const v = (key: keyof Issue) => (edit[key] !== undefined ? edit[key] : (issue as Issue)[key]) as string | number | null | undefined
  const set = (key: keyof Issue, val: string | number | null) => setEdit({ ...edit, [key]: val } as Partial<Issue>)

  if (stage === 'sense') return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Signal source" hint="device_offline_detector, ticket_cluster, audit, NPS…">
        <input className={inputCls(disabled)} disabled={disabled}
          value={(v('signal_source') as string) || ''} onChange={e => set('signal_source', e.target.value)} />
      </Field>
      <Field label="Sensed at">
        <span className="text-[13px] font-mono" style={{ color: 'var(--ink-2)' }}>
          {issue.sensed_at ? new Date(issue.sensed_at).toLocaleString() : '—'}
        </span>
      </Field>
      <FieldWide label="Evidence (links, IDs, screenshots)">
        <textarea rows={3} className={inputCls(disabled)} disabled={disabled}
          value={(v('signal_evidence') as string) || ''} onChange={e => set('signal_evidence', e.target.value)} />
      </FieldWide>
    </div>
  )

  if (stage === 'triage') return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Severity" hint="P0 critical · P1 default · P2 standard">
        <select className={inputCls(disabled)} disabled={disabled}
          value={(v('severity') as string) || ''} onChange={e => set('severity', e.target.value || null)}>
          <option value="">—</option>
          <option value="P0">P0 · Critical</option>
          <option value="P1">P1 · Default</option>
          <option value="P2">P2 · Standard</option>
        </select>
      </Field>
      <Field label="Category">
        <select className={inputCls(disabled)} disabled={disabled}
          value={(v('category') as string) || ''} onChange={e => set('category', e.target.value || null)}>
          <option value="">—</option>
          <option value="hardware">Hardware</option>
          <option value="firmware">Firmware</option>
          <option value="process">Process</option>
          <option value="partner">Partner</option>
          <option value="customer">Customer</option>
          <option value="ambiguous">Ambiguous</option>
        </select>
      </Field>
      <Field label="Scope">
        <select className={inputCls(disabled)} disabled={disabled}
          value={(v('scope') as string) || ''} onChange={e => set('scope', e.target.value || null)}>
          <option value="">—</option>
          <option value="single_csp">Single CSP</option>
          <option value="csp_cohort">CSP cohort</option>
          <option value="city_wide">City-wide</option>
          <option value="network_wide">Network-wide</option>
        </select>
      </Field>
      <Field label="Scope detail">
        <input className={inputCls(disabled)} disabled={disabled}
          value={(v('scope_detail') as string) || ''} onChange={e => set('scope_detail', e.target.value)}
          placeholder="e.g. 14 CSPs across UP West" />
      </Field>
      <Field label="Named owner">
        <input className={inputCls(disabled)} disabled={disabled}
          value={(v('owner_name') as string) || ''} onChange={e => set('owner_name', e.target.value)} />
      </Field>
      <Field label="Owner team">
        <input className={inputCls(disabled)} disabled={disabled}
          value={(v('owner_team') as string) || ''} onChange={e => set('owner_team', e.target.value)} />
      </Field>
    </div>
  )

  if (stage === 'diagnose') return (
    <div className="grid grid-cols-1 gap-4">
      <FieldWide label="Root cause hypothesis" hint="A written hypothesis backed by observation — not a guess.">
        <textarea rows={3} className={inputCls(disabled)} disabled={disabled}
          value={(v('root_cause_hypothesis') as string) || ''} onChange={e => set('root_cause_hypothesis', e.target.value)} />
      </FieldWide>
      <FieldWide label="Evidence attached" hint="Field RCA, lab teardown, workflow trace, site visit notes, log links">
        <textarea rows={3} className={inputCls(disabled)} disabled={disabled}
          value={(v('evidence_attached') as string) || ''} onChange={e => set('evidence_attached', e.target.value)} />
      </FieldWide>
    </div>
  )

  if (stage === 'design') return (
    <div className="grid grid-cols-2 gap-4">
      <FieldWide label="Fix plan" hint="What changes, who does it, what gets touched">
        <textarea rows={3} className={inputCls(disabled)} disabled={disabled}
          value={(v('fix_plan') as string) || ''} onChange={e => set('fix_plan', e.target.value)} />
      </FieldWide>
      <FieldWide label="Success criteria · non-negotiable" hint="Which signal, measured how, over what window">
        <textarea rows={3} className={inputCls(disabled)} disabled={disabled}
          value={(v('success_criteria') as string) || ''} onChange={e => set('success_criteria', e.target.value)} />
      </FieldWide>
      <Field label="Detector">
        <input className={inputCls(disabled)} disabled={disabled}
          value={(v('detector') as string) || ''} onChange={e => set('detector', e.target.value)} />
      </Field>
      <Field label="Observation window (days)">
        <input type="number" min="0" className={inputCls(disabled)} disabled={disabled}
          value={(v('observation_window_days') as number) ?? ''} onChange={e => set('observation_window_days', e.target.value ? Number(e.target.value) : null)} />
      </Field>
    </div>
  )

  if (stage === 'pilot') return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Pilot cohort" hint="~5–10% of scope, or one city/partner">
        <input className={inputCls(disabled)} disabled={disabled}
          value={(v('pilot_cohort') as string) || ''} onChange={e => set('pilot_cohort', e.target.value)} />
      </Field>
      <Field label="Control cohort (where possible)">
        <input className={inputCls(disabled)} disabled={disabled}
          value={(v('control_cohort') as string) || ''} onChange={e => set('control_cohort', e.target.value)} />
      </Field>
      <Field label="Pilot result">
        <select className={inputCls(disabled)} disabled={disabled}
          value={(v('pilot_result') as string) || 'pending'} onChange={e => set('pilot_result', e.target.value)}>
          <option value="pending">Pending</option>
          <option value="pass">Pass</option>
          <option value="pass_with_revision">Pass with revision</option>
          <option value="fail">Fail · back to Diagnose</option>
        </select>
      </Field>
      <FieldWide label="Pilot notes">
        <textarea rows={3} className={inputCls(disabled)} disabled={disabled}
          value={(v('pilot_notes') as string) || ''} onChange={e => set('pilot_notes', e.target.value)} />
      </FieldWide>
    </div>
  )

  if (stage === 'rollout') return (
    <div className="grid grid-cols-1 gap-4">
      <Field label="Wave · cumulative coverage" hint="Pilot ~5% → W1 10% → W2 25% → W3 50% → W4 100%">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(w => (
            <button
              key={w}
              type="button"
              disabled={disabled}
              onClick={() => set('rollout_wave', w)}
              className="flex-1 border py-2 text-sm font-mono"
              style={{
                borderColor: (v('rollout_wave') as number) === w ? 'var(--accent)' : 'var(--rule)',
                background: (v('rollout_wave') as number) === w ? 'var(--accent-soft)' : 'var(--paper)',
                color: (v('rollout_wave') as number) === w ? 'var(--accent)' : 'var(--ink-mute)',
              }}
            >
              W{w} · {[10, 25, 50, 100][w - 1]}%
            </button>
          ))}
        </div>
      </Field>
      <FieldWide label="Rollout notes · sign-off log per wave">
        <textarea rows={4} className={inputCls(disabled)} disabled={disabled}
          value={(v('rollout_notes') as string) || ''} onChange={e => set('rollout_notes', e.target.value)} />
      </FieldWide>
    </div>
  )

  if (stage === 'verify') return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Verify status">
        <select className={inputCls(disabled)} disabled={disabled}
          value={(v('verify_status') as string) || 'pending'} onChange={e => set('verify_status', e.target.value)}>
          <option value="pending">Pending · watching</option>
          <option value="closed_fixed">Closed · fixed</option>
          <option value="closed_not_fixed">Closed · not fixed</option>
          <option value="held_open">Held open</option>
        </select>
      </Field>
      <Field label="Verify started at">
        <span className="text-[13px] font-mono" style={{ color: 'var(--ink-2)' }}>
          {issue.verify_started_at ? new Date(issue.verify_started_at).toLocaleString() : '—'}
        </span>
      </Field>
      <FieldWide label="Verification notes · detector readout">
        <textarea rows={4} className={inputCls(disabled)} disabled={disabled}
          value={(v('verify_notes') as string) || ''} onChange={e => set('verify_notes', e.target.value)} />
      </FieldWide>
    </div>
  )

  return null
}

function inputCls(disabled: boolean) {
  return `w-full px-2.5 py-1.5 border text-[13px] focus:outline-none focus:border-[color:var(--accent)] ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--ink-mute)' }}>{label}</span>
      {children}
      {hint && <span className="block text-[11px] mt-1 italic" style={{ color: 'var(--ink-faint)' }}>{hint}</span>}
    </label>
  )
}
function FieldWide(props: { label: string; hint?: string; children: React.ReactNode }) {
  return <div className="col-span-2"><Field {...props} /></div>
}

/* ───── Gate checks — what must be filled before advancing ───── */

function checkGate(issue: Issue, edit: Partial<Issue>): string | null {
  const merged = { ...issue, ...edit }
  switch (issue.current_stage) {
    case 'sense':
      if (!merged.signal_source) return 'Set signal source before Triage'
      break
    case 'triage':
      if (!merged.severity) return 'Set severity'
      if (!merged.category) return 'Set category'
      if (!merged.scope) return 'Set scope'
      if (!merged.owner_name) return 'Name an owner'
      break
    case 'diagnose':
      if (!merged.root_cause_hypothesis) return 'Write a root-cause hypothesis'
      break
    case 'design':
      if (!merged.fix_plan) return 'Fix plan required'
      if (!merged.success_criteria) return 'Success criteria are non-negotiable'
      if (!merged.detector) return 'Name the detector that will verify'
      break
    case 'pilot':
      if (!merged.pilot_result || merged.pilot_result === 'pending') return 'Record pilot result'
      if (merged.pilot_result === 'fail') return 'Failed pilot — use Rollback to Diagnose, not Advance'
      break
    case 'rollout':
      if ((merged.rollout_wave || 0) < 4) return 'All four waves must be signed off (set wave to W4)'
      break
    case 'verify':
      if (!merged.verify_status || merged.verify_status === 'pending') return 'Record verify status'
      if (merged.verify_status === 'closed_not_fixed') return 'Not fixed — use Rollback to Diagnose'
      if (merged.verify_status === 'held_open') return 'Held open — resolve before closing'
      break
  }
  return null
}
