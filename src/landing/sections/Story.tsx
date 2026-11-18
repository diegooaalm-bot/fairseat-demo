import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef, useState } from 'react'
import { Bot, Database, Eye, Lock, Music2, Search, ShieldCheck, Star, Store, User, Users, Zap, Copy } from 'lucide-react'
import { photoUrl } from '@/data/world'
import { mulberry32 } from '@/lib/prng'
import { Container, Eyebrow, H2, Lead, Reveal } from '../ui'

/* ───────── 2 · The hook (slide 2): the Eras presale ───────── */
export function Hook() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const reduced = useReducedMotion()
  const price = useTransform(scrollYProgress, [0.4, 0.74], [449, 35438])
  const [shown, setShown] = useState(449)
  useMotionValueEvent(price, 'change', (v) => setShown(Math.round(v)))
  const color = useTransform(scrollYProgress, [0.4, 0.74], ['#f5f5f7', '#ff453a'])
  const tilt = useTransform(scrollYProgress, [0, 0.35, 0.72, 1], [-6, 0, 4, 6])
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.9, 1])
  const bots = useTransform(scrollYProgress, [0.2, 0.5], [0, 1])
  const beats = ['November 2022. The Eras Tour presale.', 'The site crashed under the demand.', 'The next day, one Atlanta floor seat was listed for $35,438.', 'Face value of a standard ticket: $49 to $449.']
  const [beat, setBeat] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setBeat(v < 0.24 ? 0 : v < 0.45 ? 1 : v < 0.74 ? 2 : 3))
  const b = reduced ? 3 : beat
  const value = reduced ? 35438 : shown
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
                      Face value of a standard ticket: <span className="text-accent-soft">$49 to $449.</span>
                    </>
                  ) : b === 2 ? (
                    <>
                      The next day, one Atlanta floor seat was listed for <span className="text-err">$35,438.</span>
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
            <p className="mt-6 text-[12px] tracking-[0.06em] text-fg-3 uppercase">Sources: CNN; Fortune (Nov 2022)</p>
          </div>
          <motion.div style={{ rotate: tilt, scale }} className="relative mx-auto w-full max-w-[420px]">
            <div className="relative aspect-[1.586] overflow-hidden rounded-[26px] shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)] hairline-2">
              <img src={photoUrl('taylor')} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.25)_0%,transparent_40%,rgba(0,0,0,.7))]" />
              <div className="absolute inset-0 flex flex-col justify-between p-5">
                <div>
                  <div className="text-[13px] font-semibold tracking-[0.08em] text-white/80 uppercase">Resale listing · 2022</div>
                  <div className="text-[22px] font-bold tracking-[-0.03em]">Eras Tour · Atlanta · Floor</div>
                </div>
                <motion.div style={{ color: reduced ? '#ff453a' : color }} className="self-end text-[clamp(44px,6vw,58px)] leading-none font-bold tracking-[-0.05em] tabular">
                  ${value.toLocaleString('en-US')}
                </motion.div>
              </div>
            </div>
            <div className="mt-4 text-center text-[14px] text-fg-3">Top standard face value $449 · about 80× that</div>
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

