import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { fanLevel, type Badge } from '@/data/world'
import { haptic } from '@/lib/haptics'
import { mulberry32 } from '@/lib/prng'
import { spring } from '@/lib/motion'
import type { Celebration as C } from '@/store/demo'

/** “I was there”: the badge spins in, the level bar fills, priority unlocks. */
export function Celebration({ c, onDone }: { c: C; onDone: () => void }) {
  const before = fanLevel(c.fromLevelBadges)
  const after = fanLevel(c.fromLevelBadges + 1)
  const leveled = after.level > before.level
  const [step, setStep] = useState(0)
  const reduced = useReducedMotion()
  useEffect(() => {
    haptic('success')
    const t = [setTimeout(() => setStep(1), 1300), setTimeout(() => (setStep(2), leveled && haptic('heavy')), 2300)]
    return () => t.forEach(clearTimeout)
  }, [leveled])

  const confetti = useMemo(() => {
    const r = mulberry32(5)
    return Array.from({ length: 36 }, () => ({ x: (r() - 0.5) * 340, y: -120 - r() * 260, rot: r() * 360, d: 0.8 + r() * 0.8, s: 4 + r() * 5, gold: r() > 0.35 }))
  }, [])
  const fromPct = levelPct(c.fromLevelBadges)
  const toPct = leveled ? 100 : levelPct(c.fromLevelBadges + 1)

  return (
    <motion.div className="absolute inset-0 z-[85] flex flex-col items-center overflow-hidden bg-ink px-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ paddingTop: 'calc(var(--sat) + 30px)', paddingBottom: 'calc(var(--sab) + 14px)' }}>
      {/* rays */}
      <motion.div
        className="pointer-events-none absolute top-[90px] left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-60"
        style={{ background: 'repeating-conic-gradient(from 0deg, rgba(242,193,78,.16) 0deg 6deg, transparent 6deg 18deg)', maskImage: 'radial-gradient(closest-side, #000 20%, transparent 70%)', WebkitMaskImage: 'radial-gradient(closest-side, #000 20%, transparent 70%)' }}
        animate={reduced ? {} : { rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />
      <div className="text-[12px] font-semibold tracking-[0.14em] text-gold uppercase">After the show</div>
      <div className="relative mt-8 h-[220px] w-[220px] [perspective:800px]">
        {!reduced &&
          confetti.map((p, i) => (
            <motion.span
              key={i}
              className="absolute top-1/2 left-1/2 rounded-[2px]"
              style={{ width: p.s, height: p.s * 0.6, background: p.gold ? '#f2c14e' : '#8db8ff' }}
              initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
              animate={{ x: p.x, y: [0, p.y, p.y + 420], opacity: [0, 1, 0], rotate: p.rot * 3 }}
              transition={{ duration: 2.4 * p.d, delay: 0.5, ease: [0.2, 0.7, 0.4, 1] }}
            />
          ))}
        <motion.div
          className="absolute inset-0"
          initial={{ rotateY: -540, scale: 0.3, opacity: 0 }}
          animate={{ rotateY: 0, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 60, damping: 12, mass: 1.1 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <Medal badge={c.badge} />
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, ...spring.gentle }}>
        <h2 className="mt-6 text-[38px] leading-none font-bold tracking-[-0.04em]">
          <span className="text-gradient-gold">I was there.</span>
        </h2>
        <p className="mt-2 text-[16px] text-fg-2">
          {c.badge.artist} · {c.badge.venue} · {c.badge.date}
        </p>
        <p className="mt-1 text-[13px] text-fg-3">Yours forever. It can’t be sold, bought or transferred.</p>
      </motion.div>

      <motion.div className="mt-7 w-full rounded-[22px] bg-ink-3 p-4 text-left hairline" initial={{ opacity: 0, y: 16 }} animate={step >= 1 ? { opacity: 1, y: 0 } : {}} transition={spring.gentle}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] text-fg-3">Fan level</div>
            <motion.div key={step >= 2 ? 'a' : 'b'} initial={{ scale: 0.9, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} transition={spring.wall} className="text-[20px] font-bold tracking-[-0.02em]">
              Level {step >= 2 ? after.level : before.level} · {step >= 2 ? after.name : before.name}
            </motion.div>
          </div>
          {leveled && step >= 2 && (
            <motion.span initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={spring.wall} className="rounded-full bg-gold px-2.5 py-1 text-[12px] font-bold text-[#1a1306]">
              Level up
            </motion.span>
          )}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#c9962a,#f2c14e,#ffe39a)]"
            initial={{ width: `${Math.max(4, fromPct)}%` }}
            animate={step >= 1 ? { width: `${Math.max(4, toPct)}%` } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <motion.div initial={{ opacity: 0 }} animate={step >= 2 ? { opacity: 1 } : {}} className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-gold">
          <Sparkles size={16} /> {after.priority} for {c.badge.artist}’s next presale
        </motion.div>
      </motion.div>

      <motion.div className="mt-auto w-full" initial={{ opacity: 0 }} animate={step >= 2 ? { opacity: 1 } : {}}>
        <Button size="lg" variant="gold" full onClick={onDone}>
          Add to Fan Pass
        </Button>
      </motion.div>
    </motion.div>
  )
}

const TH = [0, 1, 3, 5]
/** progress (0-100) inside the current level */
export function levelPct(badges: number) {
  const L = fanLevel(badges).level
  if (L >= 4) return 100
  const lo = TH[L - 1]
  const hi = TH[L]
  return ((badges - lo) / (hi - lo)) * 100
}

export function Medal({ badge, size = 220 }: { badge: Badge; size?: number }) {
  const initials = badge.artist
    .replace(/^The /, '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 210deg, #8a6416, #f6d77b, #c9962a, #fff1c4, #b8861f, #f2c14e, #8a6416)',
          boxShadow: '0 30px 60px -20px rgba(242,193,78,.55), inset 0 0 0 2px rgba(255,255,255,.35)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          inset: size * 0.07,
          background: `radial-gradient(70% 70% at 35% 25%, hsl(${badge.hue} 70% 45%), hsl(${badge.hue} 60% 18%))`,
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,.5), 0 0 0 2px rgba(0,0,0,.25)',
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <div style={{ fontSize: size * 0.085 }} className="font-semibold tracking-[0.18em] text-white/80 uppercase">
          I was there
        </div>
        <div style={{ fontSize: size * 0.3 }} className="leading-none font-extrabold tracking-[-0.04em]">
          {initials}
        </div>
        <div style={{ fontSize: size * 0.065 }} className="mt-1 font-semibold text-white/75">
          {badge.date}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,.35)_0%,transparent_35%,transparent_65%,rgba(255,255,255,.12)_100%)]" />
    </div>
  )
}
