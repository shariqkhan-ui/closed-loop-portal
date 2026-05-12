'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createIssue } from '../hooks/useIssues'
import type { LoopCategory, LoopScope, LoopSeverity } from '@/lib/supabase'

export default function NewIssueModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [signalSource, setSignalSource] = useState('')
  const [signalEvidence, setSignalEvidence] = useState('')
  const [severity, setSeverity] = useState<LoopSeverity | ''>('')
  const [category, setCategory] = useState<LoopCategory | ''>('')
  const [scope, setScope] = useState<LoopScope | ''>('')
  const [scopeDetail, setScopeDetail] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerTeam, setOwnerTeam] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title required'); return }
    setSaving(true)
    setError(null)
    const created = await createIssue({
      title: title.trim(),
      description: description.trim() || null,
      signal_source: signalSource.trim() || null,
      signal_evidence: signalEvidence.trim() || null,
      severity: severity || null,
      category: category || null,
      scope: scope || null,
      scope_detail: scopeDetail.trim() || null,
      owner_name: ownerName.trim() || null,
      owner_team: ownerTeam.trim() || null,
    })
    setSaving(false)
    if (!created) { setError('Failed to create — check connection.'); return }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose} style={{ background: 'rgba(20, 17, 13, 0.45)' }}>
      <form
        onSubmit={submit}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[640px] border shadow-2xl animate-slide-in"
        style={{ background: 'var(--paper)', borderColor: 'var(--rule)' }}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--rule)' }}>
          <div>
            <div className="eyebrow mb-1">Stage 01 · Sense</div>
            <h2 className="font-serif text-2xl">New issue</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-[color:var(--paper-2)] rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Title *" hint="One line. The signal in plain English.">
            <input autoFocus className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Device offline at LKO-CSP-2841 >18h" />
          </Field>

          <Field label="Description">
            <textarea rows={2} className={inputCls} value={description} onChange={e => setDescription(e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Signal source" hint="device_offline_detector, ticket_cluster, audit, NPS…">
              <input className={inputCls} value={signalSource} onChange={e => setSignalSource(e.target.value)} />
            </Field>
            <Field label="Severity (optional · can set at Triage)">
              <select className={inputCls} value={severity} onChange={e => setSeverity(e.target.value as LoopSeverity | '')}>
                <option value="">—</option>
                <option value="P0">P0 · Critical</option>
                <option value="P1">P1 · Default</option>
                <option value="P2">P2 · Standard</option>
              </select>
            </Field>
            <Field label="Category">
              <select className={inputCls} value={category} onChange={e => setCategory(e.target.value as LoopCategory | '')}>
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
              <select className={inputCls} value={scope} onChange={e => setScope(e.target.value as LoopScope | '')}>
                <option value="">—</option>
                <option value="single_csp">Single CSP</option>
                <option value="csp_cohort">CSP cohort</option>
                <option value="city_wide">City-wide</option>
                <option value="network_wide">Network-wide</option>
              </select>
            </Field>
            <Field label="Scope detail">
              <input className={inputCls} value={scopeDetail} onChange={e => setScopeDetail(e.target.value)} placeholder="LKO-CSP-2841" />
            </Field>
            <Field label="Owner name">
              <input className={inputCls} value={ownerName} onChange={e => setOwnerName(e.target.value)} />
            </Field>
            <Field label="Owner team">
              <input className={inputCls} value={ownerTeam} onChange={e => setOwnerTeam(e.target.value)} />
            </Field>
          </div>

          <Field label="Evidence (links, IDs, screenshots)">
            <textarea rows={2} className={inputCls} value={signalEvidence} onChange={e => setSignalEvidence(e.target.value)} />
          </Field>
        </div>

        {error && (
          <div className="mx-6 mb-3 border-l-4 px-3 py-2 text-sm" style={{ borderColor: 'var(--warm)', background: 'var(--warm-soft)', color: 'var(--warm)' }}>
            {error}
          </div>
        )}

        <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--rule)' }}>
          <span className="text-[11px] font-mono italic" style={{ color: 'var(--ink-mute)' }}>Issue will open in Stage 01 · Sense</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border text-sm" style={{ borderColor: 'var(--rule)' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium" style={{ background: 'var(--accent)', color: 'var(--paper)' }}>
              {saving ? 'Creating…' : 'Create Issue'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 border text-[14px] focus:outline-none focus:border-[color:var(--accent)] bg-[color:var(--paper)]'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--ink-mute)' }}>{label}</span>
      {children}
      {hint && <span className="block text-[11px] mt-1 italic" style={{ color: 'var(--ink-faint)' }}>{hint}</span>}
    </label>
  )
}
