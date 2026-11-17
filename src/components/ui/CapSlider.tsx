import { animate, AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { haptic } from '@/lib/haptics'
import { spring } from '@/lib/motion'

/**
 * The price slider that physically hits the resale cap.
 * The finger can push past the cap; the thumb rubber-bands against a wall,
 * the value never exceeds the cap, and a spring throws it back on release.
 */
export interface CapSliderProps {
  faceCents: number
  capCents: number
  minCents: number
  maxCents: number
  value: number
  onChange: (cents: number) => void
  onHitCap?: () => void
  autoDemo?: boolean
  tone?: 'dark' | 'light'
  showTicks?: boolean
  stepCents?: number
  label?: string
  faceLabel?: string
}

const THUMB = 32
const PAD = THUMB / 2
const RUBBER = 30

const rubber = (o: number) => RUBBER * (1 - 1 / ((o / RUBBER) * 0.55 + 1))

export function CapSlider({
  faceCents,
  capCents,
  minCents,
  maxCents,
  value,
  onChange,
  onHitCap,
  autoDemo = false,
  tone = 'dark',
  showTicks = true,
  stepCents = 100,
  label = 'Resale price',
  faceLabel = 'paid',
}: CapSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(300)
  const x = useMotionValue(0)
  const wallPulse = useMotionValue(0)
  const [hits, setHits] = useState(0)
  const [ghost, setGhost] = useState<{ x: number; cents: number } | null>(null)
  const dragging = useRef(false)
  const over = useRef(false)
  const reduced = useReducedMotion()

  const range = maxCents - minCents
  const posOf = useCallback((c: number) => ((c - minCents) / range) * w, [minCents, range, w])
  const capX = posOf(capCents)

  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(Math.max(10, el.offsetWidth - THUMB)))
    ro.observe(el)
    setW(Math.max(10, el.offsetWidth - THUMB))
    return () => ro.disconnect()
  }, [])

  // keep thumb in sync with external value when not dragging
  useEffect(() => {
    if (dragging.current || autoDemo) return
    x.set(posOf(value))
  }, [value, posOf, x, autoDemo])

  const hitWall = useCallback(() => {
    setHits((h) => h + 1)
    if (!autoDemo) haptic('wall')
    onHitCap?.()
    wallPulse.set(1)
    animate(wallPulse, 0, { duration: 1.4, ease: [0.16, 1, 0.3, 1] })
  }, [onHitCap, wallPulse, autoDemo])

  const toCents = (px: number) => {
    const raw = minCents + (px / w) * range
    const snapped = Math.round(raw / stepCents) * stepCents
    return Math.max(minCents, Math.min(capCents, snapped))
  }

  const localX = (clientX: number) => {
    const el = trackRef.current!
    const rect = el.getBoundingClientRect()
    const scale = rect.width / el.offsetWidth || 1
    return (clientX - rect.left) / scale - PAD
  }

  const move = (clientX: number) => {
    const lx = localX(clientX)
    if (lx > capX) {
      if (!over.current) {
        over.current = true
        hitWall()
      }
      x.set(capX + rubber(lx - capX))
      const attempted = minCents + (lx / w) * range
      setGhost({ x: Math.min(lx, w), cents: Math.round(attempted / 100) * 100 })
      if (value !== capCents) onChange(capCents)
    } else {
      over.current = false
      setGhost(null)
      const cx = Math.max(0, lx)
      x.set(cx)
      const c = toCents(cx)
      if (c !== value) {
        onChange(c)
        if (c % 500 === 0) haptic('light')
      }
    }
  }

  const release = () => {
    dragging.current = false
    setGhost(null)
    if (over.current) {
      over.current = false
      animate(x, capX, reduced ? { duration: 0 } : spring.wall)
    } else {
      animate(x, posOf(value), spring.snappy)
    }
  }

  // Autoplay loop for the landing page: approach, slam, bounce, rest.
  useEffect(() => {
    if (!autoDemo) return
    let cancelled = false
    const run = async () => {
      while (!cancelled) {
        x.set(posOf(faceCents - 500))
        onChange(faceCents - 500)
        await new Promise((r) => setTimeout(r, 700))
        if (cancelled) return
        await animate(x, capX + 22, {
          duration: 1.1,
          ease: [0.5, 0, 0.75, 0.4],
          onUpdate: (v) => onChange(toCents(Math.min(v, capX))),
        })
        if (cancelled) return
        onChange(capCents)
        setGhost({ x: Math.min(capX + 70, w), cents: 40000 })
        hitWall()
        await animate(x, capX, spring.wall)
        await new Promise((r) => setTimeout(r, 900))
        setGhost(null)
        await new Promise((r) => setTimeout(r, 1600))
      }
    }
    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDemo, capX, w])

  const fillW = useTransform(x, (v) => Math.max(0, Math.min(v, capX + RUBBER)) + PAD)
  const thumbSquish = useTransform(x, (v) => (v > capX ? 1 - Math.min(0.14, (v - capX) / 180) : 1))
  const wallGlow = useTransform(wallPulse, (p) => `0 0 ${8 + p * 26}px ${p * 6}px rgba(62,134,255,${0.15 + p * 0.55})`)
  const wallScale = useTransform(wallPulse, (p) => 1 + p * 0.22)
  const [atCap, setAtCap] = useState(false)
  useMotionValueEvent(x, 'change', (v) => setAtCap(v >= capX - 0.5))

  const light = tone === 'light'

  return (
    <div className="select-none">
      <div
        ref={trackRef}
        className="relative h-14 touch-none"
        onPointerDown={(e) => {
          if (autoDemo) return
          ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
          dragging.current = true
          haptic('light')
          move(e.clientX)
        }}
        onPointerMove={(e) => dragging.current && move(e.clientX)}
        onPointerUp={release}
        onPointerCancel={release}
      >
        {/* rail */}
        <div className={`absolute top-1/2 h-2 -translate-y-1/2 rounded-full ${light ? 'bg-black/[0.08]' : 'bg-white/[0.1]'}`} style={{ left: PAD, right: PAD }} />
        {/* forbidden zone */}
        <div
          className="absolute top-1/2 h-[18px] -translate-y-1/2 rounded-r-[9px]"
          style={{
            left: capX + PAD,
            right: PAD - 4,
            background: light
              ? 'repeating-linear-gradient(-45deg, rgba(0,0,0,.07) 0 5px, transparent 5px 10px)'
              : 'repeating-linear-gradient(-45deg, rgba(255,255,255,.07) 0 5px, transparent 5px 10px)',
          }}
        />
        {/* fill */}
        <motion.div className="absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full bg-accent" style={{ width: fillW, marginLeft: 0 }} />
        {/* the wall */}
        <motion.div
          className="absolute top-1/2 h-10 w-[3px] -translate-y-1/2 rounded-full"
          style={{
            left: capX + PAD - 1.5,
            background: atCap || hits > 0 ? 'var(--color-accent)' : light ? '#9b9ba5' : 'var(--color-fg-3)',
            boxShadow: wallGlow,
            scaleY: wallScale,
          }}
        />
        {/* ghost price: what the finger tried */}
        <AnimatePresence>
          {ghost && (
            <motion.div
              key="ghost"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute -top-6 -translate-x-1/2 rounded-full bg-err/15 px-2 py-0.5 text-[12px] font-semibold text-err line-through tabular"
              style={{ left: Math.min(ghost.x + PAD, w + PAD - 20) }}
            >
              ${(ghost.cents / 100).toFixed(0)}
            </motion.div>
          )}
        </AnimatePresence>
        {/* thumb */}
        <motion.div
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={minCents / 100}
          aria-valuemax={capCents / 100}
          aria-valuenow={value / 100}
          aria-valuetext={`$${(value / 100).toFixed(2)}`}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
              e.preventDefault()
              if (value >= capCents) {
                hitWall()
                animate(x, [capX, capX + 12, capX], { duration: 0.45, ease: 'easeOut' })
              } else onChange(Math.min(capCents, value + stepCents))
            }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
              e.preventDefault()
              onChange(Math.max(minCents, value - stepCents))
            }
            if (e.key === 'End') onChange(capCents)
            if (e.key === 'Home') onChange(minCents)
          }}
          className="absolute top-1/2 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,.45),0_0_0_0.5px_rgba(0,0,0,.08)]"
          style={{ width: THUMB, height: THUMB, marginTop: -THUMB / 2, x, scaleX: thumbSquish }}
        />
      </div>
      {showTicks && (
        <div className="relative h-5 text-[11px] font-medium tabular" style={{ marginLeft: PAD, marginRight: PAD }}>
          <span className={`absolute left-0 -translate-x-1/2 ${light ? 'text-paper-mute' : 'text-fg-3'}`}>${minCents / 100}</span>
          <span
            className={`absolute ${capX - posOf(faceCents) < 80 ? '-translate-x-full pr-2' : '-translate-x-1/2'} ${light ? 'text-paper-mute' : 'text-fg-3'}`}
            style={{ left: capX - posOf(faceCents) < 80 ? capX - 22 : posOf(faceCents) }}
          >
            ${faceCents / 100} {faceLabel}
          </span>
          <span className={`absolute -translate-x-1/2 font-semibold ${light ? 'text-accent-on-light' : 'text-accent-soft'}`} style={{ left: capX }}>
            ${capCents / 100} cap
          </span>
          <span className={`absolute right-0 translate-x-1/2 ${light ? 'text-paper-mute/60' : 'text-fg-3/60'}`}>${maxCents / 100}</span>
        </div>
      )}
    </div>
  )
}
