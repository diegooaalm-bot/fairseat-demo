import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Ban, Check, Coins, ShieldCheck, Trophy, X } from 'lucide-react'
import { CapSlider } from '@/components/ui/CapSlider'
import { MoneySplit } from '@/components/ui/MoneySplit'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { Range } from '@/components/ui/Range'
import { int, usd } from '@/lib/money'
import { spring } from '@/lib/motion'
import { FESTIVAL_DEFAULTS, festival, resaleBreakdown } from '@/lib/rules'
import { Container, Eyebrow, H2, Lead, Reveal } from '../ui'

const money = (n: number) => usd(Math.round(n))

/* ───────── Why a blockchain, not a database? (slide 11) ───────── */
const ROWS: [string, string, string][] = [
  ['Who sets the rules', 'The ticketing company, and it can change them', 'The smart contract; no single company controls it'],
  ['Who can verify a ticket', 'Only the company', 'Anyone: fan, venue, artist, other marketplaces'],
  ['Resale price cap', 'Optional, a business decision', 'Enforced on every transfer: max 105%'],
  ['Artist royalty', 'None on most resale sites', '2% of face value, paid automatically'],
]
export function WhyBlockchain() {
  return (
    <section id="why" className="py-28 sm:py-36">
      <Container>
        <Reveal>
          <Eyebrow>Why a blockchain?</Eyebrow>
          <H2 className="mt-4 max-w-[17ch]">Why a blockchain, not a database?</H2>
          <Lead className="mt-5">Ticketmaster could cap prices on its own system. Here’s what it can’t offer: nobody has to trust a company to keep doing it.</Lead>
        </Reveal>
        <Reveal delay={0.1} className="mt-12 flex flex-col gap-3 sm:hidden">
          {ROWS.map(([k, a, b]) => (
            <div key={k} className="rounded-[20px] bg-ink-2 p-4 hairline">
              <div className="text-[16px] font-semibold">{k}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] leading-snug">
                <div className="rounded-[12px] bg-white/[0.04] p-2.5 text-fg-2">
                  <div className="mb-1 text-[11px] font-semibold text-fg-3">Today: one company</div>
                  {a}
                </div>
                <div className="rounded-[12px] bg-accent/[0.14] p-2.5 text-fg">
                  <div className="mb-1 text-[11px] font-semibold text-accent-soft">Proof of Seat</div>
                  {b}
                </div>
              </div>
            </div>
          ))}
        </Reveal>
        <Reveal delay={0.1} className="mt-14 hidden sm:block">
          <div className="grid grid-cols-[1fr_1.3fr_1.4fr] overflow-hidden rounded-[28px] hairline">
            <Head>{''}</Head>
            <Head>
              Today
              <small>One company’s database</small>
            </Head>
            <Head fs>
              Proof of Seat
              <small>A public blockchain</small>
            </Head>
            {ROWS.map(([k, a, b], i) => (
              <Row key={k} k={k} a={a} b={b} i={i} />
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.15} className="mt-8">
          <p className="max-w-[78ch] text-[15px] leading-relaxed text-fg-3">
            Ticketmaster already uses rotating barcodes (SafeTix), and its Flow NFTs (since 2022) are collectibles on top of a normal ticket. Our difference: the token <i>is</i> the ticket, the cap and royalty are enforced, and anyone
            can check the record.
          </p>
        </Reveal>
        <Reveal delay={0.2} className="mt-14">
          <blockquote className="mx-auto max-w-[24ch] text-center text-[clamp(28px,3.6vw,46px)] leading-[1.1] font-bold tracking-[-0.035em]">
            “It’s not that a database can’t cap prices. It’s that <span className="text-gradient-accent">nobody has to trust us</span> to keep doing it.”
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
function Row({ k, a, b, i }: { k: string; a: string; b: string; i: number }) {
  return (
    <>
      <div className="border-t border-white/[0.07] bg-ink-2 px-5 py-4 text-[15px] font-semibold">{k}</div>
      <div className="flex items-center gap-2.5 border-t border-white/[0.07] bg-ink-2 px-5 py-4 text-[15px] text-fg-2">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/[0.06] text-fg-3">
          <X size={13} strokeWidth={2.6} />
        </span>
        {a}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 * i + 0.15 }}
        className="flex items-center gap-2.5 border-t border-accent/20 bg-accent/[0.08] px-5 py-4 text-[15px] font-semibold text-fg"
      >
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-fill text-white">
          <Check size={14} strokeWidth={3} />
        </span>
        {b}
      </motion.div>
    </>
  )
}

/* ───────── The rules written into the contract (slide 14) + try it ───────── */
export function Rules() {
  const [v, setV] = useState(10300)
  const [hits, setHits] = useState(0)
  const br = resaleBreakdown(v, 10000)
  const rules = [
    ['105%', 'Resale cap', 'Max resale price. A $100 ticket can’t sell above $105.'],
    ['2%', 'Royalty', 'Of face value, on every resale, to the artist’s address, automatically.'],
    ['1', 'Marketplace', 'Tokens only move through our official marketplace contract.'],
    ['4', 'Ticket limit', 'Tickets per verified person, per event, to stop bots.'],
  ]
  return (
    <section id="rules" className="relative overflow-hidden py-28 sm:py-36">
      <div className="pointer-events-none absolute top-[60%] left-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(62,134,255,.16),transparent)]" />
      <Container className="relative">
        <Reveal>
          <Eyebrow>The rules written into the contract</Eyebrow>
          <H2 className="mt-4 max-w-[17ch]">Enforced on every transfer.</H2>
          <Lead className="mt-5">Whether or not a reseller wants to follow them.</Lead>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rules.map(([n, k, d], i) => (
            <Reveal key={k} delay={i * 0.08}>
              <div className="h-full rounded-[24px] bg-ink-2 p-6 hairline">
                <div className="text-[13px] font-semibold tracking-[0.08em] text-accent-soft uppercase">{k}</div>
                <div className="mt-2 text-[64px] leading-none font-bold tracking-[-0.05em]">{n}</div>
                <div className="mt-3 text-[15px] leading-snug text-fg-2">{d}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1} className="mt-6">
          <div className="flex items-center gap-3 rounded-[20px] bg-accent/[0.12] px-5 py-4 text-[17px] font-semibold hairline">
            <ShieldCheck size={22} className="shrink-0 text-accent-soft" />A sale above the cap isn’t against the rules. It’s impossible: the contract rejects the transaction.
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-16 max-w-[880px]">
          <div className="text-center">
            <div className="text-[22px] font-semibold tracking-[-0.02em]">Try it: push the price past $105.</div>
            <div className="mt-1 text-[15px] text-fg-3">Maya’s $100 ticket. The ticket won’t let you.</div>
          </div>
          <div className="mt-6 rounded-[36px] bg-ink-2 p-6 sm:p-10 hairline">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[14px] text-fg-3">Maya’s resale price</div>
                <div className="text-[clamp(64px,10vw,112px)] leading-none font-bold tracking-[-0.055em] tabular">{usd(v)}</div>
              </div>
              <AnimatePresence mode="wait">
                {hits > 0 && v >= 10500 ? (
                  <motion.div key={hits} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={spring.wall} className="flex items-center gap-2 pb-3 text-[20px] font-bold text-accent-soft">
                    <ShieldCheck size={24} className="text-accent" /> Rejected by the contract.
                  </motion.div>
                ) : (
                  <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-3 text-[15px] text-fg-3">
                    Face value $100 · cap $105
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="mt-10">
              <CapSlider faceCents={10000} capCents={10500} minCents={8500} maxCents={12500} value={v} onChange={setV} onHitCap={() => setHits((h) => h + 1)} />
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Tile k="Ben pays, all-in" v={br.buyerTotal} />
              <Tile k="Maya keeps" v={br.seller} accent />
              <Tile k="Artist · 2% of face" v={br.royalty} />
              <Tile k="Proof of Seat · 1%" v={br.fee} />
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

/* ───────── Business model: following the $105 (slide 15) ───────── */
export function Business() {
  const [v, setV] = useState(FESTIVAL_DEFAULTS)
  const f = festival(v)
  const set = (k: keyof typeof v, x: number) => setV((o) => ({ ...o, [k]: x }))
  const dollars = (n: number) => usd(Math.round(n) * 100, { cents: false })
  const cards = [
    { icon: Coins, t: 'How we earn', d: '$1.50 per ticket sold, paid by the organizer, and 1% of face value on every resale. Gas for each transfer costs under one cent and comes out of our fee.' },
    { icon: Ban, t: 'No platform token', d: 'A ticketing app doesn’t need one, and FTX’s FTT showed the risk.' },
    { icon: Trophy, t: 'Who wins', d: 'Fans pay the same or less. Artists gain a new revenue stream. Brokers lose the markup.' },
  ]
  return (
    <section id="business" className="bg-paper py-28 text-paper-ink sm:py-36">
      <Container>
        <Reveal>
          <Eyebrow light>Part 4 · Business model</Eyebrow>
          <H2 className="mt-4 max-w-[16ch]">Following the $105.</H2>
          <Lead light className="mt-5">
            A $100 ticket resold at the $105 cap. The 5% above face value is split three ways.
          </Lead>
        </Reveal>
        <Reveal delay={0.1} className="mt-12">
          <div className="rounded-[28px] bg-ink p-6 text-fg sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-[20px] font-semibold tracking-[-0.02em]">The buyer pays $105.00, all-in</div>
              <div className="text-[14px] text-fg-3">Seller keeps face value + 2% · artist 2% · platform 1%</div>
            </div>
            <MoneySplit className="mt-5" priceCents={10500} faceCents={10000} artist="Artist" seller="Seller keeps" />
          </div>
        </Reveal>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.t} delay={0.1 + i * 0.08}>
              <div className="h-full rounded-[24px] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,.04),0_20px_40px_-30px_rgba(0,0,0,.25)]">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-on-light/10 text-accent-on-light">
                  <c.icon size={19} />
                </span>
                <div className="mt-4 text-[19px] font-semibold tracking-[-0.02em]">{c.t}</div>
                <div className="mt-1.5 text-[15px] leading-snug text-paper-mute">{c.d}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1} className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] bg-white p-7 shadow-[0_20px_40px_-30px_rgba(0,0,0,.3)] sm:col-span-2">
              <div className="text-[14px] font-semibold text-accent-on-light">Proof of Seat revenue · one pilot venue, one year</div>
              <div className="mt-1 text-[clamp(56px,7vw,88px)] leading-none font-bold tracking-[-0.055em]">
                <NumberTicker value={f.revenue} format={dollars} duration={0.6} />
              </div>
              <div className="mt-2 text-[15px] text-paper-mute">
                {dollars(f.primaryFee)} primary + {dollars(f.resaleFee)} resale
              </div>
            </div>
            <div className="rounded-[28px] bg-white p-7 shadow-[0_20px_40px_-30px_rgba(0,0,0,.3)]">
              <div className="text-[14px] font-semibold text-[#9a6b0f]">New royalties for artists</div>
              <div className="mt-1 text-[44px] leading-none font-bold tracking-[-0.045em]">
                <NumberTicker value={f.royalties} format={dollars} duration={0.6} />
              </div>
              <div className="mt-2 text-[14px] text-paper-mute">Money that today goes to brokers</div>
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
            <Range tone="light" label="Tickets sold per year" value={v.capacity} min={5000} max={150000} step={5000} onChange={(x) => set('capacity', x)} format={(x) => int(x)} />
            <Range tone="light" label="Average face value" value={v.price} min={20} max={200} step={5} onChange={(x) => set('price', x)} format={(x) => `$${x}`} />
            <Range tone="light" label="Share resold" value={v.resoldPct} min={0} max={40} onChange={(x) => set('resoldPct', x)} format={(x) => `${x}%`} />
            <div className="mt-auto rounded-[16px] bg-paper p-4 text-[13px] leading-snug text-paper-mute">
              <b className="text-paper-ink">Illustrative hypothesis.</b> Defaults: a mid-size venue’s year, 50,000 tickets at $60 on average, 15% resold. The technology is the cheap part.
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

/* ───────── Risks and our answers (slide 16) ───────── */
const RISKS: [string, string][] = [
  ['Side deals and account selling', 'ID check at the door; one account per verified identity.'],
  ['Custody: we hold the keys', 'A hack would hurt every fan at once (Celsius, FTX). Keys stay with an audited custody provider, with account recovery through email and the ID check.'],
  ['Adoption', 'Big venues are locked into Ticketmaster and Live Nation, so we pilot with independents.'],
  ['Regulation', 'Some states protect the right to resell at any price (New York, Colorado). There, the ticket stays transferable; on our market the cap still applies.'],
  ['Smart contract bugs', 'A flaw could lock or leak tickets (the DAO hack, the Parity bug), so we pay for an audit.'],
  ['NFT reputation after 2022', 'Market them as “digital tickets”; the word NFT stays out of the app.'],
]
export function Risks() {
  return (
    <section id="risks" className="py-28 sm:py-36">
      <Container>
        <Reveal>
          <Eyebrow>Risks</Eyebrow>
          <H2 className="mt-4 max-w-[16ch]">Risks and our answers.</H2>
          <Lead className="mt-5">What could go wrong, and what we’d do about it.</Lead>
        </Reveal>
        <div className="mt-12 overflow-hidden rounded-[28px] hairline">
          {RISKS.map(([r, a], i) => (
            <Reveal key={r} delay={i * 0.04}>
              <div className={`grid gap-1 bg-ink-2 px-5 py-4 sm:grid-cols-[0.8fr_1.6fr] sm:gap-6 sm:px-6 ${i ? 'border-t border-white/[0.07]' : ''}`}>
                <div className="text-[16px] font-semibold">{r}</div>
                <div className="text-[15px] leading-snug text-fg-2">{a}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ───────── Pilot plan (slide 17) ───────── */
export function Pilot() {
  const phases = [
    ['Phase 1', 'Pilot', 'One mid-size venue or an independent artist, like the shows in our demo.'],
    ['Phase 2', 'Measure', 'Resale prices, fraud at the door, artist royalties paid, fan sign-up time.'],
    ['Phase 3', 'Scale', 'Expand to more venues, then pitch larger tours with results in hand.'],
  ]
  return (
    <section id="pilot" className="bg-paper py-28 text-paper-ink sm:py-36">
      <Container>
        <Reveal>
          <Eyebrow light>Part 5 · Pilot</Eyebrow>
          <H2 className="mt-4 max-w-[16ch]">Start small, then scale.</H2>
          <Lead light className="mt-5">
            Prove it with one venue before taking on Ticketmaster’s contracts.
          </Lead>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {phases.map(([p, t, d], i) => (
            <Reveal key={p} delay={i * 0.1}>
              <div className="h-full rounded-[24px] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,.04),0_20px_40px_-30px_rgba(0,0,0,.25)]">
                <div className="text-[13px] font-semibold tracking-[0.08em] text-accent-on-light uppercase">{p}</div>
                <div className="mt-2 text-[28px] font-bold tracking-[-0.03em]">{t}</div>
                <div className="mt-2 text-[15px] leading-snug text-paper-mute">{d}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
