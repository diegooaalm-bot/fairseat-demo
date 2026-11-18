import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Bot, CalendarPlus, Check, DoorOpen, Gauge, LayoutDashboard, Music2, ShieldCheck, Ticket, Timer } from 'lucide-react'
import { EventImage } from '@/components/art/EventImage'
import { Button } from '@/components/ui/Button'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { Pill } from '@/components/ui/Pill'
import { Range } from '@/components/ui/Range'
import { Segmented } from '@/components/ui/Segmented'
import { haptic } from '@/lib/haptics'
import { int, usd } from '@/lib/money'
import { mulberry32 } from '@/lib/prng'
import { spring } from '@/lib/motion'
import { JURISDICTIONS, type Jurisdiction } from '@/lib/rules'
import { Screen } from '@/demo/shell/Screen'
import { TabBar } from '@/demo/shell/TabBar'
import { describeTx } from '@/demo/presenter/txText'
import { NOVA_BASELINE, novaStats, useDemo } from '@/store/demo'
import { IssueCanvas } from './IssueCanvas'
import { Kpi } from './Kpi'

export function OrganizerApp() {
  const tab = useDemo((s) => s.nav.organizer.tab)
  const setTab = useDemo((s) => s.setTab)
  return (
    <div className="absolute inset-0">
      {tab === 'create' ? <Create /> : <Dashboard />}
      <TabBar
        value={tab}
        onChange={(t) => setTab('organizer', t)}
        items={[
          { id: 'dashboard', label: 'Live', icon: LayoutDashboard },
          { id: 'create', label: 'New show', icon: CalendarPlus },
        ]}
      />
    </div>
  )
}

/* ───────────────────────── Dashboard ───────────────────────── */
const fmtInt = (n: number) => int(n)
const fmtUsd = (cents: number) => usd(Math.round(cents / 100) * 100, { cents: false })

