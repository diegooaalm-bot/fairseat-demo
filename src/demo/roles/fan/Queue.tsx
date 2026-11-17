import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { fanLevel, type PersonId } from '@/data/world'
import { haptic } from '@/lib/haptics'
import { int } from '@/lib/money'
import { spring } from '@/lib/motion'
import { Screen } from '@/demo/shell/Screen'
import { useDemo } from '@/store/demo'
import { useUI } from '@/store/ui'
import { BotShield, type BotShieldHandle } from './BotShield'

const QUEUE_MS = 6500

export function Queue({ person }: { person: PersonId }) {
  const pop = useDemo((s) => s.pop)
  const push = useDemo((s) => s.push)
  const add = useDemo((s) => s.addBotsBlocked)
  const total = useDemo((s) => s.botsBlocked)
  const flags = useDemo((s) => s.flags)
  const setFlag = useDemo((s) => s.setFlag)
  const lvl = fanLevel(useDemo((s) => s[person].badges.length))
  const shield = useRef<BotShieldHandle>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const local = useRef(0)
  const [attacking, setAttacking] = useState(false)
  const [progress, setProgress] = useState(flags.queueDone ? 1 : 0)
  const reduced = useReducedMotion() ?? false
  const attackSignal = useUI((s) => s.attack)

  // queue progress
  useEffect(() => {
    if (flags.queueDone) return
    const start = performance.now()
    let raf = 0
    const loop = () => {
      const p = Math.min(1, (performance.now() - start) / QUEUE_MS)
      setProgress(p)
      if (p < 1) raf = requestAnimationFrame(loop)
      else {
        haptic('success')
        setFlag('queueDone')
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [flags.queueDone, setFlag])

  // bot counter writes straight to the DOM; store gets batched updates
  useEffect(() => {
    if (counter.current) counter.current.textContent = int(total + local.current)
  }, [total])
  const onBlocked = (n: number) => {
    const bots = n * 17
    local.current += bots
    if (counter.current) counter.current.textContent = int(total + local.current)
  }
  useEffect(() => {
    const t = setInterval(() => {
      if (local.current) {
        add(local.current)
        local.current = 0
      }
    }, 900)
    return () => {
      clearInterval(t)
      if (local.current) add(local.current)
      local.current = 0
    }
  }, [add])

  const attack = () => {
    haptic('heavy')
    setAttacking(true)
    shield.current?.attack(3.2)
    if (reduced) onBlocked(2900)
    setTimeout(() => setAttacking(false), 3300)
  }
  useEffect(() => {
    if (attackSignal) attack()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attackSignal])

  const done = progress >= 1
  const fans = 61_248
  return (
    <Screen
      title="Fair queue"
      large={false}
      onBack={() => pop(person)}
      footer={
        <motion.div animate={done ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 0 }}>
          <Button size="lg" full disabled={!done} onClick={() => push(person, { name: 'seats', params: { id: 'nova' } })}>
            {done ? 'It’s your turn · Choose seats' : 'Waiting for your window…'}
          </Button>
        </motion.div>
      }
    >
      <div className="flex flex-col gap-4 px-4 pt-2">
        {/* The shield */}
        <div className="relative overflow-hidden rounded-[26px] bg-[radial-gradient(120%_90%_at_70%_50%,#0f1830,#08090d)] hairline">
          <div className="absolute top-3 left-4 z-10 flex items-center gap-3 text-[11px] font-semibold tracking-[0.04em] text-fg-3 uppercase">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 bg-err" /> Bots
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent-soft" /> Verified fans
            </span>
          </div>
          <div className="absolute top-3 right-4 z-10 flex items-center gap-1 text-[11px] font-semibold tracking-[0.04em] text-accent-soft uppercase">
            <ShieldCheck size={13} /> Identity check
          </div>
          <BotShield ref={shield} onBlocked={onBlocked} height={196} reduced={reduced} />
          <div className="flex items-end justify-between gap-3 border-t border-white/[0.06] bg-black/20 px-4 pt-2.5 pb-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold tracking-[0.06em] text-fg-3 uppercase">Bots blocked</div>
              <motion.div animate={attacking ? { scale: [1, 1.05, 1] } : { scale: 1 }} transition={{ duration: 0.4, repeat: attacking ? Infinity : 0 }} className="origin-left">
                <span ref={counter} className={`text-[28px] leading-none font-bold tracking-[-0.03em] tabular ${attacking ? 'text-err' : ''}`}>
                  {int(total)}
                </span>
              </motion.div>
            </div>
            <Button size="sm" variant={attacking ? 'danger' : 'secondary'} icon={<Zap size={14} />} onClick={attack} hapticKind={false} disabled={attacking}>
              {attacking ? 'Under attack…' : 'Simulate bot attack'}
            </Button>
          </div>
        </div>

        {/* Queue status */}
        <div className="rounded-[24px] bg-ink-3 p-5 hairline">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[13px] font-semibold tracking-[0.06em] text-accent-soft uppercase">{done ? 'Your window is open' : 'You’re in the draw'}</div>
              <div className="mt-1 text-[24px] leading-tight font-bold tracking-[-0.03em]">{done ? 'It’s your turn, Maya.' : 'Hold tight. No refreshing needed.'}</div>
            </div>
            <motion.span
              animate={done ? { scale: [0.6, 1.15, 1], rotate: [0, -8, 0] } : {}}
              transition={spring.wall}
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${done ? 'bg-ok/20 text-ok' : 'bg-accent/15 text-accent-soft'}`}
            >
              {done ? <BadgeCheck size={24} /> : <ProgressRing progress={progress} size={28} stroke={3} />}
            </motion.span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <motion.div className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-stage))]" style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Stat k="Verified fans" v={int(fans)} />
            <Stat k="Your access" v={lvl.priority === 'General' ? 'Fair draw' : lvl.priority} />
            <Stat k="Bots in line" v="0" accent />
          </div>
          <p className="mt-4 text-[13px] leading-snug text-fg-3">
            Everyone here passed the same identity check. Priority goes to fans with the most shows; the rest are drawn at random, so speed doesn’t matter.
          </p>
        </div>
      </div>
    </Screen>
  )
}

function Stat({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="rounded-[14px] bg-white/[0.04] px-2 py-2.5">
      <div className={`text-[16px] font-semibold tracking-[-0.01em] tabular ${accent ? 'text-ok' : ''}`}>{v}</div>
      <div className="text-[11px] text-fg-3">{k}</div>
    </div>
  )
}
