import { animate, useInView, useMotionValue, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'

/** Animated number. Writes text directly to the DOM to stay at 60fps. */
export function NumberTicker({
  value,
  format,
  duration = 0.9,
  from,
  className = '',
  startOnView = false,
}: {
  value: number
  format: (n: number) => string
  duration?: number
  from?: number
  className?: string
  startOnView?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const mv = useMotionValue(from ?? value)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduced = useReducedMotion()

  useEffect(() => {
    const unsub = mv.on('change', (v) => {
      if (ref.current) ref.current.textContent = format(v)
    })
    return unsub
  }, [mv, format])

  useEffect(() => {
    if (startOnView && !inView) return
    if (reduced) {
      mv.set(value)
      if (ref.current) ref.current.textContent = format(value)
      return
    }
    const c = animate(mv, value, { duration, ease: [0.16, 1, 0.3, 1] })
    return () => c.stop()
  }, [value, inView, startOnView, duration, mv, reduced, format])

  return (
    <span ref={ref} className={`tabular ${className}`}>
      {format(startOnView ? (from ?? value) : mv.get())}
    </span>
  )
}
