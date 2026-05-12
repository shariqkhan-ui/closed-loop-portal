'use client'

import { X, ArrowRight } from 'lucide-react'
import { STAGES } from '@/lib/framework'

export default function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose} style={{ background: 'rgba(20, 17, 13, 0.45)' }}>
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[760px] max-h-[90vh] overflow-y-auto border shadow-2xl animate-slide-in"
        style={{ background: 'var(--paper)', borderColor: 'var(--rule)' }}
      >
        <div className="sticky top-0 z-10 px-8 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--rule)', background: 'var(--paper)' }}>
          <div>
            <div className="eyebrow mb-1">Wiom · Operations · Internal Pre-Read</div>
            <h2 className="text-2xl font-bold">What is Netbox Bug?</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[color:var(--paper-2)] rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-7 space-y-7">
          {/* Title + subtitle */}
          <section>
            <h1 className="text-[44px] leading-[0.95] tracking-tight font-bold" style={{ color: 'var(--ink)' }}>
              Signal to <em className="italic" style={{ color: 'var(--accent)' }}>Silence.</em>
            </h1>
            <p className="italic text-[17px] mt-3 max-w-[60ch]" style={{ color: 'var(--ink-2)' }}>
              An operations engine for Wiom — every device fault, every customer issue, every partner gap identified, fixed, and verified at network scale. Not a process improvement. Operational infrastructure.
            </p>
          </section>

          {/* Executive Summary */}
          <section className="border-l-4 pl-4 py-1" style={{ borderColor: 'var(--accent)', background: 'var(--accent-soft)' }}>
            <div className="eyebrow mb-2" style={{ color: 'var(--accent)' }}>Executive Summary</div>
            <p className="italic text-[15px] leading-relaxed" style={{ color: 'var(--ink-2)' }}>
              Wiom catches device bugs well; it finishes them poorly. This portal is a closed-loop system that makes <strong>“verified-fixed”</strong> the only valid closure state — through mandatory success criteria, independent verification, and a portal that runs the loop.
            </p>
          </section>

          <div className="border-t" style={{ borderColor: 'var(--rule)' }} />

          {/* The vision */}
          <section>
            <h2 className="text-2xl mb-3 font-bold">The vision.</h2>
            <p className="italic text-[16px] mb-3" style={{ color: 'var(--ink-2)' }}>Imagine Wiom in six months.</p>
            <p className="text-[14px] leading-relaxed mb-3" style={{ color: 'var(--ink-2)' }}>
              A CSP in Lucknow shows a device fault at 2am. The system triages it (P1, hardware, single CSP), drafts the success criterion, pushes a route-optimized brief to the nearest field agent&rsquo;s app. By the time the truck pulls up, the replacement is staged. By the end of the week the loop is <strong>verified-closed</strong> — because the original detector ran again and stayed quiet. Nobody opened a tracker. Nobody chased a status.
            </p>
            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ink-2)' }}>
              Multiply that across 30+ CSP partners, four cities, 100,000+ devices. Every closed loop makes the next one faster. Every re-occurrence auto-reopens before anyone notices.
            </p>
          </section>

          {/* Loop diagram */}
          <section className="border p-5" style={{ borderColor: 'var(--rule)', background: 'var(--paper-2)' }}>
            <div className="eyebrow mb-3">Figure 1 · The Wiom Closed Loop</div>
            <div className="flex items-center flex-wrap gap-1">
              {STAGES.map((s, idx) => {
                const highlight = s.key === 'design' || s.key === 'verify'
                return (
                  <div key={s.key} className="flex items-center">
                    <div
                      className="px-2.5 py-1.5 border min-w-[68px] text-center"
                      style={{
                        borderColor: highlight ? 'var(--accent)' : 'var(--rule)',
                        background: highlight ? 'var(--accent-soft)' : 'var(--paper)',
                      }}
                    >
                      <div className="text-[9px] font-bold tracking-wider" style={{ color: 'var(--ink-mute)' }}>{s.num}</div>
                      <div className="text-[11px] font-bold" style={{ color: highlight ? 'var(--accent)' : 'var(--ink)' }}>{s.name}</div>
                    </div>
                    {idx < STAGES.length - 1 && <ArrowRight className="w-3 h-3" style={{ color: 'var(--ink-faint)' }} />}
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] italic mt-3" style={{ color: 'var(--warm)' }}>
              If the original signal returns at any future point → auto-reopen
            </p>
            <div className="mt-3 p-2.5 border" style={{ borderColor: 'var(--rule)', background: 'var(--paper)' }}>
              <div className="eyebrow mb-1">One canonical Issue-ID</div>
              <p className="text-[12px]" style={{ color: 'var(--ink-2)' }}>Travels every stage · aging clock · stuck loops auto-escalate · structurally traceable end-to-end</p>
            </div>
          </section>

          {/* The numbers */}
          <section>
            <h2 className="text-2xl mb-3 font-bold">The numbers.</h2>
            <p className="text-[14px] mb-4" style={{ color: 'var(--ink-2)' }}>
              Eight operational targets. Each maps to a failure mode in today&rsquo;s state. If we hit them, the system works.
            </p>
            <div className="grid grid-cols-2 gap-0 border-t border-l" style={{ borderColor: 'var(--rule)' }}>
              {[
                ['Metric 01', 'Mean time to verified closure', '5 days at P1 · 8 hours at P0'],
                ['Metric 02', 'Verified-fixed rate', '>95% within 12 months'],
                ['Metric 03', 'Loop re-occurrence rate', '<5% at 6 months post-closure'],
                ['Metric 04', 'Manual triage load', '<20% of incoming signals'],
                ['Metric 05', 'Field visit utilization', '>85% of trips deliver verified fixes'],
                ['Metric 06', 'Closed-without-verification', '0% · structurally prevented'],
                ['Metric 07', 'Signal-to-first-response', '<2 min at P0 · <15 min at P1'],
                ['Metric 08', 'Knowledge graph reuse', '>60% of new issues match a prior case'],
              ].map(([label, title, target]) => (
                <div key={label} className="p-3 border-r border-b" style={{ borderColor: 'var(--rule)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>{label}</div>
                  <div className="text-[13px] font-bold mt-1" style={{ color: 'var(--ink)' }}>{title}</div>
                  <div className="text-[12px] mt-1" style={{ color: 'var(--ink-2)' }}>{target}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Four waves */}
          <section>
            <h2 className="text-2xl mb-3 font-bold">The four rollout waves.</h2>
            <p className="text-[14px] mb-4" style={{ color: 'var(--ink-2)' }}>
              Every rollout lands in four cumulative waves with mandatory hold and re-detection between each. A bad fix only breaks a small fraction of the scope before the next wave gets stopped.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'PILOT', pct: '~5%', tone: 'warm', sub: 'Representative' },
                { label: 'WAVE 1', pct: '10%', tone: 'accent', sub: 'First broad' },
                { label: 'WAVE 2', pct: '25%', tone: 'accent', sub: 'Expand' },
                { label: 'WAVE 3', pct: '50%', tone: 'accent', sub: 'Half scope' },
                { label: 'WAVE 4', pct: '100%', tone: 'good', sub: 'Full deploy' },
              ].map(w => {
                const color = w.tone === 'warm' ? 'var(--warm)' : w.tone === 'good' ? 'var(--good)' : 'var(--accent)'
                const bg = w.tone === 'warm' ? 'var(--warm-soft)' : w.tone === 'good' ? 'var(--good-soft)' : 'var(--paper-2)'
                return (
                  <div key={w.label} className="border p-3 text-center" style={{ borderColor: color, background: bg }}>
                    <div className="text-[9px] font-bold tracking-wider" style={{ color }}>{w.label}</div>
                    <div className="text-2xl font-bold mt-1.5" style={{ color: 'var(--ink)' }}>{w.pct}</div>
                    <div className="text-[10px] mt-1" style={{ color: 'var(--ink-mute)' }}>{w.sub}</div>
                  </div>
                )
              })}
            </div>
            <p className="italic text-[12px] mt-3" style={{ color: 'var(--warm)' }}>
              If the detector trips on any wave&rsquo;s cohort → rollback to Diagnose
            </p>
          </section>

          {/* Portal as operator */}
          <section>
            <h2 className="text-2xl mb-3 font-bold">The portal is an operator, not a screen.</h2>
            <p className="text-[14px] mb-4" style={{ color: 'var(--ink-2)' }}>
              Six categories of operational work, run by the portal. Humans pulled in only where judgment is genuinely required.
            </p>
            <div className="grid grid-cols-2 gap-0 border-t border-l" style={{ borderColor: 'var(--rule)' }}>
              {[
                ['01 · Auto-triage', 'Severity, scope, named team in seconds', 'Every incoming signal gets P0/P1/P2, category, CSP-level scope, and ownership within seconds. Manual triage runs only on genuinely ambiguous cases.'],
                ['02 · Auto-draft', 'Success criteria pre-filled at Design', 'Every fix proposal arrives with a measurable success criterion drawn from the closest historical match. The team edits; the portal authors.'],
                ['03 · Auto-dispatch', 'Visits routed and pushed, not scheduled', 'Field visits packaged into route-optimized briefs and pushed to agents’ apps. Right CSP, right device, bundled with every other open fix in that route.'],
                ['04 · Auto-verify', 'Closure when the detector stays quiet', 'When post-fix telemetry stays quiet for the success-criterion window, the portal closes the loop and writes the audit log automatically.'],
                ['05 · Auto-escalate', 'SLA breaches trigger without attention', 'Every tier crossing triggers automatically. The right team gets the alert. The get-well plan template arrives pre-drafted.'],
                ['06 · Auto-learn', 'Every closed loop makes the next one faster', 'Every closure becomes a node in the knowledge graph. The next similar issue gets its closest match in seconds. The system compounds.'],
              ].map(([label, title, desc]) => (
                <div key={label} className="p-3.5 border-r border-b" style={{ borderColor: 'var(--rule)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>{label}</div>
                  <div className="text-[13px] font-bold mt-1.5" style={{ color: 'var(--ink)' }}>{title}</div>
                  <div className="text-[12px] mt-1.5 leading-relaxed" style={{ color: 'var(--ink-2)' }}>{desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Closer */}
          <section className="border-l-4 pl-4 py-3" style={{ borderColor: 'var(--accent)', background: 'var(--accent-soft)' }}>
            <p className="text-[13px]" style={{ color: 'var(--ink-2)' }}>
              <strong>This portal.</strong> The seven stages — Sense, Triage, Diagnose, Design, Pilot, Rollout, Verify — are the visible workflow inside this app. Every issue you create here walks the loop with an aging clock per stage, a named owner, and a sign-off gate. The loop only closes when verification re-runs the original signal.
            </p>
          </section>
        </div>

        <div className="sticky bottom-0 px-8 py-4 border-t flex justify-end" style={{ borderColor: 'var(--rule)', background: 'var(--paper)' }}>
          <button onClick={onClose} className="px-5 py-2 text-sm font-bold" style={{ background: 'var(--accent)', color: 'var(--paper)' }}>
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
