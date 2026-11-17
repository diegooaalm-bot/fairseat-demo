import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Check, Minus, ShieldCheck, X } from 'lucide-react'
import { CapSlider } from '@/components/ui/CapSlider'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { Range } from '@/components/ui/Range'
import { Segmented } from '@/components/ui/Segmented'
import { int, usd } from '@/lib/money'
import { spring } from '@/lib/motion'
import { FESTIVAL_DEFAULTS, festival, resaleBreakdown } from '@/lib/rules'
import { Container, Eyebrow, H2, Lead, Reveal } from '../ui'

const money = (n: number) => usd(Math.round(n))

/* ───────── 7 · Interactive resale ───────── */
export function TryResale() {
  const [v, setV] = useState(10000)
  const [hits, setHits] = useState(0)
  const br = resaleBreakdown(v)
  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(62,134,255,.18),transparent)]" />
      <Container className="relative">
        <Reveal className="text-center">
          <Eyebrow>Try it</Eyebrow>
          <H2 className="mx-auto mt-4 max-w-[14ch]">Push the price. Feel the rule.</H2>
          <Lead className="mx-auto mt-5 text-center">Drag the slider past $110. The ticket won’t let you.</Lead>
        </Reveal>
        <Reveal delay={0.1} className="mx-auto mt-14 max-w-[880px]">
          <div className="rounded-[36px] bg-ink-2 p-6 sm:p-10 hairline">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[14px] text-fg-3">Maya’s resale price</div>
                <div className="text-[clamp(64px,10vw,112px)] leading-none font-bold tracking-[-0.055em] tabular">{usd(v)}</div>
              </div>
              <AnimatePresence mode="wait">
                {hits > 0 && v >= 11000 ? (
                  <motion.div key={hits} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={spring.wall} className="flex items-center gap-2 pb-3 text-[20px] font-bold text-accent-soft">
                    <ShieldCheck size={24} className="text-accent" /> This ticket knows the rules.
                  </motion.div>
                ) : (
                  <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-3 text-[15px] text-fg-3">
                    Face value $100 · cap $110
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="mt-10">
              <CapSlider faceCents={10000} capCents={11000} minCents={8000} maxCents={14000} value={v} onChange={setV} onHitCap={() => setHits((h) => h + 1)} />
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Tile k="Maya receives" v={br.seller} accent />
              <Tile k="Artist · 5%" v={br.royalty} />
              <Tile k="FairSeat · 3%" v={br.fee} />
              <Tile k="Buyer pays" v={br.buyerTotal} />
            </div>
            <p className="mt-6 text-center text-[14px] text-fg-3">All in one step: if any rule fails, not a single dollar moves.</p>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
function Tile({ k, v, accent }: { k: string; v: number; accent?: boolean }) {
  return (
    <div className={`rounded-[20px] p-4 ${accent ? 'bg-accent/15 ring-1 ring-accent/40' : 'bg-white/[0.04]'}`}>
      <div className={`text-[13px] ${accent ? 'text-accent-soft' : 'text-fg-3'}`}>{k}</div>
      <div className="mt-1 text-[30px] leading-none font-bold tracking-[-0.035em]">
        <NumberTicker value={v} format={money} duration={0.4} />
      </div>
    </div>
  )
}

/* ───────── 8 · For everyone ───────── */
type Aud = 'fans' | 'artists' | 'organizers'
const AUD: Record<Aud, { h: string; items: [string, string][] }> = {
  fans: {
    h: 'Compete with people, not bots.',
    items: [
      ['Fair shot', 'Verified once, 4 tickets max, fair draws when demand explodes.'],
      ['No rip-offs', 'Resale never above 110%. The $400 ticket doesn’t exist here.'],
      ['Get your money back', 'Can’t go? Resell in one tap and recover what you paid.'],
      ['Can’t be faked', 'A code that changes every few seconds and only works for you.'],
    ],
  },
  artists: {
    h: 'Get paid twice. Protect your fans.',
    items: [
      ['5% of every resale', 'New money that today goes to brokers and resale sites.'],
      ['Your price holds', 'The price you set is the price fans actually pay.'],
      ['Real fans up front', 'Badges reward the people who show up, show after show.'],
      ['Your name, protected', 'No more headlines about $1,000 tickets to your show.'],
    ],
  },
  organizers: {
    h: 'Real demand. Less fraud. Laws enforced.',
    items: [
      ['Real data', 'Know who actually attends and the true waitlist by zone.'],
      ['Less fraud at the door', 'No fake or duplicated tickets. Offline-ready scanners.'],
      ['Fewer complaints', 'No angry fans over prices you never set.'],
      ['Compliance, automatic', 'Resale rules per jurisdiction, provable to any regulator.'],
    ],
  },
}
export function Audiences() {
  const [a, setA] = useState<Aud>('fans')
  return (
    <section className="bg-paper py-28 text-paper-ink sm:py-36">
      <Container>
        <Reveal>
          <Eyebrow light>For everyone</Eyebrow>
          <H2 className="mt-4 max-w-[16ch]">Good for the people who make the show.</H2>
        </Reveal>
        <Reveal delay={0.1} className="mt-12 max-w-[520px]">
          <Segmented<Aud>
            tone="light"
            size="lg"
            value={a}
            onChange={setA}
            options={[
              { value: 'fans', label: 'Fans' },
              { value: 'artists', label: 'Artists' },
              { value: 'organizers', label: 'Organizers' },
            ]}
          />
        </Reveal>
        <AnimatePresence mode="wait">
          <motion.div key={a} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="mt-10">
            <div className="text-[clamp(28px,3.4vw,44px)] leading-[1.05] font-bold tracking-[-0.035em]">{AUD[a].h}</div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {AUD[a].items.map(([t, d]) => (
                <div key={t} className="rounded-[24px] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,.04),0_20px_40px_-30px_rgba(0,0,0,.25)]">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-accent-on-light/10 text-accent-on-light">
                    <Check size={18} strokeWidth={2.6} />
                  </div>
                  <div className="mt-4 text-[19px] font-semibold tracking-[-0.02em]">{t}</div>
                  <div className="mt-1.5 text-[15px] leading-snug text-paper-mute">{d}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </Container>
    </section>
  )
}

/* ───────── 9 · Why blockchain ───────── */
type Cell = 'yes' | 'no' | 'part' | string
const ROWS: [string, Cell, Cell, Cell][] = [
  ['Price cap', 'no', 'yes', 'yes'],
  ['Royalty to the artist', 'no', 'part', 'Automatic'],
  ['Who controls the rules?', 'The platform', 'The platform', 'The code. Nobody can change it quietly'],
  ['Auditable from outside', 'no', 'no', 'Publicly'],
  ['Works across platforms', 'no', 'no', 'Any compatible market'],
  ['Fan history you own', 'no', 'no', 'yes'],
  ['Experience for the fan', 'Simple', 'Simple', 'Just as simple. Crypto stays invisible'],
]
export function WhyBlockchain() {
  return (
    <section id="why" className="py-28 sm:py-36">
      <Container>
        <Reveal>
          <Eyebrow>Why blockchain?</Eyebrow>
          <H2 className="mt-4 max-w-[17ch]">Couldn’t a normal database do this?</H2>
          <Lead className="mt-5">Partly, and some apps already cap prices. But in a database, the rules belong to whoever owns the database. On-chain, the rules travel with the ticket.</Lead>
        </Reveal>
        <Reveal delay={0.1} className="mt-12 flex flex-col gap-3 sm:hidden">
          {ROWS.map(([k, a, b, c]) => (
            <div key={k} className="rounded-[20px] bg-ink-2 p-4 hairline">
              <div className="text-[16px] font-semibold">{k}</div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[13px] leading-snug">
                {[
                  ['Resale sites', a],
                  ['Closed apps', b],
                  ['FairSeat', c],
                ].map(([h, v], j) => (
                  <div key={h} className={`rounded-[12px] p-2.5 ${j === 2 ? 'bg-accent/[0.14] text-fg' : 'bg-white/[0.04] text-fg-2'}`}>
                    <div className={`mb-1.5 text-[11px] font-semibold ${j === 2 ? 'text-accent-soft' : 'text-fg-3'}`}>{h}</div>
                    <CellV c={v} fs={j === 2} compact />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Reveal>
        <Reveal delay={0.1} className="mt-14 hidden sm:block">
          <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
            <div className="grid min-w-[760px] grid-cols-[1.25fr_1fr_1fr_1.25fr] overflow-hidden rounded-[28px] hairline">
              <Head>{''}</Head>
              <Head>
                Traditional resale
                <small>e.g. StubHub, Vivid Seats</small>
              </Head>
              <Head>
                Closed fair resale
                <small>e.g. Dice, Tixel, Ticketmaster UK</small>
              </Head>
              <Head fs>
                FairSeat
                <small>Rules inside the ticket</small>
              </Head>
              {ROWS.map(([k, a, b, c], i) => (
                <Row key={k} k={k} cells={[a, b, c]} i={i} />
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.15} className="mt-14">
          <blockquote className="mx-auto max-w-[24ch] text-center text-[clamp(28px,3.6vw,46px)] leading-[1.1] font-bold tracking-[-0.035em]">
            “We don’t use blockchain to sell tickets. We use it so that <span className="text-gradient-accent">nobody, not even us,</span> can break the rules.”
          </blockquote>
        </Reveal>
      </Container>
    </section>
  )
}
function Head({ children, fs }: { children: React.ReactNode; fs?: boolean }) {
  return (
    <div className={`flex flex-col justify-end gap-1 px-5 pt-6 pb-4 text-[17px] font-semibold tracking-[-0.015em] [&>small]:text-[12px] [&>small]:font-normal [&>small]:text-fg-3 ${fs ? 'bg-accent/[0.14] text-accent-soft' : 'bg-ink-2'}`}>
      {children}
    </div>
  )
}
function Row({ k, cells, i }: { k: string; cells: Cell[]; i: number }) {
  return (
    <>
      <div className="border-t border-white/[0.07] bg-ink-2 px-5 py-4 text-[15px] font-semibold">{k}</div>
      {cells.map((c, j) => (
        <motion.div
          key={j}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 * i + (j === 2 ? 0.15 : 0) }}
          className={`flex items-center border-t px-5 py-4 text-[15px] ${j === 2 ? 'border-accent/20 bg-accent/[0.08] font-semibold text-fg' : 'border-white/[0.07] bg-ink-2 text-fg-2'}`}
        >
          <CellV c={c} fs={j === 2} />
        </motion.div>
      ))}
    </>
  )
}
function CellV({ c, fs, compact }: { c: Cell; fs: boolean; compact?: boolean }) {
  if (c === 'yes')
    return (
      <span className={`grid h-7 w-7 place-items-center rounded-full ${fs ? 'bg-accent-fill text-white' : 'bg-ok/15 text-ok'}`}>
        <Check size={16} strokeWidth={3} />
      </span>
    )
  if (c === 'no')
    return (
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.06] text-fg-3">
        <X size={15} strokeWidth={2.6} />
      </span>
    )
  if (c === 'part')
    return (
      <span className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-warn/15 text-warn">
          <Minus size={15} strokeWidth={3} />
        </span>
        Depends
      </span>
    )
  return (
    <span className="flex items-center gap-2">
      {fs && !compact && (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-fill text-white">
          <Check size={16} strokeWidth={3} />
        </span>
      )}
      {c}
    </span>
  )
}

/* ───────── 10 · Business model ───────── */
export function Business() {
  const [v, setV] = useState(FESTIVAL_DEFAULTS)
  const f = festival(v)
  const set = (k: keyof typeof v, x: number) =>
    setV((o) => {
      const n = { ...o, [k]: x }
      const cap = Math.floor(n.price * 1.1)
      if (n.avgResale > cap) n.avgResale = cap
      if (n.avgResale < Math.ceil(n.price * 0.8)) n.avgResale = Math.ceil(n.price * 0.8)
      return n
    })
  const dollars = (n: number) => usd(Math.round(n) * 100, { cents: false })
  return (
    <section id="business" className="bg-paper py-28 text-paper-ink sm:py-36">
      <Container>
        <Reveal>
          <Eyebrow light>Business model</Eyebrow>
          <H2 className="mt-4 max-w-[16ch]">We earn on volume, not on markups.</H2>
          <Lead light className="mt-5">
            $1.50 per ticket, paid by the organizer. 3% on each resale, paid by the buyer. Here’s a 50,000-person festival.
          </Lead>
        </Reveal>
        <Reveal delay={0.1} className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] bg-white p-7 shadow-[0_20px_40px_-30px_rgba(0,0,0,.3)] sm:col-span-2">
              <div className="text-[14px] font-semibold text-accent-on-light">FairSeat revenue</div>
              <div className="mt-1 text-[clamp(56px,7vw,88px)] leading-none font-bold tracking-[-0.055em]">
                <NumberTicker value={f.revenue} format={dollars} duration={0.6} />
              </div>
              <div className="mt-2 text-[15px] text-paper-mute">
                {dollars(f.primaryFee)} primary + {dollars(f.resaleFee)} resale
              </div>
            </div>
            <div className="rounded-[28px] bg-white p-7 shadow-[0_20px_40px_-30px_rgba(0,0,0,.3)]">
              <div className="text-[14px] font-semibold text-[#9a6b0f]">New royalties for the artist</div>
              <div className="mt-1 text-[44px] leading-none font-bold tracking-[-0.045em]">
                <NumberTicker value={f.royalties} format={dollars} duration={0.6} />
              </div>
              <div className="mt-2 text-[14px] text-paper-mute">Money that today goes to middlemen</div>
            </div>
            <div className="rounded-[28px] bg-white p-7 shadow-[0_20px_40px_-30px_rgba(0,0,0,.3)]">
              <div className="text-[14px] font-semibold text-paper-mute">Blockchain cost</div>
              <div className="mt-1 text-[44px] leading-none font-bold tracking-[-0.045em]">
                ≈ <NumberTicker value={f.chainCost} format={dollars} duration={0.6} />
              </div>
              <div className="mt-2 text-[14px] text-paper-mute">{int(f.ops)} operations × ≈ $0.01</div>
            </div>
          </div>
          <div className="flex flex-col gap-6 rounded-[28px] bg-white p-7 shadow-[0_20px_40px_-30px_rgba(0,0,0,.3)]">
            <Range tone="light" label="Capacity" value={v.capacity} min={5000} max={100000} step={5000} onChange={(x) => set('capacity', x)} format={(x) => int(x)} />
            <Range tone="light" label="Ticket price" value={v.price} min={40} max={300} step={5} onChange={(x) => set('price', x)} format={(x) => `$${x}`} />
            <Range tone="light" label="Share resold" value={v.resoldPct} min={0} max={40} onChange={(x) => set('resoldPct', x)} format={(x) => `${x}%`} />
            <Range
              tone="light"
              label="Average resale price"
              value={v.avgResale}
              min={Math.ceil(v.price * 0.8)}
              max={Math.floor(v.price * 1.1)}
              onChange={(x) => set('avgResale', x)}
              format={(x) => `$${x}`}
              hint={`Can’t go above the cap: $${Math.floor(v.price * 1.1)}`}
            />
            <div className="mt-auto rounded-[16px] bg-paper p-4 text-[13px] leading-snug text-paper-mute">
              <b className="text-paper-ink">Illustrative hypothesis.</b> Defaults: 50,000 tickets at $150, 20% resold at an average of $160. The technology is the cheap part.
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
