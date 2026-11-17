import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef, useState } from 'react'
import { Bot, Music2, Store, User } from 'lucide-react'
import { EventImage } from '@/components/art/EventImage'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { EVENTS } from '@/data/world'
import { mulberry32 } from '@/lib/prng'
import { Container, Eyebrow, H2, Reveal } from '../ui'

/* ───────── 2 · The hook: Maya's $100 ticket becomes $400 ───────── */
export function Hook() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const reduced = useReducedMotion()
  const price = useTransform(scrollYProgress, [0.35, 0.72], [100, 400])
  const [shown, setShown] = useState(100)
  useMotionValueEvent(price, 'change', (v) => setShown(Math.round(v)))
  const color = useTransform(scrollYProgress, [0.35, 0.72], ['#f5f5f7', '#ff453a'])
  const tilt = useTransform(scrollYProgress, [0, 0.35, 0.72, 1], [-6, 0, 4, 6])
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.9, 1])
  const bots = useTransform(scrollYProgress, [0.2, 0.5], [0, 1])
  const beats = [
    'Meet Maya. A student here in Atlanta.',
    'She waited two hours in a virtual queue. Sold out in minutes.',
    'Ten minutes later, her $100 seat was listed at $400.',
    'Maya didn’t lose to other fans. She lost to bots.',
  ]
  const [beat, setBeat] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setBeat(v < 0.24 ? 0 : v < 0.47 ? 1 : v < 0.74 ? 2 : 3))
  const b = reduced ? 3 : beat
  const value = reduced ? 400 : shown
  return (
    <section ref={ref} className="relative" style={{ height: reduced ? 'auto' : '320vh' }}>
      <div className={`${reduced ? 'py-28' : 'sticky top-0 h-[100svh]'} flex items-center overflow-hidden`}>
        <BotSwarm progress={bots} />
        <Container className="relative grid items-center gap-10 md:grid-cols-2">
          <div className="relative">
            <Eyebrow>The hook</Eyebrow>
            <div className="relative mt-4 min-h-[3.2em] text-[clamp(34px,4.8vw,60px)] leading-[1.02] font-bold tracking-[-0.04em]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={b}
                  initial={{ opacity: 0, y: 26, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  {b === 3 ? (
                    <>
                      Maya didn’t lose to other fans. <span className="text-err">She lost to bots.</span>
                    </>
                  ) : (
                    beats[b]
                  )}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="mt-6 flex gap-1.5">
              {beats.map((_, i) => (
                <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i === b ? 'w-8 bg-fg' : 'w-3 bg-white/20'}`} />
              ))}
            </div>
          </div>
          <motion.div style={{ rotate: tilt, scale }} className="relative mx-auto w-full max-w-[420px]">
            <div className="relative aspect-[1.586] overflow-hidden rounded-[26px] shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)] hairline-2">
              <EventImage id="nova" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,.6))]" />
              <div className="absolute inset-0 flex flex-col justify-between p-5">
                <div className="text-[24px] font-bold tracking-[-0.03em]">{EVENTS.nova.artist}</div>
                <div className="flex items-end justify-between">
                  <div className="text-[13px] text-white/75">Sec 312 · Row 14 · Seat 7</div>
                  <motion.div style={{ color: reduced ? '#ff453a' : color }} className="text-[56px] leading-none font-bold tracking-[-0.05em] tabular">
                    ${value}
                  </motion.div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center text-[14px] text-fg-3">
              Face value $100 · {value > 100 ? `+${Math.round(((value - 100) / 100) * 100)}% markup` : 'set by the artist'}
            </div>
          </motion.div>
        </Container>
      </div>
    </section>
  )
}

function BotSwarm({ progress }: { progress: MotionValue<number> }) {
  const dots = useRef(
    (() => {
      const r = mulberry32(42)
      return Array.from({ length: 46 }, () => ({ x: r() * 100, y: r() * 100, s: 10 + r() * 14, d: r() }))
    })(),
  ).current
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {dots.map((d, i) => (
        <BotDot key={i} d={d} progress={progress} />
      ))}
    </div>
  )
}
function BotDot({ d, progress }: { d: { x: number; y: number; s: number; d: number }; progress: MotionValue<number> }) {
  const o = useTransform(progress, [d.d * 0.6, d.d * 0.6 + 0.3], [0, 0.55])
  const sc = useTransform(progress, [d.d * 0.6, d.d * 0.6 + 0.3], [0.4, 1])
  return (
    <motion.span className="absolute text-err" style={{ left: `${d.x}%`, top: `${d.y}%`, opacity: o, scale: sc }}>
      <Bot size={d.s} />
    </motion.span>
  )
}

/* ───────── 3 · The problem: three numbers ───────── */
export function Problem() {
  const stats = [
    { v: 3.5, fmt: (n: number) => `${n.toFixed(1)}B`, k: 'requests hit Ticketmaster in the Eras Tour presale (2022). Four times its previous record.' },
    { v: 3.7, fmt: (n: number) => `$${n.toFixed(1)}B`, k: 'in resale fees collected by Ticketmaster from 2019 to 2024, according to the FTC lawsuit.' },
    { v: 6, fmt: (n: number) => `${Math.round(n)}×`, k: 'face value: resale prices found by UK authorities. Up to six times what the artist set.' },
  ]
  return (
    <section className="bg-paper py-28 text-paper-ink sm:py-36">
      <Container>
        <Reveal>
          <Eyebrow light>The problem</Eyebrow>
          <H2 className="mt-4 max-w-[16ch]">This isn’t one bad day. It’s the system.</H2>
        </Reveal>
        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <div className="border-t border-black/10 pt-6">
                <div className="text-[clamp(64px,8vw,104px)] leading-none font-bold tracking-[-0.055em]">
                  <NumberTicker value={s.v} from={0} format={s.fmt} duration={1.8} startOnView />
                </div>
                <p className="mt-4 max-w-[30ch] text-[17px] leading-snug text-paper-mute">{s.k}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ───────── 4 · Follow the money ───────── */
export function FollowTheMoney() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const nodes = [
    { icon: Music2, t: 'Artist sets', v: '$100', s: 'the price they think is fair', tone: 'text-accent-soft' },
    { icon: Bot, t: 'Bots buy', v: 'in ms', s: 'beating the per-person limit', tone: 'text-err' },
    { icon: Store, t: 'Broker relists', v: '$400', s: 'on a resale site', tone: 'text-err' },
    { icon: User, t: 'Fan pays', v: '$400+', s: 'plus fees, or stays home', tone: 'text-warn' },
  ]
  const line = useTransform(scrollYProgress, [0, 0.8], ['0%', '100%'])
  return (
    <section ref={ref} className="relative py-28 sm:py-36">
      <Container>
        <Reveal>
          <Eyebrow>Follow the money</Eyebrow>
          <H2 className="mt-4 max-w-[18ch]">Everybody gets paid. Except the artist.</H2>
        </Reveal>
        <div className="relative mt-16">
          <div className="absolute top-[34px] right-[12%] left-[12%] hidden h-[2px] bg-white/10 md:block">
            <motion.div className="h-full bg-[linear-gradient(90deg,var(--color-accent),#ff453a,#ffd60a)]" style={{ width: line }} />
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {nodes.map((n, i) => (
              <Reveal key={i} delay={i * 0.15} className="relative flex flex-col items-center text-center">
                <span className={`relative z-10 grid h-[70px] w-[70px] place-items-center rounded-full bg-ink-3 hairline-2 ${n.tone}`}>
                  <n.icon size={30} />
                </span>
                <div className="mt-4 text-[15px] font-semibold text-fg-2">{n.t}</div>
                <div className={`text-[40px] leading-tight font-bold tracking-[-0.04em] ${n.tone}`}>{n.v}</div>
                <div className="text-[14px] text-fg-3">{n.s}</div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.3} className="mt-16">
          <div className="mx-auto max-w-[760px] rounded-[28px] bg-ink-2 p-8 text-center hairline">
            <div className="text-[clamp(28px,3.6vw,44px)] leading-[1.08] font-bold tracking-[-0.035em]">
              The artist gets <span className="text-err">$0</span> of the extra $300.
            </div>
            <p className="mt-3 text-[17px] text-fg-3">The middlemen and the platforms capture all of it.</p>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

/* ───────── 5 · The big idea ───────── */
export function BigIdea() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const words = 'What if the ticket itself knew the rules?'.split(' ')
  const reduced = useReducedMotion()
  const glow = useTransform(scrollYProgress, [0.3, 1], [0, 1])
  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden py-28">
      <motion.div style={{ opacity: glow }} className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgba(62,134,255,.28),transparent)]" />
      <Container className="relative text-center">
        <h2 className="mx-auto max-w-[14ch] text-[clamp(52px,9vw,128px)] leading-[0.95] font-bold tracking-[-0.055em]">
          {words.map((w, i) => (
            <Word key={i} p={scrollYProgress} i={i} n={words.length} reduced={!!reduced} accent={i >= 3}>
              {w}
            </Word>
          ))}
        </h2>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-10 max-w-[34ch] text-[clamp(18px,2vw,22px)] text-fg-2">Meet FairSeat: every ticket is a unique digital ticket with its rules written inside. Nobody can sell it for more, and nobody can switch the rules off.</p>
        </Reveal>
      </Container>
    </section>
  )
}
function Word({ p, i, n, children, reduced, accent }: { p: MotionValue<number>; i: number; n: number; children: string; reduced: boolean; accent: boolean }) {
  const start = 0.15 + (i / n) * 0.7
  const o = useTransform(p, [start, start + 0.12], [0.12, 1])
  return (
    <motion.span style={{ opacity: reduced ? 1 : o }} className={`inline-block pr-[0.22em] ${accent ? 'text-gradient-accent' : ''}`}>
      {children}
    </motion.span>
  )
}
