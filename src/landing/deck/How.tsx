import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import { CapSlider } from '@/components/ui/CapSlider'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { usd } from '@/lib/money'
import { spring } from '@/lib/motion'
import { resaleBreakdown } from '@/lib/rules'
import { Container, Reveal, Section, SlideHead, asset } from './ui'

/* ───────── Slide 9 · How it works ───────── */
const BLOCKS = [
  ['01', 'Network', 'Base, an Ethereum layer-2 rollup. Minting costs a fraction of a cent, and tickets inherit Ethereum’s security.'],
  ['02', 'Wallet', 'Created at sign-up with email and card. The app pays gas, so fans never hold crypto.'],
  ['03', 'Contract', 'ERC-721: one token per seat, storing seat, date and original price.'],
  ['04', 'Entry', 'A QR code signed by the fan’s wallet, refreshed every few seconds.'],
]
export function BuildingBlocks() {
  return (
    <Section id="how">
      <Container>
        <SlideHead kicker="Part 3 · How it works" title="How It Works" sub="Four building blocks, all invisible to the fan." />
        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="relative min-h-[320px] overflow-hidden rounded-[26px] bg-deck-ink">
            <motion.img
              src={asset('deck/network.webp')}
              alt="Illustration of a blockchain network linking a bank, a ticket and a shield"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ scale: 1.15 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            />
          </Reveal>
          <div className="flex flex-col gap-3">
            {BLOCKS.map(([n, k, d], i) => (
              <Reveal key={k} delay={i * 0.08}>
                <div className="grid grid-cols-[96px_1fr] items-center gap-4 rounded-[20px] border border-deck-line bg-deck-bg px-5 py-5 sm:grid-cols-[130px_1fr]">
                  <div>
                    <div className="text-[12px] font-semibold text-deck-blue-ink tabular">{n}</div>
                    <div className="text-[15px] font-bold tracking-[0.08em] uppercase">{k}</div>
                  </div>
                  <div className="text-[15px] leading-snug text-deck-slate">{d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}

/* ───────── Slide 10 · The rules written into the contract ───────── */
const RULES = [
  ['Resale cap', '105%', 'Max resale price. A $100 ticket can’t sell above $105.', 'text-deck-blue'],
  ['Royalty', '2%', 'Of face value, on every resale, to the artist’s address, automatically.', 'text-deck-teal'],
  ['Marketplace', 'Any', 'Any ticketing app can list it. Every sale settles through our contract, same rules.', 'text-deck-ink'],
  ['Ticket limit', '4', 'Tickets per verified person, per event, to stop bots.', 'text-deck-ink'],
]
export function ContractRules() {
  const [v, setV] = useState(10300)
  const [hits, setHits] = useState(0)
  const [rejected, setRejected] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const br = resaleBreakdown(v, 10000)
  const reject = () => {
    setHits((h) => h + 1)
    setRejected(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setRejected(false), 1800)
  }
  return (
    <Section id="rules" tone="gray">
      <Container>
        <SlideHead kicker="Part 3 · How it works" title="The Rules Written Into the Contract" sub="Enforced on every transfer, whether or not a reseller wants to follow them." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RULES.map(([k, n, d, c], i) => (
            <Reveal key={k} delay={i * 0.08}>
              <div className="h-full rounded-[24px] border border-deck-line bg-white p-6">
                <div className="text-[15px] font-semibold">{k}</div>
                <div className={`mt-4 text-[72px] leading-none font-bold tracking-[-0.05em] ${c}`}>{n}</div>
                <div className="mt-4 text-[15px] leading-snug text-deck-slate">{d}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-6">
          <div className="overflow-hidden rounded-[26px] bg-deck-ink text-white">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="text-[14px] text-white/60">Try it: a $100 ticket, push the price past $105</div>
                    <div className="mt-1 text-[clamp(56px,8vw,88px)] leading-none font-bold tracking-[-0.055em] tabular">{usd(v)}</div>
                  </div>
                  <div className="pb-2 text-[14px] text-white/60">face $100 · cap $105</div>
                </div>
                <div className="mt-8">
                  <CapSlider
                    faceCents={10000}
                    capCents={10500}
                    minCents={8500}
                    maxCents={12500}
                    value={v}
                    onChange={setV}
                    onHitCap={reject}
                  />
                </div>
                <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Tile k="Buyer pays, all-in" v={br.buyerTotal} />
                  <Tile k="Seller keeps" v={br.seller} c="text-[#8db8ff]" />
                  <Tile k="Artist · 2% of face" v={br.royalty} c="text-[#5fd6c2]" />
                  <Tile k="Platform · 1% of face" v={br.fee} />
                </div>
              </div>
              <div className="flex flex-col justify-center border-t border-white/10 bg-[#0a0c10] p-6 font-mono text-[13px] leading-[1.9] sm:p-8 lg:border-t-0 lg:border-l">
                <div>
                  <span className="text-[#c792ea]">require</span>
                  <span className="text-white/80">(price &lt;= faceValue * </span>
                  <span className="text-[#f78c6c]">105</span>
                  <span className="text-white/80"> / </span>
                  <span className="text-[#f78c6c]">100</span>
                  <span className="text-white/80">, </span>
                  <span className="text-[#c3e88d]">"above cap"</span>
                  <span className="text-white/80">);</span>
                </div>
                <div className="text-white/40">// a sale above the cap isn’t against the rules. It’s impossible.</div>
                <div className="mt-6 min-h-[44px]">
                  <AnimatePresence mode="wait">
                    {rejected ? (
                      <motion.div
                        key={`no-${hits}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45 }}
                        className="inline-flex rounded-[10px] border border-deck-red/50 bg-deck-red/15 px-3 py-2 text-[#ff8a8e]"
                      >
                        ✕ tx reverted: the contract rejects it
                      </motion.div>
                    ) : (
                      <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring.snappy} className="inline-flex rounded-[10px] border border-deck-green/40 bg-deck-green/15 px-3 py-2 text-[#7be39b]">
                        ✓ tx confirmed at {usd(v)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
const money = (n: number) => usd(Math.round(n))
function Tile({ k, v, c = 'text-white' }: { k: string; v: number; c?: string }) {
  return (
    <div className="rounded-[16px] bg-white/[0.06] p-3">
      <div className="text-[12px] text-white/60">{k}</div>
      <div className={`mt-1 text-[22px] leading-none font-bold tracking-[-0.03em] ${c}`}>
        <NumberTicker value={v} format={money} duration={0.4} />
      </div>
    </div>
  )
}
