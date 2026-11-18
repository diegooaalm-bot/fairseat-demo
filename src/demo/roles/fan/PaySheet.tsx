import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { Mark } from '@/components/brand/Logo'
import { FaceID } from '@/components/ui/FaceID'
import { Sheet } from '@/components/ui/Sheet'
import { haptic } from '@/lib/haptics'
import { usd } from '@/lib/money'
import { spring } from '@/lib/motion'
import { useUI } from '@/store/ui'

export interface PayLine {
  k: ReactNode
  v: ReactNode
  muted?: boolean
}

/**
 * iOS-style payment sheet. No real brands: a generic card.
 * Confirm by double-clicking the side button (the frame's button on desktop,
 * or double-tapping the side-button hint on a phone).
 */
export function PaySheet({
  open,
  onClose,
  item,
  lines,
  totalCents,
  onPaid,
}: {
  open: boolean
  onClose: () => void
  item: { title: string; sub: string; art?: ReactNode }
  lines: PayLine[]
  totalCents: number
  onPaid: () => void
}) {
  const [phase, setPhase] = useState<'confirm' | 'auth' | 'done'>('confirm')
  const setGlow = useUI((s) => s.setSideGlow)
  const sidePress = useUI((s) => s.sidePress)
  const lastPress = useRef(0)
  const lastTap = useRef(0)

  useEffect(() => {
    if (open) setPhase('confirm')
  }, [open])
  useEffect(() => {
    setGlow(open && phase === 'confirm')
    return () => setGlow(false)
  }, [open, phase, setGlow])

  const pay = () => {
    if (phase !== 'confirm') return
    haptic('medium')
    setPhase('auth')
    setTimeout(() => {
      setPhase('done')
      haptic('success')
    }, 1100)
    setTimeout(() => onPaid(), 1900)
  }

  // frame side button: two presses within 650ms
  useEffect(() => {
    if (!open || !sidePress) return
    const now = performance.now()
    if (now - lastPress.current < 650) pay()
    lastPress.current = now
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidePress])

  const onHintTap = () => {
    const now = performance.now()
    haptic('light')
    if (now - lastTap.current < 450) pay()
    lastTap.current = now
  }

  return (
    <Sheet open={open} onClose={() => phase === 'confirm' && onClose()} dismissible={phase === 'confirm'}>
      <div className="relative px-5 pb-3">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
            <Mark size={22} className="text-accent" /> Proof of Seat
          </div>
          <button onClick={onClose} disabled={phase !== 'confirm'} className="text-[17px] text-accent-soft disabled:opacity-30">
            Cancel
          </button>
        </div>

        {/* card */}
        <div className="flex items-center gap-3 rounded-[16px] bg-white/[0.05] p-3 hairline">
          <span className="relative h-[38px] w-[58px] shrink-0 overflow-hidden rounded-[7px] bg-[linear-gradient(135deg,#3e86ff,#7c6bff_60%,#5ac8fa)] shadow-[inset_0_0_0_1px_rgba(255,255,255,.25)]">
            <span className="absolute top-2 left-2 h-[7px] w-[10px] rounded-[2px] bg-[#f2d38a]/90" />
            <span className="absolute right-2 bottom-1.5 text-[7px] font-bold text-white/90">DEBIT</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">Everyday Debit</span>
            <span className="block text-[13px] text-fg-3">•••• 4242</span>
          </span>
        </div>

        {/* item */}
        <div className="mt-3 flex items-center gap-3 px-1 py-2">
          {item.art}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold">{item.title}</span>
            <span className="block truncate text-[13px] text-fg-3">{item.sub}</span>
          </span>
        </div>
        <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {lines.map((l, i) => (
            <div key={i} className={`flex items-center justify-between py-2.5 text-[15px] ${l.muted ? 'text-fg-3' : ''}`}>
              <span className={l.muted ? '' : 'text-fg-2'}>{l.k}</span>
              <span className="tabular">{l.v}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3">
          <span className="text-[17px] text-fg-2">Pay Proof of Seat</span>
          <span className="text-[24px] font-bold tracking-[-0.02em] tabular">{usd(totalCents)}</span>
        </div>
        <div className="pb-2 text-[11px] text-fg-3">Simulated payment for a class demo · no real charge</div>

        {/* confirm area */}
        <div className="relative mt-1 grid h-[118px] place-items-center">
          <AnimatePresence mode="wait">
            {phase === 'confirm' && (
              <motion.button
                key="confirm"
                type="button"
                onClick={onHintTap}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-2"
                aria-label="Double-tap to confirm payment"
              >
                <motion.span
                  className="grid h-[56px] w-[56px] place-items-center rounded-full bg-accent/15 text-accent"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <FaceID state="idle" size={34} />
                </motion.span>
                <span className="text-[15px] font-semibold text-accent-soft">Double-click to pay</span>
                <span className="text-[12px] text-fg-3">Side button, or double-tap here</span>
              </motion.button>
            )}
            {phase === 'auth' && (
              <motion.div key="auth" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
                <FaceID state="scan" size={56} />
                <span className="text-[14px] text-fg-2">Face ID</span>
              </motion.div>
            )}
            {phase === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={spring.wall} className="flex flex-col items-center gap-2">
                <span className="grid h-[56px] w-[56px] place-items-center rounded-full bg-ok text-white">
                  <Check size={32} strokeWidth={3} />
                </span>
                <span className="text-[15px] font-semibold">Done</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Sheet>
  )
}
