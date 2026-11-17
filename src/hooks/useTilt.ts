import { useMotionValue, useSpring, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'

type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> }

let permission: 'unknown' | 'granted' | 'denied' = 'unknown'

/** Ask iOS for motion access. Must run inside a tap handler. */
export async function requestMotionPermission() {
  try {
    const C = (typeof window !== 'undefined' ? window.DeviceOrientationEvent : undefined) as OrientationCtor | undefined
    if (C && typeof C.requestPermission === 'function') {
      if (permission !== 'unknown') return permission === 'granted'
      const res = await C.requestPermission()
      permission = res
      return res === 'granted'
    }
    permission = 'granted'
    return true
  } catch {
    permission = 'denied'
    return false
  }
}

/**
 * Tilt for holographic tickets. Uses device orientation when available,
 * otherwise pointer position (hover / drag). Returns springy rotateX/Y and
 * a 0..1 sheen position.
 */
export function useTilt(enabled = true, max = 12) {
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 180, damping: 20 })
  const sry = useSpring(ry, { stiffness: 180, damping: 20 })
  const sheen = useMotionValue(0.5)
  const ssheen = useSpring(sheen, { stiffness: 120, damping: 20 })
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!enabled || reduced) return
    const el = ref.current
    if (!el) return
    let base: { b: number; g: number } | null = null
    let usingGyro = false
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return
      if (!base) base = { b: e.beta, g: e.gamma }
      usingGyro = true
      const db = Math.max(-25, Math.min(25, e.beta - base.b))
      const dg = Math.max(-25, Math.min(25, e.gamma - base.g))
      rx.set((-db / 25) * max)
      ry.set((dg / 25) * max)
      sheen.set(0.5 + dg / 50)
    }
    const onMove = (e: PointerEvent) => {
      if (usingGyro) return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      if (px < -0.2 || px > 1.2 || py < -0.2 || py > 1.2) return
      ry.set((px - 0.5) * 2 * max)
      rx.set(-(py - 0.5) * 2 * max)
      sheen.set(px)
    }
    const onLeave = () => {
      if (usingGyro) return
      rx.set(0)
      ry.set(0)
      sheen.set(0.5)
    }
    if (permission === 'granted') window.addEventListener('deviceorientation', onOrient)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('pointerup', onLeave)
    return () => {
      window.removeEventListener('deviceorientation', onOrient)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('pointerup', onLeave)
    }
  }, [enabled, max, reduced, rx, ry, sheen])

  return { ref, rotateX: srx, rotateY: sry, sheen: ssheen }
}
