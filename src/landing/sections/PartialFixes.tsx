import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type ComponentType } from 'react'
import { Blocks, Building2, Check, Gem, Mic, Minus, ScanLine, Ticket, X } from 'lucide-react'
import { Segmented } from '@/components/ui/Segmented'
import { Container, Eyebrow, H2, Lead, Reveal } from '../ui'

/* ───────── 5b · Partial fixes: what's been tried, and why it stalls ───────── */

type Icon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
interface Track {
  icon: Icon
  kicker: string
  who: string
  lead: { name: string; tag: string; big: string; bigK: string; stats: [string, string][] }
  items: { icon: Icon; name: string; tag: string; d: string }[]
  catches: string[]
}

const TRACKS: Track[] = [
  {
    icon: Building2,
    kicker: 'Inside one company',
    who: 'Ticketmaster',
    lead: {
      name: 'Face Value Exchange',
      tag: 'Artist opt-in',
      big: 'Face value',
      bigK: 'is the most a fan can resell for, on Ticketmaster.',
      stats: [
        ['Nov 2025', 'Olivia Dean turns it on for her Art of Loving Live tour'],
        ['$0', 'to the artist from any resale'],
      ],
    },
    items: [
      { icon: ScanLine, name: 'SafeTix', tag: '2019', d: 'An encrypted barcode that refreshes every few seconds. Screenshots don’t scan.' },
      { icon: Gem, name: 'NFTs on Flow', tag: '2022', d: 'Millions minted as souvenirs. You still get in with a normal ticket.' },
    ],
    catches: ['Only works inside one company’s app', 'That company can change the rules', 'Resale is its business. FIFA’s own marketplace: 15% from the buyer, 15% from the seller'],
  },
  {
    icon: Blocks,
    kicker: 'On a blockchain',
    who: 'FIFA, startups',
    lead: {
      name: 'FIFA Collect · Right to Buy',
      tag: 'World Cup 26',
      big: '100,000+',
      bigK: 'tokens that give the right to buy a ticket. Not the ticket.',
      stats: [
        ['$999', 'one “Right to Final: England” token. The ticket is paid on top'],
        ['Oct 2025', 'Switzerland’s gambling regulator files a criminal complaint'],
      ],
    },
    items: [
      { icon: Ticket, name: 'Big Neon', tag: '2018 · shut down', d: 'Token tickets with resale rules, from a Ticketfly co-founder. The money ran out before it went on-chain.' },
      { icon: Mic, name: 'KYD Labs', tag: 'Dec 2025', d: 'A Solana ticketing startup. Its own conference talk: “NFT ticketing doesn’t work.”' },
    ],
    catches: ['The token wasn’t the ticket', 'Fans paid twice: token, then ticket', 'No cap on the price'],
  },
]

