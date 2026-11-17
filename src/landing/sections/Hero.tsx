import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, BadgeCheck, Music2, Play, ShieldCheck } from 'lucide-react'
import { EventArt } from '@/components/art/EventArt'
import { IPhoneFrame, FRAME_H, FRAME_W } from '@/components/device/IPhoneFrame'
import { CapSlider } from '@/components/ui/CapSlider'
import { EVENTS } from '@/data/world'
import { usd } from '@/lib/money'
import { resaleBreakdown } from '@/lib/rules'
import { Container } from '../ui'

export function Hero() {
  const { scrollY } = useScroll()
  const phoneY = useTransform(scrollY, [0, 700], [0, 120])
  const glowO = useTransform(scrollY, [0, 600], [1, 0.3])
  return (
    <section className="relative overflow-hidden pt-[calc(env(safe-area-inset-top)+88px)] pb-16 sm:pb-24 lg:min-h-[100svh]">
      <motion.div style={{ opacity: glowO }} className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-[35%] left-1/2 h-[110%] w-[110%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(62,134,255,.32),transparent)]" />
        <div
          className="absolute -top-[10%] left-1/2 h-[120%] w-[160%] -translate-x-1/2 opacity-70"
          style={{ background: 'conic-gradient(from 160deg at 50% 0%, transparent 0deg, rgba(141,184,255,.10) 6deg, transparent 12deg, transparent 24deg, rgba(141,184,255,.07) 28deg, transparent 33deg, transparent 330deg)' }}
        />
      </motion.div>
      <Container className="relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-[13px] font-semibold text-fg-2 hairline">
            <ShieldCheck size={14} className="text-accent-soft" /> Fair resale for concert tickets
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-[clamp(52px,9vw,124px)] leading-[0.92] font-bold tracking-[-0.055em]"
          >
            The ticket that <span className="text-gradient-accent">knows the rules.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-6 max-w-[36ch] text-[clamp(18px,2.1vw,23px)] leading-[1.4] text-fg-2 lg:mx-0"
          >
            Resale that exists but can never be abusive: capped at 110%, 5% to the artist on every resale, verified fans only.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              to="/demo"
              className="inline-flex h-[54px] items-center gap-2 rounded-full bg-accent-fill px-7 text-[17px] font-semibold text-white shadow-[0_14px_40px_-12px_rgba(62,134,255,.9)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              <Play size={16} fill="currentColor" /> Try the live demo
            </Link>
            <a href="#how" className="inline-flex h-[54px] items-center gap-2 rounded-full px-6 text-[17px] font-semibold text-fg hairline-2 transition-colors hover:bg-white/[0.06]">
              How it works <ArrowDown size={16} />
            </a>
          </motion.div>
          <p className="mt-6 text-[14px] text-fg-3">If you can use Apple Pay, you can use FairSeat. No crypto to buy, ever.</p>
        </div>

        <motion.div style={{ y: phoneY }} className="relative mx-auto" initial={{ opacity: 0, y: 60, rotate: -4 }} animate={{ opacity: 1, rotate: 0 }} transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
          <HeroPhone />
        </motion.div>
      </Container>
    </section>
  )
}

function HeroPhone() {
  const scale = 0.72
  return (
    <div className="relative" style={{ width: FRAME_W * scale, height: FRAME_H * scale }}>
      <motion.div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: FRAME_W, height: FRAME_H, scale }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <IPhoneFrame clock="6:18">
          <HeroScreen />
        </IPhoneFrame>
      </motion.div>
      <Float className="right-[calc(100%-36px)] top-[16%] hidden sm:flex" delay={0.8}>
        <BadgeCheck size={16} className="text-ok" /> Verified fans only
      </Float>
      <Float className="left-[calc(100%-36px)] top-[46%] hidden sm:flex" delay={1.1}>
        <Music2 size={16} className="text-[#a58cff]" /> +$5.50 to the artist
      </Float>
      <Float className="right-[calc(100%-30px)] bottom-[14%] hidden sm:flex" delay={1.4}>
        <span className="text-err line-through">$400</span> Not here.
      </Float>
    </div>
  )
}

function Float({ children, className, delay }: { children: React.ReactNode; className: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
      transition={{ opacity: { delay, duration: 0.5 }, scale: { delay, type: 'spring', stiffness: 300, damping: 18 }, y: { delay, duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
      className={`glass hairline-2 absolute z-10 items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-semibold whitespace-nowrap shadow-[0_20px_40px_-15px_rgba(0,0,0,.8)] ${className}`}
    >
      {children}
    </motion.div>
  )
}

/** A live, looping resale screen: the slider slams into the $110 cap. */
function HeroScreen() {
  const [v, setV] = useState(9500)
  const [hit, setHit] = useState(0)
  const br = resaleBreakdown(v)
  return (
    <div className="absolute inset-0 flex flex-col bg-ink px-5" style={{ paddingTop: 'calc(var(--sat) + 14px)' }}>
      <div className="text-center text-[17px] font-semibold">Resell</div>
      <div className="mt-4 flex items-center gap-3 rounded-[18px] bg-ink-3 p-3 hairline">
        <span className="relative h-12 w-12 overflow-hidden rounded-[12px]">
          <EventArt event={EVENTS.nova} />
        </span>
        <span className="flex-1">
          <span className="block text-[15px] font-semibold">Nova Bloom</span>
          <span className="block text-[13px] text-fg-3">Sec 112 · Row F · Seat 7</span>
        </span>
        <span className="text-right text-[12px] text-fg-3">
          You paid
          <span className="block text-[15px] font-semibold text-fg">$100.00</span>
        </span>
      </div>
      <div className="mt-4 rounded-[24px] bg-ink-2 p-5 hairline">
        <div className="text-[54px] leading-none font-bold tracking-[-0.045em] tabular">{usd(v)}</div>
        <div className="mt-8">
          <CapSlider faceCents={10000} capCents={11000} minCents={8000} maxCents={14000} value={v} onChange={setV} onHitCap={() => setHit((h) => h + 1)} autoDemo />
        </div>
        <div className="h-12">
          <AnimatePresence mode="wait">
            {hit > 0 && v >= 11000 && (
              <motion.div key={hit} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 flex items-center gap-2 text-[16px] font-bold text-accent-soft">
                <ShieldCheck size={19} className="text-accent" /> This ticket knows the rules.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-[24px] bg-ink-3 hairline">
        {[
          ['You receive', usd(br.seller), true],
          ['Nova Bloom gets', usd(br.royalty), false],
          ['Buyer pays', usd(br.buyerTotal), false],
        ].map(([k, val, big]) => (
          <div key={k as string} className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5 last:border-0">
            <span className={big ? 'text-[17px] font-semibold' : 'text-[15px] text-fg-2'}>{k}</span>
            <span className={`font-bold tabular ${big ? 'text-[24px] text-accent-soft' : 'text-[17px]'}`}>{val}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto mb-[calc(var(--sab)+14px)] grid h-[54px] place-items-center rounded-[16px] bg-accent-fill text-[17px] font-semibold">List for {usd(v)}</div>
    </div>
  )
}
