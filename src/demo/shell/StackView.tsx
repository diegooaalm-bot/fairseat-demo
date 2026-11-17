import { AnimatePresence, motion, useDragControls, type PanInfo } from 'motion/react'
import type { ReactNode } from 'react'
import { spring } from '@/lib/motion'
import { useDemo, type Role, type Route } from '@/store/demo'

/**
 * iOS navigation stack. The root stays mounted; pushed screens slide in from
 * the right, the screen underneath parallaxes and dims. Swipe from the left
 * edge to go back.
 */
export function StackView({ role, root, render }: { role: Role; root: ReactNode; render: (r: Route) => ReactNode }) {
  const stack = useDemo((s) => s.nav[role].stack)
  const pop = useDemo((s) => s.pop)
  const depth = stack.length
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Layer covered={depth > 0}>{root}</Layer>
      <AnimatePresence initial={false}>
        {stack.map((r, i) => (
          <PushedLayer key={`${i}-${r.name}-${JSON.stringify(r.params ?? {})}`} covered={i < depth - 1} onBack={() => pop(role)}>
            {render(r)}
          </PushedLayer>
        ))}
      </AnimatePresence>
    </div>
  )
}

function Layer({ covered, children }: { covered: boolean; children: ReactNode }) {
  return (
    <motion.div className="absolute inset-0" animate={{ x: covered ? '-28%' : 0 }} transition={spring.snappy}>
      {children}
      <motion.div className="pointer-events-none absolute inset-0 bg-black" animate={{ opacity: covered ? 0.35 : 0 }} transition={{ duration: 0.3 }} />
    </motion.div>
  )
}

function PushedLayer({ covered, children, onBack }: { covered: boolean; children: ReactNode; onBack: () => void }) {
  const controls = useDragControls()
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 110 || info.velocity.x > 500) onBack()
  }
  return (
    <motion.div
      className="absolute inset-0 shadow-[-20px_0_40px_rgba(0,0,0,.45)]"
      initial={{ x: '100%' }}
      animate={{ x: covered ? '-28%' : 0 }}
      exit={{ x: '100%' }}
      transition={spring.snappy}
      drag="x"
      dragListener={false}
      dragControls={controls}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 1 }}
      onDragEnd={onDragEnd}
    >
      {children}
      <motion.div className="pointer-events-none absolute inset-0 bg-black" animate={{ opacity: covered ? 0.35 : 0 }} transition={{ duration: 0.3 }} />
      {!covered && <div className="absolute top-0 bottom-0 left-0 z-50 w-5 touch-none" onPointerDown={(e) => controls.start(e)} />}
    </motion.div>
  )
}