/* ───────── 3 · Why ticketing is broken (slide 4) ───────── */
export function Problem() {
  const cards = [
    { icon: Zap, t: 'Bots & scalpers', d: 'Bots buy the moment a sale opens, then relist at several times face value.' },
    { icon: Copy, t: 'Fake & duplicate tickets', d: 'One PDF sold to five buyers: only the first one gets in. Bitcoin’s double-spend problem, for tickets.' },
    { icon: Users, t: 'Artists earn $0 on resale', d: 'The markup goes to brokers and resale platforms, not the artist or venue.' },
    { icon: Database, t: 'One company’s ledger', d: 'A single company keeps the only record of who owns each ticket, and sets the fees.' },
  ]
  return (
    <section className="bg-paper py-28 text-paper-ink sm:py-36">
      <Container>
        <Reveal>
          <Eyebrow light>Part 1 · The problem</Eyebrow>
          <H2 className="mt-4 max-w-[16ch]">Why ticketing is broken</H2>
          <Lead light className="mt-5">
            Four problems a regular ticketing database can’t fix on its own.
          </Lead>
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.t} delay={i * 0.08}>
              <div className="h-full rounded-[24px] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,.04),0_20px_40px_-30px_rgba(0,0,0,.25)]">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-err/10 text-[#c9352c]">
                  <c.icon size={20} />
                </span>
                <div className="mt-4 text-[19px] font-semibold tracking-[-0.02em]">{c.t}</div>
                <div className="mt-1.5 text-[15px] leading-snug text-paper-mute">{c.d}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ───────── 4 · Three cases (slides 5–7) ───────── */
export function Cases() {
  const cases = [
    {
      tag: 'Case 1 · Concerts',
      t: 'Taylor Swift’s Eras Tour',
      big: '$3,801',
      bigK: 'Average resale price, North American Eras dates (July 2023)',
      rows: [
        ['$157', 'Average resale price, Reputation Tour (2018)'],
        ['+2,321%', 'Jump in average resale price between the two tours'],
      ],
      src: 'Pitchfork via Benzinga (2023)',
    },
    {
      tag: 'Case 2 · World Cup',
      t: 'The 2026 World Cup Final',
      big: '$2.3M',
      bigK: 'Asking price for one lower-level seat behind the goal, on FIFA’s own resale marketplace (April 2026)',
      rows: [
        ['~$10,900', 'Face value of a top-tier final ticket sold directly by FIFA'],
        ['15% + 15%', 'FIFA’s cut: a fee from the buyer and another from the seller. No price cap.'],
      ],
      src: 'AP; Arab News (Apr 2026)',
    },
    {
      tag: 'Case 3 · Super Bowl',
      t: 'Super Bowl LX',
      big: '$6,620',
      bigK: 'Cheapest get-in price the day after the matchup was set',
      rows: [
        ['$3,361', 'Get-in price hours before kickoff, as resellers dumped seats'],
        ['$950', 'Lowest face value: an upper-level corner seat'],
      ],
      src: 'TicketData via Field Level Media; Bleacher Report',
    },
  ]
  return (
    <section className="py-28 sm:py-36">
      <Container>
        <Reveal>
          <Eyebrow>Three cases</Eyebrow>
          <H2 className="mt-4 max-w-[17ch]">Concerts, the World Cup, the Super Bowl.</H2>
          <Lead className="mt-5">The same problem, at every scale: the markup goes to whoever resells, never to the fan or the artist.</Lead>
        </Reveal>
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {cases.map((c, i) => (
            <Reveal key={c.t} delay={i * 0.1}>
              <div className="flex h-full flex-col rounded-[28px] bg-ink-2 p-6 hairline">
                <div className="text-[13px] font-semibold text-accent-soft">{c.tag}</div>
                <div className="mt-1 text-[20px] font-semibold tracking-[-0.02em]">{c.t}</div>
                <div className="mt-5 text-[clamp(52px,6vw,72px)] leading-none font-bold tracking-[-0.05em] text-err">{c.big}</div>
                <div className="mt-2 text-[14px] leading-snug text-fg-2">{c.bigK}</div>
                <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.07] pt-4">
                  {c.rows.map(([v, k]) => (
                    <div key={k} className="flex items-baseline gap-3">
                      <span className="w-[112px] shrink-0 text-[19px] font-bold tracking-[-0.02em] whitespace-nowrap tabular">{v}</span>
                      <span className="text-[13px] leading-snug text-fg-3">{k}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-5 text-[11px] tracking-[0.04em] text-fg-3 uppercase">Source: {c.src}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ───────── 5 · Where the markup goes (slide 8) ───────── */
export function FollowTheMoney() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const nodes = [
    { icon: Music2, t: 'Artist & venue set', v: '$100', s: 'face value, paid to them once', tone: 'text-accent-soft' },
    { icon: Bot, t: 'Bots buy', v: 'in ms', s: 'beating the per-person limit', tone: 'text-err' },
    { icon: Store, t: 'Broker relists', v: '$400', s: 'on a resale site', tone: 'text-err' },
    { icon: User, t: 'The fan pays', v: '$400+', s: 'plus buyer fees of about 20–35%', tone: 'text-warn' },
  ]
  const line = useTransform(scrollYProgress, [0, 0.8], ['0%', '100%'])
  return (
    <section ref={ref} className="relative bg-ink-2/40 py-28 sm:py-36">
      <Container>
        <Reveal>
          <Eyebrow>Where the markup goes</Eyebrow>
          <H2 className="mt-4 max-w-[18ch]">Everybody gets paid. Except the artist.</H2>
          <Lead className="mt-5">Illustrative: a $100 ticket bought by a bot and resold for $400.</Lead>
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
          <div className="mx-auto grid max-w-[880px] gap-3 sm:grid-cols-3">
            {[
              ['The fan pays', '$400+', 'text-warn'],
              ['The broker keeps', '$300', 'text-err'],
              ['Artist gets on resale', '$0', 'text-fg'],
            ].map(([k, v, tone]) => (
              <div key={k} className="rounded-[24px] bg-ink-2 p-6 text-center hairline">
                <div className="text-[13px] font-semibold tracking-[0.06em] text-fg-3 uppercase">{k}</div>
                <div className={`mt-2 text-[48px] leading-none font-bold tracking-[-0.045em] ${tone}`}>{v}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

/* ───────── 6 · The solution (slides 9–10) ───────── */
export function BigIdea() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const words = 'One seat. One token. One owner.'.split(' ')
  const reduced = useReducedMotion()
  const glow = useTransform(scrollYProgress, [0.3, 1], [0, 1])
  const cards = [
    { icon: Lock, t: 'No double-selling', d: 'One token, one wallet. It can’t be sold to two buyers.' },
    { icon: ShieldCheck, t: 'Rules in code', d: 'The 105% resale cap and the artist’s 2% run on every transfer, automatically.' },
    { icon: Search, t: 'Anyone can verify', d: 'Fans, venues and artists can check a ticket’s history before buying.' },
    { icon: Star, t: 'Proof of attendance', d: 'After the show, the token earns past fans early access to the next presale.' },
  ]
  return (
    <section ref={ref} className="relative overflow-hidden py-28 sm:py-36">
      <motion.div style={{ opacity: glow }} className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_35%,rgba(62,134,255,.28),transparent)]" />
      <Container className="relative">
        <div className="text-center">
          <Eyebrow>Part 2 · Our solution</Eyebrow>
          <h2 className="mx-auto mt-6 max-w-[12ch] text-[clamp(52px,9vw,124px)] leading-[0.95] font-bold tracking-[-0.055em]">
            {words.map((w, i) => (
              <Word key={i} p={scrollYProgress} i={i} n={words.length} reduced={!!reduced} accent={i >= 4}>
                {w}
              </Word>
            ))}
          </h2>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-8 max-w-[40ch] text-[clamp(18px,2vw,22px)] text-fg-2">
              Every ticket is a token on a public ledger, so it can’t sit in two wallets or be sold twice. The seat, the date and the original price live in the token itself.
            </p>
          </Reveal>
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.t} delay={i * 0.08}>
              <div className="h-full rounded-[24px] bg-ink-2 p-6 hairline">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-accent/15 text-accent-soft">
                  <c.icon size={20} />
                </span>
                <div className="mt-4 text-[19px] font-semibold tracking-[-0.02em]">{c.t}</div>
                <div className="mt-1.5 text-[15px] leading-snug text-fg-2">{c.d}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-6 flex items-center justify-center gap-2 text-center text-[14px] text-fg-3">
          <Eye size={15} /> Option to discuss: soulbound (non-transferable) tickets for the biggest shows, so there is no resale at all.
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