export function PartialFixes() {
  return (
    <section id="partial" className="bg-paper py-28 text-paper-ink sm:py-36">
      <Container>
        <Reveal>
          <Eyebrow light>Partial fixes</Eyebrow>
          <H2 className="mt-4 max-w-[15ch]">Hasn’t anyone fixed this? Partly.</H2>
          <Lead light className="mt-5">
            Two kinds of attempts. Each one fixed a piece of the problem, and left the rest with whoever runs the platform.
          </Lead>
        </Reveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          {TRACKS.map((t, i) => (
            <Reveal key={t.kicker} delay={i * 0.1}>
              <TrackCard t={t} />
            </Reveal>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
          <Reveal>
            <OneTourTwoPrices />
          </Reveal>
          <Reveal delay={0.1}>
            <Scorecard />
          </Reveal>
        </div>

        <Reveal className="mt-20 sm:mt-24">
          <div className="mx-auto max-w-[920px] text-center">
            <div className="text-[13px] font-semibold tracking-[0.14em] text-paper-mute uppercase">The lesson</div>
            <p className="mt-4 text-[clamp(34px,5.2vw,68px)] leading-[1.02] font-bold tracking-[-0.045em]">
              The problem isn’t the technology. It’s <span className="text-accent-on-light">who controls the rules.</span>
            </p>
            <div className="mt-10 text-[13px] font-semibold text-paper-mute">Who sets the rules?</div>
            <div className="mx-auto mt-3 grid max-w-[760px] gap-2 text-left sm:grid-cols-3">
              {[
                ['Face Value Exchange', 'Ticketmaster', false],
                ['Right to Buy', 'FIFA', false],
                ['Proof of Seat', 'Code anyone can read', true],
              ].map(([k, v, us]) => (
                <div key={k as string} className={`rounded-[18px] px-4 py-3.5 ${us ? 'bg-accent-on-light text-white' : 'bg-white shadow-[0_1px_0_rgba(0,0,0,.04),0_14px_30px_-24px_rgba(0,0,0,.3)]'}`}>
                  <div className={`text-[12px] font-semibold tracking-[0.06em] uppercase ${us ? 'text-white/80' : 'text-paper-mute'}`}>{k}</div>
                  <div className="mt-0.5 text-[18px] font-semibold tracking-[-0.02em]">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <p className="mt-16 max-w-[110ch] text-[12px] leading-relaxed text-paper-mute">
          Sources: Live Nation newsroom and Hypebot (Olivia Dean, Nov 2025); Ticketmaster Business (Face Value Exchange); TechCrunch (SafeTix, 2019); Decrypt (Flow NFTs, 2022); Bloomberg and CasinoBeats (FIFA Collect, Oct 2025);
          Crypto Briefing (Right to Buy tokens, 2026); AP (FIFA resale fees, 2026); Input (Big Neon); Solana Compass (KYD Labs, Breakpoint 2025). The $100 ticket in “One tour, two prices” is illustrative.
        </p>
      </Container>
    </section>
  )
}

function TrackCard({ t }: { t: Track }) {
  return (
    <div className="flex h-full flex-col rounded-[28px] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,.04),0_20px_40px_-30px_rgba(0,0,0,.25)] sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-paper-2 text-paper-ink">
          <t.icon size={20} />
        </span>
        <div>
          <div className="text-[13px] font-semibold tracking-[0.08em] text-paper-mute uppercase">{t.kicker}</div>
          <div className="text-[19px] font-semibold tracking-[-0.02em]">{t.who}</div>
        </div>
      </div>

      <div className="mt-6 rounded-[20px] bg-paper p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <div className="text-[16px] font-semibold tracking-[-0.01em]">{t.lead.name}</div>
          <span className="rounded-full bg-white px-2.5 py-0.5 text-[12px] font-semibold text-paper-mute">{t.lead.tag}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[clamp(38px,4.4vw,52px)] leading-none font-bold tracking-[-0.045em]">{t.lead.big}</span>
          <span className="text-[15px] leading-snug text-paper-mute">{t.lead.bigK}</span>
        </div>
        <div className="mt-4 flex flex-col gap-2 border-t border-black/[0.07] pt-3">
          {t.lead.stats.map(([v, k]) => (
            <div key={k} className="flex items-baseline gap-3">
              <span className="w-[86px] shrink-0 text-[16px] font-bold tracking-[-0.02em] whitespace-nowrap tabular">{v}</span>
              <span className="text-[14px] leading-snug text-paper-mute">{k}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {t.items.map((it) => (
          <div key={it.name} className="rounded-[20px] bg-paper p-4">
            <div className="flex items-center gap-2">
              <it.icon size={16} className="text-paper-mute" />
              <span className="text-[15px] font-semibold">{it.name}</span>
              <span className="ml-auto text-[12px] font-semibold whitespace-nowrap text-paper-mute">{it.tag}</span>
            </div>
            <div className="mt-1.5 text-[14px] leading-snug text-paper-mute">{it.d}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-black/[0.07] pt-5">
        <div className="text-[13px] font-semibold tracking-[0.08em] text-[#b42318] uppercase">The catch</div>
        <ul className="mt-3 flex flex-col gap-2.5">
          {t.catches.map((c) => (
            <li key={c} className="flex items-start gap-2.5 text-[15px] leading-snug">
              <span className="mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ff453a]/12 text-[#b42318]">
                <X size={12} strokeWidth={3} />
              </span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* One tour, two prices: the cap only lives where the company's app reaches. */
type Place = 'tm' | 'sh' | 'pos'
const MAX = 360
const PLACES: Record<Place, { label: string; price: string; lo: number; hi: number; note: string; rule: string; tone: string; bar: string }> = {
  tm: {
    label: 'Ticketmaster',
    price: '$100',
    lo: 100,
    hi: 100,
    note: 'Face Value Exchange on: resale locked at what the fan paid.',
    rule: 'The rule lives in Ticketmaster’s app.',
    tone: 'text-ok',
    bar: 'bg-ok',
  },
  sh: {
    label: 'StubHub',
    price: '$150–$340',
    lo: 150,
    hi: 340,
    note: 'Same tour, same weekend: 50% to 240% over face value.',
    rule: 'Ticketmaster’s rule doesn’t reach here.',
    tone: 'text-err',
    bar: 'bg-err',
  },
  pos: {
    label: 'Proof of Seat',
    price: '$105 max',
    lo: 100,
    hi: 105,
    note: 'The contract rejects any sale above 105% of face value.',
    rule: 'The rule lives in the ticket itself.',
    tone: 'text-accent-soft',
    bar: 'bg-accent',
  },
}
const ORDER: Place[] = ['tm', 'sh', 'pos']

function OneTourTwoPrices() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '0px 0px -20% 0px' })
  const reduced = useReducedMotion()
  const [place, setPlace] = useState<Place>('tm')
  const [touched, setTouched] = useState(false)
  useEffect(() => {
    if (!inView || touched || reduced) return
    const t = setInterval(() => setPlace((p) => ORDER[(ORDER.indexOf(p) + 1) % ORDER.length]), 3200)
    return () => clearInterval(t)
  }, [inView, touched, reduced])
  const p = PLACES[place]
  const pct = (v: number) => `${(v / MAX) * 100}%`
  return (
    <div ref={ref} className="flex h-full flex-col rounded-[28px] bg-ink p-6 text-fg sm:p-7">
      <div className="text-[13px] font-semibold tracking-[0.08em] text-fg-3 uppercase">Olivia Dean · Nov 2025</div>
      <div className="mt-1 text-[24px] font-semibold tracking-[-0.025em]">One tour, two prices</div>
      <div className="mt-1 text-[14px] text-fg-3">A $100 ticket, resold on…</div>
      <Segmented
        className="mt-5"
        size="lg"
        value={place}
        onChange={(v) => {
          setTouched(true)
          setPlace(v)
        }}
        options={ORDER.map((k) => ({ value: k, label: PLACES[k].label }))}
      />
      <div className="mt-6 min-h-[118px]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={place} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
            <div className={`text-[clamp(44px,5vw,56px)] leading-none font-bold tracking-[-0.045em] tabular ${p.tone}`}>{p.price}</div>
            <div className="mt-3 text-[15px] leading-snug text-fg-2">{p.note}</div>
            <div className="mt-1 text-[15px] leading-snug font-semibold">{p.rule}</div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-auto pt-6">
        <div className="relative h-3 rounded-full bg-white/[0.08]">
          <motion.div
            className={`absolute top-0 h-full rounded-full ${p.bar}`}
            initial={false}
            animate={{ left: pct(p.hi === p.lo ? p.lo - 4 : p.lo), width: pct(Math.max(p.hi - p.lo, 7)) }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          />
          <div className="absolute -top-1.5 h-6 w-[2px] rounded-full bg-fg" style={{ left: pct(100) }} />
        </div>
        <div className="relative mt-2 h-4 text-[12px] text-fg-3 tabular">
          <span className="absolute left-0">$0</span>
          <span className="absolute -translate-x-1/2 font-semibold text-fg" style={{ left: pct(100) }}>
            Face $100
          </span>
          <span className="absolute right-0">${MAX}</span>
        </div>
      </div>
    </div>
  )
}

/* What each approach actually guarantees. */
type Mark = 'ok' | 'part' | 'no'
const COLS = [
  { k: 'Ticketmaster', s: 'Face Value Exchange' },
  { k: 'FIFA Collect', s: 'Right to Buy tokens' },
  { k: 'Proof of Seat', s: 'Ticket = token', us: true },
]
const SCORE: { k: string; cells: [Mark, string][] }[] = [
  { k: 'The token is the ticket', cells: [['no', 'The NFT is a souvenir'], ['no', 'A right to buy one'], ['ok', 'One seat, one token']] },
  { k: 'Fans pay once', cells: [['ok', 'Yes'], ['no', 'Token, then ticket'], ['ok', 'One all-in price']] },
  { k: 'Resale price capped', cells: [['part', 'If the artist opts in, on its site only'], ['no', 'No cap'], ['ok', '105%, on every resale']] },
  { k: 'Rules no single company controls', cells: [['no', 'Ticketmaster can change them'], ['no', 'FIFA runs the platform'], ['ok', 'Public code anyone can verify']] },
]
function MarkIcon({ m }: { m: Mark }) {
  const cls = m === 'ok' ? 'bg-[#1a7f37] text-white' : m === 'part' ? 'bg-[#ffd60a]/35 text-[#7a5200]' : 'bg-[#ff453a]/12 text-[#b42318]'
  const I = m === 'ok' ? Check : m === 'part' ? Minus : X
  return (
    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${cls}`} aria-label={m === 'ok' ? 'Yes' : m === 'part' ? 'Partly' : 'No'} role="img">
      <I size={12} strokeWidth={3} />
    </span>
  )
}
function Scorecard() {
  return (
    <div className="h-full rounded-[28px] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,.04),0_20px_40px_-30px_rgba(0,0,0,.25)] sm:p-7">
      <div className="text-[13px] font-semibold tracking-[0.08em] text-paper-mute uppercase">Side by side</div>
      <div className="mt-1 text-[24px] font-semibold tracking-[-0.025em]">What each one guarantees</div>
      {/* phones: one block per question */}
      <div className="mt-5 flex flex-col gap-3 sm:hidden">
        {SCORE.map((r) => (
          <div key={r.k} className="rounded-[18px] bg-paper p-3.5">
            <div className="text-[15px] font-semibold">{r.k}</div>
            <div className="mt-2.5 flex flex-col gap-2">
              {r.cells.map(([m, v], i) => (
                <div key={i} className="flex items-start gap-2 text-[13px] leading-snug">
                  <MarkIcon m={m} />
                  <span>
                    <b className={COLS[i].us ? 'text-accent-on-light' : ''}>{COLS[i].k}:</b> <span className="text-paper-mute">{v}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* tablet and up: a grid */}
      <div className="mt-5 hidden grid-cols-[1.05fr_1fr_1fr_1fr] text-[14px] sm:grid">
        <div />
        {COLS.map((c) => (
          <div key={c.k} className={`rounded-t-[14px] px-3 pt-3 pb-2.5 ${c.us ? 'bg-accent-on-light/[0.08]' : ''}`}>
            <div className={`font-semibold tracking-[-0.01em] ${c.us ? 'text-accent-on-light' : ''}`}>{c.k}</div>
            <div className="text-[12px] text-paper-mute">{c.s}</div>
          </div>
        ))}
        {SCORE.map((r, ri) => (
          <div key={r.k} className="contents">
            <div className="border-t border-black/[0.07] py-3 pr-3 font-semibold leading-snug">{r.k}</div>
            {r.cells.map(([m, v], i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * ri + 0.04 * i }}
                className={`flex items-start gap-2 border-t px-3 py-3 leading-snug ${COLS[i].us ? `border-accent-on-light/15 bg-accent-on-light/[0.08] font-semibold ${ri === SCORE.length - 1 ? 'rounded-b-[14px]' : ''}` : 'border-black/[0.07] text-paper-mute'}`}
              >
                <MarkIcon m={m} />
                <span className={COLS[i].us ? 'text-paper-ink' : ''}>{v}</span>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
