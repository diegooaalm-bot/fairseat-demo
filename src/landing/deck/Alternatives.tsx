import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type ComponentType } from 'react'
import { Building2, Blocks, Check, CreditCard, Gauge, Lock, Minus, Music2, Ticket, X } from 'lucide-react'
import { Mark as Logo } from '@/components/brand/Logo'
import { Container, Section, SlideHead, Sources } from './ui'

/* ───────── Slide 8 · Better than the alternatives (interactive) ───────── */

type Id = 'tm' | 'fifa' | 'pos'
type M = 'yes' | 'part' | 'no'
type Icon = ComponentType<{ size?: number; className?: string }>

const GUARANTEES: { icon: Icon; k: string }[] = [
  { icon: Ticket, k: 'The token is the ticket' },
  { icon: CreditCard, k: 'Fans pay once' },
  { icon: Gauge, k: 'Resale price capped' },
  { icon: Lock, k: 'No company can change the rules' },
  { icon: Music2, k: 'Artist paid on every resale' },
]

const OPTIONS: Record<Id, { tab: string; kicker: string; icon: Icon; marks: M[]; rules: string; line: string }> = {
  tm: { tab: 'Ticketmaster', kicker: 'Inside one company', icon: Building2, marks: ['no', 'yes', 'part', 'no', 'no'], rules: 'Ticketmaster', line: 'The cap stops at the app’s edge.' },
  fifa: { tab: 'FIFA Collect', kicker: 'On a blockchain today', icon: Blocks, marks: ['no', 'no', 'no', 'no', 'no'], rules: 'FIFA', line: 'The token isn’t the ticket. Fans pay twice.' },
  pos: { tab: 'Proof of Seat', kicker: 'Our approach', icon: Logo, marks: ['yes', 'yes', 'yes', 'yes', 'yes'], rules: 'Code anyone can read', line: 'The rule travels with the ticket.' },
}
const ORDER: Id[] = ['tm', 'fifa', 'pos']
const score = (id: Id) => OPTIONS[id].marks.filter((m) => m === 'yes').length

