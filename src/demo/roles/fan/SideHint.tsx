import { AnimatePresence, motion } from 'motion/react'
import { useUI } from '@/store/ui'

/** iOS-style "Double-click to pay" hint next to the side button. */
export function SideHint() {
  const on = useUI((s) => s.sideGlow)
  const press = useUI((s) => s.pressSide)
  return (
    <AnimatePresence>
      {on && (
        <motion.button
          type="button"
          onClick={press}
          aria-label="Side button"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          className="absolute right-0 z-[70] flex items-center gap-2.5 pr-0.5"
          style={{ top: 'calc(var(--sat) + 150px)' }}
        >
          <span className="text-right text-[13px] leading-tight font-semibold text-white">
            Double-click
            <br />
            to pay
          </span>
          <motion.span
            className="h-[84px] w-[5px] rounded-l-full bg-accent"
            animate={{ x: [0, -5, 0, -5, 0, 0], opacity: [1, 1, 1, 1, 1, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity, times: [0, 0.1, 0.2, 0.3, 0.4, 1] }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
