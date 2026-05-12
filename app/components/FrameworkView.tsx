'use client'

import { STAGES } from '@/lib/framework'

export default function FrameworkView() {
  return (
    <main className="min-h-screen">
      <div className="max-w-[920px] px-12 py-12">
        <div className="eyebrow flex justify-between items-center mb-10">
          <span>Wiom · Operations Engine</span>
          <span style={{ color: 'var(--warm)' }}>The framework</span>
        </div>

        <h1 className="font-serif text-[68px] leading-[0.95] tracking-tight" style={{ color: 'var(--ink)' }}>
          Zero open <em className="italic font-light" style={{ color: 'var(--accent)' }}>loops.</em>
        </h1>
        <p className="font-serif italic text-xl mt-4 max-w-[640px]" style={{ color: 'var(--ink-2)' }}>
          Seven stages. One canonical ID per issue, end to end. Every stage has an owner, a defined output, and a clock. The loop only closes when verification re-runs the original signal — and if the signal returns, the loop auto-reopens.
        </p>

        <div className="border-b mt-12" style={{ borderColor: 'var(--rule)' }} />

        <section className="mt-10">
          <div className="flex items-baseline gap-4 mb-6 pb-4 border-b" style={{ borderColor: 'var(--rule)' }}>
            <span className="font-serif text-5xl font-light" style={{ color: 'var(--ink-faint)' }}>01</span>
            <h2 className="font-serif text-3xl tracking-tight">The seven stages.</h2>
          </div>

          {STAGES.map(s => (
            <div key={s.key} className="grid grid-cols-[80px_1fr] gap-8 py-7 border-t" style={{ borderColor: 'var(--rule)' }}>
              <div className="font-serif text-5xl font-light leading-none" style={{ color: 'var(--ink-faint)' }}>{s.num}</div>
              <div>
                <h3 className="font-serif text-2xl mb-2">{s.name}</h3>
                <div className="flex gap-6 flex-wrap mb-3 font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--ink-mute)' }}>
                  <span>Owner<strong className="font-medium text-[13px] normal-case tracking-normal font-sans ml-2" style={{ color: 'var(--ink-2)' }}>{s.owner}</strong></span>
                  <span>Output<strong className="font-medium text-[13px] normal-case tracking-normal font-sans ml-2" style={{ color: 'var(--ink-2)' }}>{s.output}</strong></span>
                  <span>Clock<strong className="font-medium text-[13px] normal-case tracking-normal font-sans ml-2" style={{ color: 'var(--ink-2)' }}>{s.clockP1}</strong></span>
                  <span>Sign-off<strong className="font-medium text-[13px] normal-case tracking-normal font-sans ml-2" style={{ color: 'var(--ink-2)' }}>{s.signOff}</strong></span>
                </div>
                <p className="text-[15px] max-w-[64ch]" style={{ color: 'var(--ink-2)' }}>{s.blurb}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-16">
          <div className="flex items-baseline gap-4 mb-6 pb-4 border-b" style={{ borderColor: 'var(--rule)' }}>
            <span className="font-serif text-5xl font-light" style={{ color: 'var(--ink-faint)' }}>02</span>
            <h2 className="font-serif text-3xl tracking-tight">Four rollout waves.</h2>
          </div>
          <p className="text-[15px] mb-6 max-w-[64ch]" style={{ color: 'var(--ink-2)' }}>
            Rollout never moves from 0% to 100% in one step. Four waves of cumulative coverage, each with a hold period during which the original detector re-runs on the just-deployed cohort.
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: 'PILOT', pct: '~5%', tone: 'warm' },
              { label: 'WAVE 1', pct: '10%', tone: 'accent' },
              { label: 'WAVE 2', pct: '25%', tone: 'accent' },
              { label: 'WAVE 3', pct: '50%', tone: 'accent' },
              { label: 'WAVE 4', pct: '100%', tone: 'good' },
            ].map(w => {
              const color = w.tone === 'warm' ? 'var(--warm)' : w.tone === 'good' ? 'var(--good)' : 'var(--accent)'
              const bg = w.tone === 'warm' ? 'var(--warm-soft)' : w.tone === 'good' ? 'var(--good-soft)' : 'var(--paper-2)'
              return (
                <div key={w.label} className="border p-4 text-center" style={{ borderColor: color, background: bg }}>
                  <div className="font-mono text-[10px] tracking-wider" style={{ color }}>{w.label}</div>
                  <div className="font-serif text-3xl font-light mt-2" style={{ color: 'var(--ink)' }}>{w.pct}</div>
                  <div className="text-[10px] mt-1 font-mono" style={{ color: 'var(--ink-mute)' }}>HOLD · sign-off</div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-baseline gap-4 mb-6 pb-4 border-b" style={{ borderColor: 'var(--rule)' }}>
            <span className="font-serif text-5xl font-light" style={{ color: 'var(--ink-faint)' }}>03</span>
            <h2 className="font-serif text-3xl tracking-tight">Five rules that close the loop.</h2>
          </div>

          {[
            { n: '01', t: 'Success criteria written before pilot, not after rollout', b: 'The criterion lives in the fix-design artifact. It names the detector, the threshold, and the observation window. No criterion, no rollout.' },
            { n: '02', t: 'The original detector verifies — not a new one', b: 'The signal that surfaced the issue is the signal that closes it. We do not get to substitute a more flattering metric at the end.' },
            { n: '03', t: 'The team that fixed it doesn\'t get to verify it', b: 'Verification sits outside the execution chain. Structural protection, not a trust issue.' },
            { n: '04', t: 'Detection keeps running after closure', b: 'The detector does not switch off. It keeps watching the specific scope indefinitely. Re-occurrence auto-reopens the loop.' },
            { n: '05', t: 'Control cohorts where possible', b: 'The fixed cohort must outperform control on the original signal — not just look fine in isolation.' },
          ].map(r => (
            <div key={r.n} className="border-l-2 pl-5 py-4 mb-3" style={{ borderColor: 'var(--accent)', background: 'var(--accent-soft)' }}>
              <h4 className="font-medium text-[13px] tracking-wide uppercase mb-1" style={{ color: 'var(--accent)' }}>Rule {r.n} · {r.t}</h4>
              <p className="text-[14px]" style={{ color: 'var(--ink-2)' }}>{r.b}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