export function Alternatives() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-25% 0px -25% 0px' })
  const reduced = useReducedMotion()
  const [id, setId] = useState<Id>('tm')
  const [touched, setTouched] = useState(false)
  useEffect(() => {
    if (!inView || touched || reduced) return
    const t = setInterval(() => setId((x) => ORDER[(ORDER.indexOf(x) + 1) % 3]), 4200)
    return () => clearInterval(t)
  }, [inView, touched, reduced])
  const o = OPTIONS[id]
  const pick = (x: Id) => {
    setTouched(true)
    setId(x)
  }

  return (
    <Section id="why" tone="gray">
      <Container>
        <SlideHead kicker="Part 2 · Why it wins" title="Better Than the Alternatives" sub="Every fix so far is a policy the platform can also turn off." />

        <div ref={ref} className="mt-12">
          {/* the three contenders */}
          <div role="tablist" aria-label="Compare approaches" className="grid grid-cols-3 gap-2 sm:gap-3">
            {ORDER.map((x) => {
              const c = OPTIONS[x]
              const on = x === id
              const us = x === 'pos'
              const sc = score(x)
              return (
                <button
                  key={x}
                  role="tab"
                  aria-selected={on}
                  onClick={() => pick(x)}
                  className={`relative overflow-hidden rounded-[22px] border p-3 text-left transition-all duration-300 sm:p-5 ${
                    on ? (us ? 'border-deck-blue bg-deck-blue text-white shadow-[0_24px_50px_-24px_rgba(43,107,240,.9)]' : 'border-deck-ink bg-deck-ink text-white shadow-[0_24px_50px_-28px_rgba(13,15,20,.8)]') : 'border-deck-line bg-white hover:border-deck-blue/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <c.icon size={22} className={on ? 'text-white' : us ? 'text-deck-blue' : 'text-deck-slate'} />
                    <Ring value={sc} on={on} us={us} />
                  </div>
                  <div className={`mt-3 hidden text-[11px] font-semibold tracking-[0.12em] uppercase sm:block ${on ? 'text-white/70' : 'text-deck-mute'}`}>{c.kicker}</div>
                  <div className="mt-0.5 text-[15px] leading-tight font-semibold tracking-[-0.02em] sm:text-[20px]">{c.tab}</div>
                  {on && !touched && !reduced && (
                    <motion.span key={`bar-${x}`} className="absolute bottom-0 left-0 h-[3px] bg-white/70" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 4.2, ease: 'linear' }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* the stage */}
          <div className="mt-3 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[360px] overflow-hidden rounded-[26px] bg-deck-ink p-6 text-white sm:min-h-[400px] sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div key={id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="flex h-full flex-col">
                  {id === 'tm' ? <TmVisual /> : id === 'fifa' ? <FifaVisual /> : <PosVisual />}
                  <div className="mt-auto pt-8 text-[clamp(24px,2.6vw,32px)] leading-[1.1] font-bold tracking-[-0.03em]">{o.line}</div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-2">
              {GUARANTEES.map((g, i) => {
                const m = o.marks[i]
                return (
                  <div key={g.k} className="flex flex-1 items-center gap-3 rounded-[18px] border border-deck-line bg-white px-4 py-3">
                    <g.icon size={20} className="shrink-0 text-deck-slate" />
                    <span className="flex-1 text-[15px] leading-tight font-semibold sm:text-[16px]">{g.k}</span>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={`${id}-${i}`}
                        initial={{ scale: 0.3, opacity: 0, rotate: -40 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.3, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 22, delay: i * 0.06 }}
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${m === 'yes' ? 'bg-deck-green text-white' : m === 'part' ? 'bg-[#fff4e0] text-deck-amber' : 'bg-deck-red/12 text-deck-red'}`}
                        role="img"
                        aria-label={m === 'yes' ? 'Yes' : m === 'part' ? 'Only partly' : 'No'}
                      >
                        {m === 'yes' ? <Check size={18} strokeWidth={3} /> : m === 'part' ? <Minus size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )
              })}
              <div className={`flex items-center justify-between gap-3 rounded-[18px] px-4 py-3.5 transition-colors duration-300 ${id === 'pos' ? 'bg-deck-blue text-white' : 'bg-deck-ink text-white'}`}>
                <span className="text-[12px] font-semibold tracking-[0.12em] text-white/70 uppercase">Rules set by</span>
                <AnimatePresence mode="wait">
                  <motion.span key={id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-[17px] font-bold tracking-[-0.02em]">
                    {o.rules}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <Sources>Sources: Ticketmaster Face Value Exchange help pages; Live Nation and Hypebot (Olivia Dean, Nov 2025); FIFA Collect; Bloomberg (Gespa complaint, Oct 2025); KYD Labs conference talk (Dec 2025).</Sources>
      </Container>
    </Section>
  )
}

function Ring({ value, on, us }: { value: number; on: boolean; us: boolean }) {
  const r = 15
  const c = 2 * Math.PI * r
  return (
    <span className="relative grid h-10 w-10 place-items-center" aria-label={`${value} of 5`}>
      <svg width="40" height="40" viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" strokeWidth="4" className={on ? 'stroke-white/20' : 'stroke-deck-line'} />
        <motion.circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className={on ? 'stroke-white' : us ? 'stroke-deck-blue' : 'stroke-deck-red'}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - value / 5) }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span className="text-[11px] font-bold tabular">{value}/5</span>
    </span>
  )
}

const MAX = 360
const pct = (v: number) => `${(v / MAX) * 100}%`

