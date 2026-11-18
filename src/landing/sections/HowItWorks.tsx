import { AnimatePresence, motion, useInView } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BadgeCheck, CloudOff, ShieldCheck } from 'lucide-react'
import { IPhoneFrame, FRAME_H, FRAME_W } from '@/components/device/IPhoneFrame'
import { CapSlider } from '@/components/ui/CapSlider'
import { FaceID } from '@/components/ui/FaceID'
import { DynamicQR } from '@/components/ticket/DynamicQR'
import { TicketCard } from '@/components/ticket/TicketCard'
import { usd } from '@/lib/money'
import { resaleBreakdown } from '@/lib/rules'
import { Medal } from '@/demo/roles/fan/Celebration'
import { useMedia } from '@/hooks/useMedia'
import { Container, Eyebrow, H2, Reveal } from '../ui'

const STEPS = [
  { n: 'Buy', today: 'Bots clear the sale in minutes.', t: 'One verified ID, a per-person limit.', d: 'Fans verify once and buy with a card. Up to 4 tickets per person per event, so bots and brokers can’t clear the sale.' },
  { n: 'Hold', today: 'A PDF or screenshot anyone can copy.', t: 'One token, in one wallet, at a time.', d: 'The ticket lives in the app like a boarding pass. It can only sit in one wallet, so it can’t be copied or sold twice.' },
  { n: 'Resell', today: 'Any price, and the artist gets $0.', t: 'Capped at 105%, 2% to the artist.', d: 'Can’t go? Sell it to a verified fan for up to $105 on a $100 ticket. The seller keeps $102, the artist gets $2 and Proof of Seat $1, in one all-or-nothing step.' },
  { n: 'Scan', today: 'The first copy through the door wins.', t: 'A rotating QR signed by the owner’s wallet.', d: 'The code changes every few seconds and only works on the owner’s phone. Screenshots and resold tickets fail, and the scanner works offline.' },
  { n: 'After', today: 'Your history belongs to the ticketing company.', t: 'Proof of attendance.', d: 'After the show, an “I was there” badge that can’t be sold. It earns early access to the next presale.' },
]

