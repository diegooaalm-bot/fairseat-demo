import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Check, Lock, Music2 } from 'lucide-react'
import { Mark } from '@/components/brand/Logo'
import { EventImage } from '@/components/art/EventImage'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { EVENTS, type PersonId } from '@/data/world'
import { haptic } from '@/lib/haptics'
import { usd } from '@/lib/money'
import { spring } from '@/lib/motion'
import { resaleBreakdown } from '@/lib/rules'
import { shortArtist } from './Resale'
import { useDemo } from '@/store/demo'
import { useUI } from '@/store/ui'

/* Stage coordinates (360 × 500) */
const S = { w: 360, h: 500 }
const P = {
  seller: { x: 62, y: 70 },
  buyer: { x: 298, y: 70 },
  lock: { x: 180, y: 222 },
  artist: { x: 74, y: 420 },
  house: { x: 286, y: 420 },
}

type Phase = 0 | 1 | 2 | 3 | 4

/**
 * The atomic swap: the ticket and the money change hands at the same time,
 * through one checkpoint, or not at all.
 */
export function AtomicSwap({ viewer }: { viewer: PersonId }) {
  const close = useUI((s) => s.closeSwap)
  const swap = useUI((s) => s.swap)
  const tx = useDemo((s) => s.ledger.find((t) => t.id === s.lastResaleTxId))
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState<Phase>(0)
  const [checks, setChecks] = useState(0)
  const br = tx?.breakdown ?? resaleBreakdown(10500, 10000)

  useEffect(() => {
    setPhase(0)
    setChecks(0)
    if (reduced) {
      setPhase(4)
      setChecks(4)
      return
    }
    const t = [
      setTimeout(() => setPhase(1), 450),
      setTimeout(() => setPhase(2), 1350),
      setTimeout(() => setChecks(1), 1500),
      setTimeout(() => setChecks(2), 1680),
      setTimeout(() => setChecks(3), 1860),
      setTimeout(() => setChecks(4), 2040),
      setTimeout(() => (setPhase(3), haptic('heavy')), 2300),
      setTimeout(() => (setPhase(4), haptic('success')), 3150),
    ]
    return () => t.forEach(clearTimeout)
  }, [swap?.id, reduced])

  const settled = phase >= 4
  const eventId = tx?.eventId ?? 'nova'
  const seller = tx?.parties?.seller ?? 'Maya'
  const buyer = tx?.parties?.buyer ?? 'Ben'
  const viewerName = viewer === 'maya' ? 'Maya' : 'Ben'
  const selling = seller === viewerName
  const artist = shortArtist(EVENTS[eventId].artist)
  const title = selling
    ? settled
      ? 'Sold to a verified fan'
      : 'Selling your seat…'
    : settled
      ? 'The seat is yours'
      : seller === 'Verified fan'
        ? 'Buying from a verified fan…'
        : `Buying ${seller}’s seat…`
  const capLabel = (tx?.checks?.find((c) => c.id === 'cap')?.detail.split('≤ ')[1] ?? '$105.00').replace(/\.00$/, '')
  const avatar = (n: string) => (n === 'Maya' ? 330 : n === 'Ben' ? 200 : 150)

  return (
    <motion.div className="absolute inset-0 z-[80] flex flex-col bg-ink" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <motion.div
        className="pointer-events-none absolute top-[28%] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full"
        animate={{ background: settled ? 'radial-gradient(closest-side, rgba(48,209,88,.20), transparent)' : 'radial-gradient(closest-side, rgba(62,134,255,.25), transparent)' }}
      />
      <div className="relative px-6 text-center" style={{ paddingTop: 'calc(var(--sat) + 18px)' }}>
        <div className="text-[12px] font-semibold tracking-[0.12em] text-accent-soft uppercase">One step · all or nothing</div>
        <AnimatePresence mode="wait">
          <motion.h2 key={title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-1 text-[28px] font-bold tracking-[-0.03em]">
            {title}
          </motion.h2>
        </AnimatePresence>
      </div>

      <div className="relative mx-auto mt-2" style={{ width: S.w, height: S.h }}>
        {/* rails */}
        <svg className="absolute inset-0" width={S.w} height={S.h} aria-hidden="true">
          {[
            [P.seller, P.lock],
            [P.buyer, P.lock],
            [P.lock, P.artist],
            [P.lock, P.house],
          ].map(([a, b], i) => (
            <motion.line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={settled ? 'rgba(48,209,88,.45)' : 'rgba(141,184,255,.35)'}
              strokeWidth={1.5}
              strokeDasharray="4 6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
            />
          ))}
        </svg>

        {/* nodes */}
        <Node at={P.seller} label={selling ? 'You' : seller} sub="Seller">
          <Avatar name={seller === 'Verified fan' ? 'Fan' : seller} hue={avatar(seller)} size={54} />
        </Node>
        <Node at={P.buyer} label={!selling ? 'You' : buyer} sub="Verified buyer">
          <Avatar name={buyer === 'Verified fan' ? 'Fan' : buyer} hue={avatar(buyer)} size={54} />
        </Node>
        <Node at={P.artist} label={artist} sub="Artist · 2%">
          <span className="grid h-[54px] w-[54px] place-items-center rounded-full bg-[linear-gradient(140deg,#8b6cff,#3e3ab0)] text-white">
            <Music2 size={24} />
          </span>
        </Node>
        <Node at={P.house} label="Proof of Seat" sub="Platform · 2%">
          <span className="grid h-[54px] w-[54px] place-items-center rounded-full bg-ink-4 hairline-2">
            <Mark size={28} className="text-accent" />
          </span>
        </Node>

        {/* the checkpoint */}
        <motion.div
          className="absolute grid h-[86px] w-[86px] place-items-center rounded-full"
          style={{ left: P.lock.x - 43, top: P.lock.y - 43 }}
          animate={{
            background: settled ? 'rgba(48,209,88,.16)' : phase >= 2 ? 'rgba(62,134,255,.22)' : 'rgba(255,255,255,.06)',
            boxShadow: phase === 3 ? '0 0 60px 10px rgba(62,134,255,.55)' : settled ? '0 0 40px 2px rgba(48,209,88,.35)' : '0 0 0 0 rgba(0,0,0,0)',
            scale: phase === 3 ? [1, 1.15, 1] : 1,
          }}
          transition={{ duration: 0.45 }}
        >
          <span className={`absolute inset-0 rounded-full border-2 ${settled ? 'border-ok/70' : 'border-accent/60'}`} />
          {settled ? <Check size={36} strokeWidth={3} className="text-ok" /> : <Lock size={30} className="text-accent-soft" />}
        </motion.div>

        {/* rules lighting up */}
        <div className="absolute grid grid-cols-2 gap-x-2 gap-y-2" style={{ left: P.lock.x - 128, top: P.lock.y + 54, width: 256 }}>
          {[`Price ≤ ${capLabel}`, 'Buyer verified', 'Under 4 tickets', 'Before close'].map((r, i) => (
            <motion.div
              key={r}
              animate={{ opacity: checks > i ? 1 : 0.25 }}
              className={`flex items-center gap-1.5 rounded-full bg-ink/90 py-0.5 pr-2 pl-0.5 text-[12px] font-semibold whitespace-nowrap ${checks > i ? 'text-ok' : 'text-fg-3'}`}
            >
              <span className={`grid h-4 w-4 place-items-center rounded-full ${checks > i ? 'bg-ok text-ink' : 'bg-white/10'}`}>
                <Check size={11} strokeWidth={3.5} />
              </span>
              {r}
            </motion.div>
          ))}
        </div>

        {/* moving: the ticket */}
        <motion.div
          className="absolute h-[40px] w-[64px] overflow-hidden rounded-[8px] shadow-[0_8px_20px_rgba(0,0,0,.6)] ring-1 ring-white/30"
          initial={{ x: P.seller.x - 32, y: P.seller.y + 80, opacity: 0, scale: 0.6 }}
          animate={
            phase === 0
              ? { x: P.seller.x - 32, y: P.seller.y + 80, opacity: 1, scale: 1 }
              : phase <= 2
                ? { x: P.lock.x - 70, y: P.lock.y - 20, opacity: 1, scale: 1 }
                : { x: P.buyer.x - 32, y: P.buyer.y + 80, opacity: 1, scale: 1 }
          }
          transition={phase >= 3 ? { type: 'spring', stiffness: 120, damping: 17 } : { type: 'spring', stiffness: 90, damping: 16 }}
        >
          <EventImage id={eventId} size="card" />
          <span className="absolute inset-0 grid place-items-center bg-black/30 px-1 text-center text-[9px] leading-tight font-bold text-white">{artist}</span>
        </motion.div>

        {/* moving: the money */}
        {phase < 3 && (
          <motion.div
            className="absolute rounded-full bg-white px-2.5 py-1 text-[13px] font-bold text-paper-ink tabular shadow-[0_8px_20px_rgba(0,0,0,.5)]"
            initial={{ x: P.buyer.x - 34, y: P.buyer.y + 82, opacity: 0, scale: 0.6 }}
            animate={phase === 0 ? { x: P.buyer.x - 34, y: P.buyer.y + 82, opacity: 1, scale: 1 } : { x: P.lock.x + 10, y: P.lock.y - 14, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 90, damping: 16 }}
          >
            {usd(br.buyerTotal)}
          </motion.div>
        )}
        {phase >= 3 && (
          <>
            <Coin to={{ x: P.seller.x - 36, y: P.seller.y + 82 }} text={`+${usd(br.seller)}`} tone="ok" />
            <Coin to={{ x: P.artist.x - 26, y: P.artist.y - 66 }} text={`+${usd(br.royalty)}`} tone="violet" />
            <Coin to={{ x: P.house.x - 26, y: P.house.y - 66 }} text={`+${usd(br.fee)}`} tone="accent" />
          </>
        )}
      </div>

      <AnimatePresence>
        {settled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring.gentle}
            className="relative mt-auto px-5"
            style={{ paddingBottom: 'calc(var(--sab) + 14px)' }}
          >
            <p className="mb-4 text-center text-[14px] leading-snug text-fg-2">
              {selling ? 'The buyer' : 'You'} paid {usd(br.buyerTotal)}. {selling ? 'You' : seller === 'Verified fan' ? 'The seller' : seller} got {usd(br.seller)}, {artist} {usd(br.royalty)}, Proof of Seat {usd(br.fee)}. If any rule had failed, no money would have moved.
            </p>
            <Button size="lg" full onClick={close}>
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Node({ at, label, sub, children }: { at: { x: number; y: number }; label: string; sub: string; children: React.ReactNode }) {
  return (
    <motion.div
      className="absolute flex w-[120px] flex-col items-center text-center"
      style={{ left: at.x - 60, top: at.y - 27 }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring.gentle}
    >
      {children}
      <div className="mt-1.5 text-[14px] font-semibold">{label}</div>
      <div className="text-[11px] text-fg-3">{sub}</div>
    </motion.div>
  )
}

function Coin({ to, text, tone }: { to: { x: number; y: number }; text: string; tone: 'ok' | 'violet' | 'accent' }) {
  const c = tone === 'ok' ? 'bg-ok text-ink' : tone === 'violet' ? 'bg-[#8b6cff] text-white' : 'bg-accent-fill text-white'
  return (
    <motion.div
      className={`absolute rounded-full px-2.5 py-1 text-[13px] font-bold tabular shadow-[0_8px_20px_rgba(0,0,0,.5)] ${c}`}
      initial={{ x: P.lock.x - 30, y: P.lock.y - 14, scale: 0.6, opacity: 0 }}
      animate={{ x: to.x, y: to.y, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 17 }}
    >
      {text}
    </motion.div>
  )
}