/** Ticketmaster: the same tour, capped in its app, not outside it. */
function TmVisual() {
  const bars = [
    { k: 'In the Ticketmaster app', s: 'Face Value Exchange on', v: 100, label: '$100', c: 'bg-deck-green' },
    { k: 'Same weekend, on StubHub', s: 'The rule doesn’t reach here', v: 340, label: 'up to $340', c: 'bg-deck-red' },
  ]
  return (
    <div>
      <Chip>Olivia Dean’s tour · Nov 2025 · a $100 ticket</Chip>
      <div className="mt-7 flex flex-col gap-6">
        {bars.map((b, i) => (
          <div key={b.k}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[15px] font-semibold">{b.k}</span>
              <span className={`text-[26px] font-bold tracking-[-0.03em] tabular ${i ? 'text-[#ff8a8e]' : 'text-[#7be39b]'}`}>{b.label}</span>
            </div>
            <div className="relative mt-2 h-4 rounded-full bg-white/[0.08]">
              <motion.div className={`h-full rounded-full ${b.c}`} initial={{ width: 0 }} animate={{ width: pct(b.v) }} transition={{ duration: 1, delay: 0.15 + i * 0.25, ease: [0.16, 1, 0.3, 1] }} />
              <span className="absolute -top-1.5 h-7 w-[2px] rounded bg-white/80" style={{ left: pct(100) }} />
            </div>
            <div className="mt-1.5 text-[13px] text-white/55">{b.s}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** FIFA: a token that is only the right to buy, then the ticket on top. */
function FifaVisual() {
  return (
    <div>
      <Chip>World Cup 26 · 100,000+ “Right to Buy” tokens</Chip>
      <div className="mt-7 flex items-stretch gap-3">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex-1 rounded-[18px] border border-white/15 bg-white/[0.06] p-4">
          <div className="text-[12px] font-semibold tracking-[0.1em] text-white/60 uppercase">Pay 1 · the token</div>
          <div className="mt-2 text-[40px] leading-none font-bold tracking-[-0.04em]">$999</div>
          <div className="mt-2 text-[13px] text-white/60">“Right to Final: England”</div>
        </motion.div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.4 }} className="grid place-items-center text-[28px] font-bold text-white/50">
          +
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.55 }} className="flex-1 rounded-[18px] border border-deck-red/40 bg-deck-red/15 p-4">
          <div className="text-[12px] font-semibold tracking-[0.1em] text-[#ff8a8e] uppercase">Pay 2 · the ticket</div>
          <div className="mt-2 text-[40px] leading-none font-bold tracking-[-0.04em]">Full price</div>
          <div className="mt-2 text-[13px] text-white/60">only if the team gets there</div>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-5 flex flex-wrap gap-2 text-[13px]">
        <span className="rounded-full bg-white/[0.08] px-3 py-1.5 text-white/75">No price cap</span>
        <span className="rounded-full bg-white/[0.08] px-3 py-1.5 text-white/75">Swiss criminal complaint · Oct 2025</span>
        <span className="rounded-full bg-white/[0.08] px-3 py-1.5 text-white/75">KYD Labs: “NFT ticketing doesn’t work”</span>
      </motion.div>
    </div>
  )
}

/** Proof of Seat: one bar that hits a wall at $105, anywhere. */
function PosVisual() {
  return (
    <div>
      <Chip>Any resale of a $100 ticket</Chip>
      <div className="mt-7 flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-semibold">Highest possible price</span>
        <span className="text-[26px] font-bold tracking-[-0.03em] text-[#8db8ff] tabular">$105</span>
      </div>
      <div className="relative mt-2 h-4 rounded-full bg-white/[0.08]">
        <motion.div className="h-full rounded-full bg-deck-blue" initial={{ width: 0 }} animate={{ width: [pct(0), pct(150), pct(105)] }} transition={{ duration: 1.3, times: [0, 0.6, 1], ease: 'easeOut' }} />
        <span className="absolute -top-2 h-8 w-[4px] rounded bg-white" style={{ left: pct(105) }} />
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="absolute top-7 -translate-x-1/2 rounded-full bg-deck-red/20 px-2 py-0.5 font-mono text-[11px] whitespace-nowrap text-[#ff8a8e]"
          style={{ left: pct(150) }}
        >
          ✕ above cap: reverted
        </motion.span>
      </div>
      <div className="mt-12 grid grid-cols-3 gap-2">
        {[
          ['Seller', '$102', 'text-white'],
          ['Artist', '+$2', 'text-[#5fd6c2]'],
          ['Platform', '$1', 'text-white/80'],
        ].map(([k, v, c], i) => (
          <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.1 }} className="rounded-[14px] bg-white/[0.06] p-3">
            <div className="text-[12px] text-white/55">{k}</div>
            <div className={`text-[22px] font-bold tracking-[-0.03em] tabular ${c}`}>{v}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-full bg-white/[0.1] px-3 py-1.5 text-[13px] font-semibold text-white/80">{children}</span>
}