export function HowItWorks() {
  const [active, setActive] = useState(0)
  const desktop = useMedia('(min-width: 1024px)')
  return (
    <section id="how" className="relative py-28 sm:py-36">
      <Container>
        <Reveal>
          <Eyebrow>A ticket’s life</Eyebrow>
          <H2 className="mt-4 max-w-[16ch]">Today vs. on-chain.</H2>
          <p className="mt-5 max-w-[46ch] text-[clamp(17px,1.8vw,20px)] leading-[1.45] text-fg-2">
            Every step where trust breaks today, and the rule that replaces it. The blockchain is the shared record every step checks against, so no single company has to be trusted.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-10 lg:mt-20 lg:grid-cols-[1fr_auto] lg:gap-20">
          <div>
            {!desktop && (
              <div className="sticky top-[calc(env(safe-area-inset-top)+56px)] z-10 -mx-5 bg-[linear-gradient(180deg,var(--color-ink)_85%,transparent)] px-5 pt-3 pb-6">
                <StepPhone active={active} />
              </div>
            )}
            {STEPS.map((s, i) => (
              <Step key={s.n} i={i} active={active === i} onActive={setActive} desktop={desktop} {...s} />
            ))}
          </div>
          {desktop && (
            <div>
              <div className="sticky top-[calc(50svh-300px)]">
                <StepPhone active={active} />
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

function Step({ i, n, today, t, d, active, onActive, desktop }: { i: number; n: string; today: string; t: string; d: string; active: boolean; onActive: (i: number) => void; desktop: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  // on phones the sticky device covers the top half, so the reading line sits lower
  const inView = useInView(ref, { margin: desktop ? '-45% 0px -45% 0px' : '-62% 0px -30% 0px' })
  useEffect(() => {
    if (inView) onActive(i)
  }, [inView, i, onActive])
  return (
    <div ref={ref} className="flex min-h-[46svh] flex-col justify-center py-8 lg:min-h-[78svh]">
      <motion.div animate={{ opacity: active ? 1 : 0.28 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 text-[15px] font-semibold text-accent-soft">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/15 tabular">{i + 1}</span>
          {n}
        </div>
        <div className="mt-4 flex items-start gap-2 text-[16px] text-err">
          <span className="mt-0.5 shrink-0 rounded-full bg-err/15 px-2 py-0.5 text-[11px] font-bold tracking-[0.06em] uppercase">Today</span>
          <span className="line-through decoration-err/50">{today}</span>
        </div>
        <h3 className="mt-3 max-w-[18ch] text-[clamp(30px,3.6vw,48px)] leading-[1.02] font-bold tracking-[-0.04em]">{t}</h3>
        <p className="mt-4 max-w-[42ch] text-[18px] leading-[1.5] text-fg-2">{d}</p>
      </motion.div>
    </div>
  )
}

function StepPhone({ active }: { active: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.62)
  useEffect(() => {
    const f = () => setScale(window.innerWidth >= 1024 ? Math.min(0.68, (window.innerHeight - 140) / FRAME_H) : Math.min(0.42, (window.innerHeight * 0.4) / FRAME_H))
    f()
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  return (
    <div ref={ref} className="mx-auto" style={{ width: FRAME_W * scale, height: FRAME_H * scale }}>
      <div className="origin-top-left" style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${scale})` }}>
        <IPhoneFrame clock="6:18">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={active}
              className="absolute inset-0 bg-ink"
              initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <Scene i={active} />
            </motion.div>
          </AnimatePresence>
        </IPhoneFrame>
      </div>
    </div>
  )
}

function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col px-5" style={{ paddingTop: 'calc(var(--sat) + 16px)', paddingBottom: 'calc(var(--sab) + 16px)' }}>
      <div className="text-[30px] font-bold tracking-[-0.03em]">{title}</div>
      {children}
    </div>
  )
}

function Scene({ i }: { i: number }) {
  const [v, setV] = useState(9500)
  const [ok, setOk] = useState(false)
  useEffect(() => {
    if (i !== 0) return
    const t = setTimeout(() => setOk(true), 1300)
    return () => clearTimeout(t)
  }, [i])
  switch (i + 1) {
    case 1:
      return (
        <Frame title="Pay">
          <div className="mt-10 flex flex-1 flex-col items-center text-center">
            <div className="grid h-[150px] w-[150px] place-items-center rounded-[38px] bg-ink-3 hairline">
              <FaceID state={ok ? 'success' : 'scan'} size={86} />
            </div>
            <div className="mt-6 text-[24px] font-semibold">{ok ? 'You’re going.' : 'Face ID'}</div>
            <div className="mt-1 text-[15px] text-fg-3">Faye Webster · Sec M3 · Row 14 · Seat 7</div>
            <div className="mt-8 w-full rounded-[20px] bg-ink-3 p-4 text-left hairline">
              <Row k="1 ticket" v="$100.00" />
              <Row k="Service fee" v="$0.00" />
              <Row k="Total" v="$100.00" strong />
            </div>
            <div className="mt-4 flex items-center gap-2 text-[14px] font-semibold text-ok">
              <BadgeCheck size={16} /> Verified fan · 1 of 4 tickets
            </div>
          </div>
        </Frame>
      )
    case 2:
      return (
        <Frame title="My Tickets">
          <div className="mt-4">
            <TicketCard ticket={{ eventId: 'nova', section: 'M3', row: '14', seat: 7, faceCents: 10000, tokenId: 18169 }} />
          </div>
          <div className="mt-6 flex justify-center">
            <DynamicQR tokenId={18169} owner="0x7a3e19c0" size={190} />
          </div>
          <div className="mt-3 text-center text-[15px] font-semibold">Signed by owner</div>
        </Frame>
      )
    case 3: {
      const br = resaleBreakdown(v, 10000)
      return (
        <Frame title="Resell">
          <div className="mt-5 rounded-[24px] bg-ink-2 p-5 hairline">
            <div className="text-[52px] leading-none font-bold tracking-[-0.045em] tabular">{usd(v)}</div>
            <div className="mt-8">
              <CapSlider faceCents={10000} capCents={10500} minCents={8500} maxCents={12500} value={v} onChange={setV} autoDemo />
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-[22px] bg-ink-3 hairline">
            <Row k="Ben pays, all-in" v={usd(br.buyerTotal)} pad />
            <Row k="Maya receives" v={usd(br.seller)} pad strong />
            <Row k="Artist · 2% of face" v={usd(br.royalty)} pad />
            <Row k="Proof of Seat · 1% of face" v={usd(br.fee)} pad />
          </div>
        </Frame>
      )
    }
    case 4:
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f5f2b] px-8 text-center">
          <BadgeCheck size={96} strokeWidth={1.6} />
          <div className="mt-5 text-[42px] leading-none font-bold tracking-[-0.04em]">Welcome, Ben</div>
          <div className="mt-3 text-[18px] text-white/85">Sec M3 · Row 14 · Seat 7</div>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 text-[14px] font-semibold">
            <CloudOff size={15} /> Validated offline · 2.4 s
          </span>
        </div>
      )
    default:
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_40%,rgba(242,193,78,.22),transparent)]" />
          <motion.div initial={{ rotateY: -360, scale: 0.6 }} animate={{ rotateY: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 60, damping: 12 }}>
            <Medal badge={{ id: 'x', eventId: 'nova', artist: 'Faye Webster', venue: 'Fox Theatre', date: 'Jun 26, 2027', hue: 220 }} size={230} />
          </motion.div>
          <div className="mt-8 text-[40px] font-bold tracking-[-0.04em]">
            <span className="text-gradient-gold">I was there.</span>
          </div>
          <div className="mt-2 text-[16px] text-fg-2">Proof of attendance · early access to the next presale</div>
          <div className="mt-6 inline-flex items-center gap-2 text-[14px] text-fg-3">
            <ShieldCheck size={15} /> Can’t be sold or transferred
          </div>
        </div>
      )
  }
}

function Row({ k, v, strong, pad }: { k: string; v: string; strong?: boolean; pad?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${pad ? 'border-b border-white/[0.06] px-4 py-3 last:border-0' : 'py-1.5'}`}>
      <span className={strong ? 'text-[16px] font-semibold' : 'text-[15px] text-fg-2'}>{k}</span>
      <span className={`tabular ${strong ? 'text-[20px] font-bold' : 'text-[15px]'}`}>{v}</span>
    </div>
  )
}

/* ───────── Part 3 · Under the hood (slide 13) ───────── */
export function BuildingBlocks() {
  const blocks = [
    ['01', 'Network', 'Base, an Ethereum rollup. Minting a ticket costs a fraction of a cent, not dollars on Ethereum itself.'],
    ['02', 'Wallet', 'Created at sign-up with an email and a card. The app pays the gas, so fans never hold crypto.'],
    ['03', 'Contract', 'ERC-721: one token per seat, storing the seat, the date and the original price.'],
    ['04', 'Entry', 'A QR code signed by the fan’s wallet, refreshed every few seconds.'],
  ]
  return (
    <section className="bg-paper py-28 text-paper-ink sm:py-36">
      <Container>
        <Reveal>
          <Eyebrow light>Part 3 · How it works</Eyebrow>
          <H2 className="mt-4 max-w-[16ch]">Four building blocks, invisible to the fan.</H2>
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {blocks.map(([n, t, d], i) => (
            <Reveal key={t} delay={i * 0.08}>
              <div className="flex h-full gap-5 rounded-[24px] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,.04),0_20px_40px_-30px_rgba(0,0,0,.25)]">
                <span className="text-[34px] leading-none font-bold tracking-[-0.04em] text-accent-on-light tabular">{n}</span>
                <span>
                  <span className="block text-[20px] font-semibold tracking-[-0.02em]">{t}</span>
                  <span className="mt-1.5 block text-[15px] leading-snug text-paper-mute">{d}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-6 text-[14px] text-paper-mute">
          The word NFT stays out of the app: fans see a digital ticket, a price and a seat. In the demo, the Proof view shows what runs underneath.
        </Reveal>
      </Container>
    </section>
  )
}
