import { motion } from 'motion/react'
import { Ban, CircleDollarSign, CircleCheck } from 'lucide-react'
import { Card, Container, Reveal, Section, SlideHead, Sources } from './ui'

/* ───────── Slide 11 · Business model: following the $105 ───────── */
const SPLIT = [
  { k: 'Seller keeps', v: '$100.80', w: 76, c: 'bg-deck-blue' },
  { k: 'Platform', v: '$2.10', w: 12, c: 'bg-deck-slate' },
  { k: 'Artist', v: '$2.10', w: 12, c: 'bg-deck-teal' },
]
export function Following105() {
  const cards = [
    { icon: CircleDollarSign, t: 'How we earn', d: 'A 1% fee on primary sales and a 2% fee on resales, paid by the seller.', tone: 'bg-deck-blue/10 text-deck-blue' },
    { icon: Ban, t: 'No platform token', d: 'A ticketing app doesn’t need one, and FTX’s FTT showed the risk.', tone: 'bg-deck-red/10 text-deck-red' },
    { icon: CircleCheck, t: 'Who wins', d: 'Fans pay the same or less. Artists gain a new revenue stream. Brokers lose the markup.', tone: 'bg-deck-green/12 text-deck-green-ink' },
  ]
  return (
    <Section id="business">
      <Container>
        <SlideHead kicker="Part 4 · Business model" title="Business Model: Following the $105" sub="A $100 ticket resold at the $105 cap, with a 2% resale fee and 2% artist royalty." />
        <Reveal delay={0.1} className="mt-12">
          <div className="flex h-[92px] gap-[3px] overflow-hidden rounded-[18px] sm:h-[104px]">
            {SPLIT.map((s, i) => (
              <motion.div
                key={s.k}
                className={`${s.c} flex min-w-0 flex-col justify-center px-3 text-white sm:px-5`}
                initial={{ flexGrow: 0.001, opacity: 0.4 }}
                whileInView={{ flexGrow: s.w, opacity: 1 }}
                viewport={{ once: true, margin: '-15% 0px' }}
                transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{ flexBasis: 0 }}
              >
                <div className={`truncate text-[11px] font-bold tracking-[0.12em] text-white/80 uppercase ${i ? 'hidden sm:block' : ''}`}>{s.k}</div>
                <div className={`truncate text-[clamp(18px,2.6vw,30px)] font-bold tracking-[-0.03em] tabular ${i ? 'hidden sm:block' : ''}`}>{s.v}</div>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden">
            {SPLIT.map((s) => (
              <div key={s.k} className="flex items-start gap-1.5">
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${s.c}`} />
                <span>
                  <span className="block text-[11px] font-semibold tracking-[0.06em] text-deck-mute uppercase">{s.k}</span>
                  <span className="block text-[17px] font-bold tabular">{s.v}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[13px] text-deck-mute">Gas for the transfer: under one cent, paid by the platform out of its fee. Bar not to scale.</div>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.t} delay={0.1 + i * 0.08}>
              <Card className="h-full">
                <span className={`grid h-11 w-11 place-items-center rounded-[13px] ${c.tone}`}>
                  <c.icon size={20} />
                </span>
                <div className="mt-5 text-[19px] font-semibold tracking-[-0.02em]">{c.t}</div>
                <div className="mt-1.5 text-[15px] leading-snug text-deck-slate">{c.d}</div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}

/* ───────── Slide 12 · Who buys in, and why ───────── */
const BUYERS = [
  { who: 'Fans', why: 'Pay face value, or at most 5% more, and can still sell a ticket they can’t use.', tag: 'Already asking for it', ev: 'The fan video we opened with; average Eras resale up 2,321% since the Reputation Tour.' },
  { who: 'Artists', why: '2% of every resale, plus proof of attendance to reward real fans at the next presale.', tag: 'Already asking for it', ev: 'Ticketmaster built an opt-in Face Value Exchange in 2019; Olivia Dean capped resale on her tour.' },
  { who: 'Venues', why: 'No fake or duplicate tickets at the door, for a 1% fee.', tag: 'Where we start', ev: 'Independent venues that aren’t locked into Ticketmaster and Live Nation contracts.' },
  { who: 'Regulators', why: 'A cap that enforces itself, set per market: 100% where the law requires face value.', tag: 'Already moving', ev: 'The UK announced a ban on resale above face value (Nov 2025). The FTC sued Live Nation and Ticketmaster over broker resale (Sept 2025).' },
]
export function BuyIn() {
  return (
    <Section id="buyin" tone="gray">
      <Container>
        <SlideHead kicker="Part 4 · Buy-in" title="Who Buys In, and Why" sub="Everyone at the table comes out ahead except the broker." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BUYERS.map((b, i) => (
            <Reveal key={b.who} delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-[24px] border border-deck-line bg-white p-6">
                <div className="text-[22px] font-semibold tracking-[-0.02em] text-deck-blue-ink">{b.who}</div>
                <div className="mt-3 text-[15px] leading-snug text-deck-slate">{b.why}</div>
                <div className="mt-auto pt-6">
                  <div className="border-t border-deck-line pt-4 text-[11px] font-bold tracking-[0.14em] text-deck-green-ink uppercase">{b.tag}</div>
                  <div className="mt-2 text-[13px] leading-snug text-deck-mute">{b.ev}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-4">
          <div className="flex items-center gap-3 rounded-[18px] border border-deck-red/20 bg-[#fdecec] px-5 py-4 text-[15px] font-medium text-[#9f2328]">
            <Ban size={18} className="shrink-0" /> Who loses: brokers, and resale platforms that earn fees on the markup.
          </div>
        </Reveal>
        <Sources>Sources: Ticketmaster; Live Nation (Olivia Dean); UK DCMS press release, 19 Nov 2025; FTC v. Live Nation, 18 Sept 2025.</Sources>
      </Container>
    </Section>
  )
}

/* ───────── Slide 13 · Risks and our answers ───────── */
const RISKS = [
  ['Side deals and account selling', 'One account per verified ID, and names checked against ID at the door.'],
  ['Custody: we hold the keys', 'A hack would hit every fan at once (Celsius, FTX), so keys sit in multisig custody.'],
  ['Adoption', 'Big venues are locked into Ticketmaster and Live Nation, so we pilot with independents.'],
  ['Regulation', 'New York has required a resell-at-any-price option, so the pilot starts elsewhere.'],
  ['Smart contract bugs', 'A flaw could lock or leak tickets (DAO hack, Parity bug), so we pay for an audit.'],
  ['NFT reputation after 2022', 'Market them as “digital tickets”; the word NFT stays out of the app.'],
]
export function Risks() {
  return (
    <Section id="risks">
      <Container>
        <SlideHead kicker="Part 4 · Risks" title="Risks and Our Answers" sub="What could go wrong, and what we’d do about it." />
        <div className="mt-12 grid gap-3 md:grid-cols-2">
          {RISKS.map(([r, a], i) => (
            <Reveal key={r} delay={(i % 2) * 0.08 + Math.floor(i / 2) * 0.06}>
              <div className="flex h-full items-start gap-4 rounded-[22px] border border-deck-line bg-deck-bg p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fff4e0] text-[13px] font-bold text-deck-amber tabular">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div className="text-[17px] font-semibold tracking-[-0.015em]">{r}</div>
                  <div className="mt-1 text-[15px] leading-snug text-deck-slate">
                    <span className="text-deck-blue-ink">→</span> {a}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
