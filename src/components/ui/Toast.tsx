import { AnimatePresence, motion } from 'motion/react'
import { useUI } from '@/store/ui'
import { spring } from '@/lib/motion'

export function Toast() {
  const toast = useUI((s) => s.toast)
  return (
    <div className="pointer-events-none absolute inset-x-0 z-[90] flex justify-center" style={{ top: 'calc(var(--sat) + 50px)' }}>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.95 }}
            transition={spring.snappy}
            className={`glass hairline-2 rounded-full px-4 py-2.5 text-[14px] font-semibold shadow-[0_10px_30px_rgba(0,0,0,.5)] ${
              toast.tone === 'ok' ? 'text-ok' : toast.tone === 'err' ? 'text-err' : 'text-fg'
            }`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
