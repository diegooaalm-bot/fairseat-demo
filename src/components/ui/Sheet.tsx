import { AnimatePresence, motion, useDragControls, type PanInfo } from 'motion/react'
import type { ReactNode } from 'react'
import { spring } from '@/lib/motion'

/** iOS-style bottom sheet. Lives inside the phone screen (absolute), draggable to dismiss. */
export function Sheet({
  open,
  onClose,
  children,
  title,
  dismissible = true,
  className = '',
  tone = 'dark',
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: ReactNode
  dismissible?: boolean
  className?: string
  tone?: 'dark' | 'light'
}) {
  const controls = useDragControls()
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (!dismissible) return
    if (info.offset.y > 110 || info.velocity.y > 600) onClose()
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-50" initial="hidden" animate="shown" exit="hidden">
          <motion.div
            className="absolute inset-0 bg-black/55"
            variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
            transition={{ duration: 0.25 }}
            onClick={() => dismissible && onClose()}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`absolute inset-x-0 bottom-0 rounded-t-[34px] pb-[max(var(--sab),16px)] ${
              tone === 'dark' ? 'bg-ink-3 text-fg shadow-[0_-20px_60px_-20px_rgba(0,0,0,.8)] hairline' : 'bg-paper text-paper-ink'
            } ${className}`}
            variants={{ hidden: { y: '100%' }, shown: { y: 0 } }}
            transition={spring.sheet}
            drag={dismissible ? 'y' : false}
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.7 }}
            onDragEnd={onDragEnd}
          >
            <div className="flex touch-none justify-center pt-2 pb-1" onPointerDown={(e) => dismissible && controls.start(e)}>
              <div className={`h-[5px] w-9 rounded-full ${tone === 'dark' ? 'bg-white/25' : 'bg-black/20'}`} />
            </div>
            {title && (
              <div className="touch-none px-5 pt-1 pb-3" onPointerDown={(e) => dismissible && controls.start(e)}>
                {title}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
