import { AnimatePresence, motion } from 'motion/react'
import { Bot } from 'lucide-react'
import { AppIcon, Logo } from '@/components/brand/Logo'
import { EventImage } from '@/components/art/EventImage'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { EVENTS } from '@/data/world'
import { mulberry32 } from '@/lib/prng'
import { useDemo } from '@/store/demo'
import { STEPS, type Scene } from './story'

/** Full-screen story "posters" shown inside the phone for narrative chapters. */
export function StoryScene() {
  const story = useDemo((s) => s.story)
  const scene = story.active ? STEPS[story.chapter]?.scene : undefined
  return (
    <AnimatePresence>
      {scene && (
        <motion.div
          key={scene}
          className="absolute inset-0 z-[95] overflow-hidden bg-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Poster scene={scene} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const BOTS = (() => {
  const r = mulberry32(8)
  return Array.from({ length: 22 }, () => ({ x: r() * 100, y: r() * 100, s: 12 + r() * 14, d: r() * 1.5 }))
})()

function Poster({ scene }: { scene: Scene }) {
  if (scene === 'problem')
    return (
      <div className="absolute inset-0 flex flex-col px-6" style={{ paddingTop: 'calc(var(--sat) + 28px)', paddingBottom: 'calc(var(--sab) + 24px)' }}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_30%,rgba(255,69,58,.18),transparent)]" />
        {BOTS.map((b, i) => (
          <motion.span key={i} className="absolute text-err/50" style={{ left: `${b.x}%`, top: `${b.y}%` }} initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + b.d, type: 'spring', stiffness: 200 }}>
            <Bot size={b.s} />
          </motion.span>
        ))}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative text-[13px] font-semibold tracking-[0.14em] text-err uppercase">
          Sold out in minutes
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative mt-3 text-[40px] leading-[1] font-bold tracking-[-0.045em]">
          Maya didn’t lose to fans. She lost to bots.
        </motion.h2>
        <motion.div initial={{ opacity: 0, rotate: -6, y: 30 }} animate={{ opacity: 1, rotate: -3, y: 0 }} transition={{ delay: 0.3, type: 'spring', stiffness: 120, damping: 14 }} className="relative mt-8">
          <div className="relative aspect-[1.586] overflow-hidden rounded-[22px] shadow-[0_30px_60px_-20px_rgba(0,0,0,.9)] hairline-2">
            <EventImage id="nova" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,.6))]" />
            <div className="absolute inset-0 flex flex-col justify-between p-5">
              <div className="text-[22px] font-bold tracking-[-0.03em]">{EVENTS.nova.artist}</div>
              <div className="flex items-end justify-between">
                <span className="text-[12px] text-white/75">Sec M3 · Face value $100</span>
                <motion.span className="text-[52px] leading-none font-bold tracking-[-0.05em]" initial={{ color: '#f5f5f7' }} animate={{ color: '#ff453a' }} transition={{ delay: 1.2, duration: 1.4 }}>
                  <NumberTicker value={400} from={100} format={(n) => `$${Math.round(n)}`} duration={2.2} />
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>
        <div className="relative mt-auto flex flex-col gap-2.5">
          {[
            ['$35,438', 'one Atlanta Eras Tour floor seat, listed the day after the presale (2022)'],
            ['$3,801', 'average Eras resale price, vs. $157 on her previous tour'],
            ['$0', 'of the markup goes to the artist on most resale sites'],
          ].map(([n, t], i) => (
            <motion.div key={n} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.6 + i * 0.2 }} className="flex items-baseline gap-3 rounded-[16px] bg-ink-2/90 px-4 py-3 hairline">
              <span className="w-[74px] shrink-0 text-[24px] font-bold tracking-[-0.03em]">{n}</span>
              <span className="text-[13px] leading-snug text-fg-2">{t}</span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  if (scene === 'idea')
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-7 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_45%,rgba(62,134,255,.3),transparent)]" />
        <motion.div initial={{ scale: 0.5, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 1.6 }} className="relative">
          <AppIcon size={84} />
        </motion.div>
        <h2 className="relative mt-8 text-[46px] leading-[0.98] font-bold tracking-[-0.05em]">
          {'One seat. One token. One owner.'.split(' ').map((w, i) => (
            <motion.span key={i} className={`inline-block pr-[0.22em] ${i >= 4 ? 'text-gradient-accent' : ''}`} initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.15 + i * 0.13, duration: 0.5 }}>
              {w}
            </motion.span>
          ))}
        </h2>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }} className="relative mt-8 flex flex-wrap justify-center gap-2">
          {['Never above 105%', '2% to the artist', 'Verified fans only'].map((t) => (
            <span key={t} className="rounded-full bg-white/[0.08] px-3 py-1.5 text-[13px] font-semibold hairline">
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    )
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-7 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_45%,rgba(62,134,255,.28),transparent)]" />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative text-[13px] font-semibold tracking-[0.14em] text-accent-soft uppercase">
        Back to Maya
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="relative mt-4 text-[50px] leading-[0.96] font-bold tracking-[-0.05em]">
        She gets in for <span className="text-gradient-accent">$105</span>, not <span className="text-err line-through decoration-[5px]">$400</span>.
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="relative mt-5 text-[18px] text-fg-2">
        Resale capped. Artists paid.
      </motion.p>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.3, type: 'spring', stiffness: 200, damping: 18 }} className="relative mt-14 flex flex-col items-center gap-2">
        <Logo size={28} />
        <span className="text-[15px] text-fg-3">One seat. One token. One owner.</span>
      </motion.div>
    </div>
  )
}
