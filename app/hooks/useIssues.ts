'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase, supabaseConfigured, type Issue } from '@/lib/supabase'

let memoryStore: Issue[] = []
let memoryListeners: Array<() => void> = []
const notify = () => memoryListeners.forEach(fn => fn())

function makeMockId() {
  return 'demo-' + Math.random().toString(36).slice(2, 10)
}

function nowIso() { return new Date().toISOString() }

function seedDemo() {
  if (memoryStore.length) return
  memoryStore = [
    {
      id: makeMockId(),
      issue_code: 'CL-2026-0001',
      title: 'Device offline at LKO-CSP-2841 >18h',
      description: 'Serial SY-LKO-44213 offline for 18 hours.',
      signal_source: 'device_offline_detector',
      signal_evidence: 'Offline alert at 02:14 IST on serial SY-LKO-44213',
      sensed_at: nowIso(),
      severity: 'P1',
      category: 'hardware',
      scope: 'single_csp',
      scope_detail: 'LKO-CSP-2841',
      owner_name: 'Vishal P.',
      owner_team: 'TFF lab via Field Ops',
      current_stage: 'diagnose',
      stage_entered_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
      created_at: nowIso(),
      updated_at: nowIso(),
    },
    {
      id: makeMockId(),
      issue_code: 'CL-2026-0002',
      title: 'Migration eligibility failing for wallet-positive customers',
      description: '47 tickets across UP West.',
      signal_source: 'ticket_pattern_detector',
      severity: 'P0',
      category: 'process',
      scope: 'city_wide',
      scope_detail: 'UP West + 3 cities',
      owner_name: 'Ajinkya',
      owner_team: 'Migration Ops + CSP Success',
      current_stage: 'pilot',
      stage_entered_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      root_cause_hypothesis: 'Wallet-sync lag 4–18min',
      fix_plan: 'Read-after-confirm with 5s retry',
      success_criteria: 'Migration-eligibility failure < 0.5% across 4 cities for 21 days',
      detector: 'ticket-pattern detector on "migration eligibility"',
      observation_window_days: 21,
      pilot_cohort: 'UP West, 10 days',
      pilot_result: 'pass',
      created_at: nowIso(),
      updated_at: nowIso(),
    },
    {
      id: makeMockId(),
      issue_code: 'CL-2026-0003',
      title: 'LH cohort CSPs <30% device activation',
      description: '14 CSPs across UP West and UP East.',
      signal_source: 'activation_completion_monitor',
      severity: 'P1',
      category: 'partner',
      scope: 'csp_cohort',
      scope_detail: '14 CSPs',
      owner_name: 'Gaurav',
      owner_team: 'CSP Success',
      current_stage: 'triage',
      stage_entered_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ]
}

export function useIssues() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    if (!supabaseConfigured) {
      seedDemo()
      setIssues([...memoryStore])
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    setIssues((data as unknown as Issue[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    if (!supabaseConfigured) {
      const fn = () => setIssues([...memoryStore])
      memoryListeners.push(fn)
      return () => { memoryListeners = memoryListeners.filter(l => l !== fn) }
    }
  }, [refresh])

  return { issues, loading, error, refresh }
}

export async function createIssue(input: Partial<Issue>): Promise<Issue | null> {
  if (!supabaseConfigured) {
    seedDemo()
    const idx = memoryStore.length + 1
    const issue: Issue = {
      id: makeMockId(),
      issue_code: 'CL-2026-' + String(idx).padStart(4, '0'),
      title: input.title || 'Untitled',
      description: input.description || null,
      signal_source: input.signal_source || null,
      signal_evidence: input.signal_evidence || null,
      sensed_at: nowIso(),
      severity: input.severity || null,
      category: input.category || null,
      scope: input.scope || null,
      scope_detail: input.scope_detail || null,
      owner_name: input.owner_name || null,
      owner_team: input.owner_team || null,
      current_stage: 'sense',
      stage_entered_at: nowIso(),
      created_at: nowIso(),
      updated_at: nowIso(),
    } as Issue
    memoryStore = [issue, ...memoryStore]
    notify()
    return issue
  }
  const { data, error } = await supabase.from('issues').insert(input).select().single()
  if (error) { console.error(error); return null }
  return data as unknown as Issue
}

export async function updateIssue(id: string, patch: Partial<Issue>): Promise<Issue | null> {
  if (!supabaseConfigured) {
    memoryStore = memoryStore.map(i => i.id === id ? { ...i, ...patch, updated_at: nowIso() } : i)
    notify()
    return memoryStore.find(i => i.id === id) || null
  }
  const { data, error } = await supabase.from('issues').update(patch).eq('id', id).select().single()
  if (error) { console.error(error); return null }
  return data as unknown as Issue
}