function Dashboard() {
  const s = useDemo()
  const st = novaStats(s)
  const add = useDemo((x) => x.addBotsBlocked)
  const setTab = useDemo((x) => x.setTab)
  const rnd = useRef(mulberry32(17))
  // the bot shield never sleeps: a trickle of blocked attempts while you watch
  useEffect(() => {
    const t = setInterval(() => add(Math.floor(4 + rnd.current() * 40)), 1400)
    return () => clearInterval(t)
  }, [add])
  const waitlist = Object.entries(NOVA_BASELINE.waitlist)
  const wlMax = Math.max(...waitlist.map(([, v]) => v))
  const wlTotal = waitlist.reduce((a, [, v]) => a + v, 0)
  const recent = s.ledger.filter((t) => t.eventId === 'nova').slice(0, 4)

  return (
    <Screen title="Live" tabBar roleButton titleAccessory={<Pill tone="ok" icon={<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok" />}>Live</Pill>}>
      <div className="flex flex-col gap-4 px-4">
        <div className="relative overflow-hidden rounded-[22px] p-4 hairline">
          <EventImage id="nova" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,13,.85),rgba(10,10,13,.35))]" />
          <div className="relative flex items-center justify-between gap-3">
            <div>
              <div className="text-[12px] font-semibold tracking-[0.06em] text-white/70 uppercase">Organizer console</div>
              <div className="text-[22px] font-bold tracking-[-0.03em]">Faye Webster</div>
              <div className="text-[13px] text-white/75">Sat, Jun 26, 2027 · Fox Theatre</div>
            </div>
            <Pill tone={st.soldOut ? 'accent' : 'ok'}>{st.soldOut ? 'Sold out' : 'On sale'}</Pill>
          </div>
        </div>

        {s.organizer.secondShowIssued && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-[18px] bg-accent/12 p-3.5 hairline">
            <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-accent-fill text-white">
              <CalendarPlus size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold">Night 2 · Sun, Jun 27, 2027</div>
              <div className="text-[12px] text-fg-3">{int(s.organizer.draft.capacity)} tickets issued · waitlist gets first access</div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <Kpi label="Tickets sold" icon={<Ticket size={16} />} value={<NumberTicker value={st.sold} format={fmtInt} />} sub={`of ${int(st.capacity)} · 4 per fan max`} />
          <Kpi label="Primary revenue" icon={<Gauge size={16} />} value={<NumberTicker value={st.revenueCents} format={fmtUsd} />} sub="Proof of Seat fee $1.50 / ticket" />
          <Kpi label="Bots blocked" tone="err" icon={<Bot size={16} />} value={<NumberTicker value={st.botsBlocked} format={fmtInt} duration={0.6} />} sub="Identity check at the door" />
          <Kpi label="Resales within cap" tone="ok" icon={<ShieldCheck size={16} />} value="100%" sub={`${int(st.resales)} resales · none above $105`} />
          <Kpi label="Avg. entry time" tone="accent" icon={<Timer size={16} />} value={`${NOVA_BASELINE.gateSeconds} s`} sub="Works offline at the gate" />
          <Kpi label="Artist royalties" tone="gold" icon={<Music2 size={16} />} value={<NumberTicker value={st.royaltyCents} format={fmtUsd} />} sub="2% of face value on every resale" />
        </div>

        {/* Real waitlist */}
        <div className="rounded-[22px] bg-ink-3 p-4 hairline">
          <div className="flex items-baseline justify-between">
            <div className="text-[17px] font-semibold tracking-[-0.015em]">Real waitlist</div>
            <div className="text-[13px] text-fg-3">verified fans · 1 person = 1 account</div>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {waitlist.map(([zone, n], i) => (
              <div key={zone}>
                <div className="flex justify-between text-[13px]">
                  <span className="text-fg-2">{zone}</span>
                  <span className="font-semibold tabular">{int(n)}</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-stage))]" initial={{ width: 0 }} animate={{ width: `${(n / wlMax) * 100}%` }} transition={{ delay: 0.1 + i * 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-[14px] bg-white/[0.04] p-3">
            <span className="text-[13px] leading-snug text-fg-2">
              <b className="text-fg">{int(wlTotal)}</b> real fans want in. That’s demand you can trust.
            </span>
            {!s.organizer.secondShowIssued && (
              <Button size="sm" onClick={() => setTab('organizer', 'create')} trailing={<ArrowRight size={14} />}>
                Add a show
              </Button>
            )}
          </div>
        </div>

        {/* Recent */}
        <div className="rounded-[22px] bg-ink-3 p-4 hairline">
          <div className="mb-2 text-[17px] font-semibold tracking-[-0.015em]">Latest activity</div>
          <AnimatePresence initial={false}>
            {recent.map((tx) => {
              const d = describeTx(tx)
              const Icon = d.icon
              return (
                <motion.div key={tx.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 border-b border-white/[0.06] py-2.5 last:border-0">
                  <Icon size={17} className={d.tone === 'ok' ? 'text-ok' : d.tone === 'err' ? 'text-err' : d.tone === 'gold' ? 'text-gold' : 'text-accent-soft'} />
                  <span className="min-w-0 flex-1 truncate text-[14px]">{d.title}</span>
                  {d.amount && <span className="text-[14px] font-semibold tabular">{d.amount}</span>}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </Screen>
  )
}

/* ───────────────────────── Create wizard ───────────────────────── */
const STEPS = ['Show', 'Price', 'Rules', 'Where'] as const

function Create() {
  const draft = useDemo((s) => s.organizer.draft)
  const issued = useDemo((s) => s.organizer.secondShowIssued)
  const upd = useDemo((s) => s.updateDraft)
  const updR = useDemo((s) => s.updateDraftRules)
  const issue = useDemo((s) => s.issueSecondShow)
  const setTab = useDemo((s) => s.setTab)
  const [step, setStep] = useState(0)
  const [issuing, setIssuing] = useState<'idle' | 'run' | 'done'>(issued ? 'done' : 'idle')
  const [count, setCount] = useState(issued ? draft.capacity : 0)
  const r = draft.rules
  const j = JURISDICTIONS[r.jurisdiction]

  if (issuing !== 'idle') {
    return (
      <Screen title="Issuing tickets" large={false}>
        <div className="flex flex-col px-5 pt-2">
          <div className="text-center">
            <div className="text-[13px] font-semibold tracking-[0.08em] text-accent-soft uppercase">{draft.name}</div>
            <div className="mt-1 text-[52px] leading-none font-bold tracking-[-0.045em] tabular">{int(count)}</div>
            <div className="text-[15px] text-fg-3">of {int(draft.capacity)} tickets issued</div>
          </div>
          <div className="mt-4 rounded-[24px] bg-[radial-gradient(100%_80%_at_50%_0%,#121c38,#0a0a0d)] p-2 hairline">
            <IssueCanvas total={draft.capacity} run={issuing === 'run'} onProgress={setCount} onDone={() => (setIssuing('done'), issue(), haptic('success'))} />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {[
              ['One unique token per seat', 'ERC-721 on Base'],
              [`Rules written into each one`, `cap ${r.capPct}% · royalty ${r.royaltyPct}% (ERC-2981) · ${r.maxPerPerson} per fan`],
              ['Network fees paid by Proof of Seat', `≈ ${usd(Math.round(draft.capacity * 1))} total · ≈ $0.01 each`],
            ].map(([a, b], i) => (
              <motion.div
                key={a}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: count > (draft.capacity / 3) * i ? 1 : 0.3, x: 0 }}
                className="flex items-center gap-3 rounded-[14px] bg-ink-3 px-3.5 py-2.5 hairline"
              >
                <span className={`grid h-5 w-5 place-items-center rounded-full ${count > (draft.capacity / 3) * (i + 1) - 1 ? 'bg-ok text-ink' : 'bg-white/10'}`}>
                  <Check size={12} strokeWidth={3.5} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold">{a}</span>
                  <span className="block truncate text-[12px] text-fg-3">{b}</span>
                </span>
              </motion.div>
            ))}
          </div>
          <AnimatePresence>
            {issuing === 'done' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring.gentle} className="mt-5">
                <Button size="lg" full onClick={() => setTab('organizer', 'dashboard')}>
                  Back to live dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Screen>
    )
  }

  return (
    <Screen
      title="New show"
      tabBar
      roleButton
      footer={
        <div className="flex gap-2.5">
          {step > 0 && (
            <Button size="lg" variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button size="lg" full onClick={() => setStep(step + 1)} trailing={<ArrowRight size={18} />}>
              Next: {STEPS[step + 1]}
            </Button>
          ) : (
            <Button size="lg" full onClick={() => (haptic('heavy'), setIssuing('run'))}>
              Issue {int(draft.capacity)} tickets
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-5" style={{ paddingBottom: 60 }}>
        {/* stepper */}
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)} className="flex-1 text-left">
              <div className={`h-1 rounded-full transition-colors ${i <= step ? 'bg-accent' : 'bg-white/10'}`} />
              <div className={`mt-1.5 text-[12px] font-semibold ${i === step ? 'text-fg' : 'text-fg-3'}`}>{s}</div>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="flex flex-col gap-4">
            {step === 0 && (
              <Card>
                <Field k="Show" v={draft.name} />
                <Field k="Venue" v={`${draft.venue} · Atlanta`} />
                <Field k="Date" v={draft.date} />
                <p className="pt-1 text-[13px] text-fg-3">Added because 7,505 verified fans are on the waitlist for Jun 26.</p>
              </Card>
            )}
            {step === 1 && (
              <Card>
                <Range label="Capacity" value={draft.capacity} min={5000} max={75000} step={1000} onChange={(v) => upd({ capacity: v })} format={(v) => int(v)} />
                <Range label="Face value" value={draft.priceCents / 100} min={20} max={300} step={5} onChange={(v) => upd({ priceCents: v * 100 })} format={(v) => `$${v}`} />
                <div className="rounded-[14px] bg-white/[0.04] p-3 text-[13px] text-fg-2">
                  Proof of Seat fee: $1.50 × {int(draft.capacity)} = <b className="text-fg">{usd(draft.capacity * 150, { cents: false })}</b>, paid by you. Fans pay face value, no surprise fees.
                </div>
              </Card>
            )}
            {step === 2 && (
              <Card>
                <Range label="Resale cap" value={r.capPct} min={100} max={125} step={5} onChange={(v) => updR({ capPct: v })} format={(v) => `${v}% · max ${usd((draft.priceCents * v) / 100, { cents: false })}`} hint="Default 105%. Nobody can sell above this, not even you." />
                <Range label="Artist royalty" value={r.royaltyPct} min={0} max={5} step={1} onChange={(v) => updR({ royaltyPct: v })} format={(v) => `${v}% of face value per resale`} />
                <Range label="Tickets per fan" value={r.maxPerPerson} min={1} max={8} onChange={(v) => updR({ maxPerPerson: v })} format={(v) => `${v}`} />
                <Range label="Resale closes" value={r.resaleCloseHours} min={0} max={24} onChange={(v) => updR({ resaleCloseHours: v })} format={(v) => (v ? `${v} h before` : 'at showtime')} />
                <Range label="Gifts per ticket" value={r.maxTransfers} min={0} max={5} onChange={(v) => updR({ maxTransfers: v })} format={(v) => `${v} transfers`} />
              </Card>
            )}
            {step === 3 && (
              <>
                <Segmented<Jurisdiction>
                  value={r.jurisdiction}
                  onChange={(v) => updR({ jurisdiction: v })}
                  options={[
                    { value: 'UK', label: 'UK' },
                    { value: 'GA', label: 'Georgia' },
                    { value: 'NY', label: 'New York' },
                    { value: 'CO', label: 'Colorado' },
                  ]}
                />
                <motion.div key={r.jurisdiction} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring.snappy} className="overflow-hidden rounded-[22px] bg-ink-3 hairline">
                  <div className="border-b border-white/[0.06] p-4">
                    <div className="text-[12px] font-semibold tracking-[0.06em] text-fg-3 uppercase">Rules applied · {j.label}</div>
                    <div className="mt-1 text-[19px] font-semibold tracking-[-0.02em]">{j.headline}</div>
                    <div className="mt-1 text-[13px] leading-snug text-fg-2">{j.note}</div>
                  </div>
                  <RuleRow k="Resale cap" v={`${r.capPct}% (${usd((draft.priceCents * r.capPct) / 100, { cents: false })})`} state={j.openMarket ? 'On Proof of Seat' : 'Enforced'} warn={j.openMarket} />
                  <RuleRow k="Transfer to other markets" v={j.openMarket ? 'Allowed by state law' : 'Official market only'} state={j.openMarket ? 'Open' : 'Locked'} warn={j.openMarket} />
                  <RuleRow k="Artist royalty" v={`${r.royaltyPct}% of face per resale`} state={j.openMarket ? 'On Proof of Seat' : 'Enforced'} warn={j.openMarket} />
                  <RuleRow k="Tickets per fan" v={`${r.maxPerPerson}`} state="Enforced" />
                  <RuleRow k="Resale window" v={`Closes ${r.resaleCloseHours} h before`} state="Enforced" />
                  <RuleRow k="Verified buyers only" v="Identity checked once" state="Enforced" />
                </motion.div>
                <div className="flex items-start gap-2 px-1 text-[12px] leading-snug text-fg-3">
                  <DoorOpen size={14} className="mt-0.5 shrink-0" /> The rules are written into the ticket contract when you issue. After that, nobody can change them, including you and Proof of Seat.
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Screen>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-5 rounded-[22px] bg-ink-3 p-4 hairline">{children}</div>
}
function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[13px] text-fg-3">{k}</div>
      <div className="mt-0.5 text-[17px] font-semibold tracking-[-0.01em]">{v}</div>
    </div>
  )
}
function RuleRow({ k, v, state, warn }: { k: string; v: string; state: string; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 last:border-0">
      <div className="min-w-0">
        <div className="text-[14px] font-semibold">{k}</div>
        <div className="truncate text-[12px] text-fg-3">{v}</div>
      </div>
      <Pill tone={warn ? 'warn' : 'ok'}>{state}</Pill>
    </div>
  )
}

