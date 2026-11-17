import { useEffect, useRef } from 'react'
import { mulberry32 } from '@/lib/prng'

/**
 * 20,000 seats arranged like an arena, lighting up in a wave from the stage.
 * Draws incrementally so only newly issued seats are painted each frame.
 */
export function IssueCanvas({ total = 20000, duration = 2600, onProgress, onDone, run }: { total?: number; duration?: number; onProgress: (n: number) => void; onDone: () => void; run: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const cbs = useRef({ onProgress, onDone })
  cbs.current = { onProgress, onDone }
  useEffect(() => {
    const c = ref.current!
    const ctx = c.getContext('2d')!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = c.offsetWidth
    const h = c.offsetHeight
    c.width = w * dpr
    c.height = h * dpr
    ctx.scale(dpr, dpr)
    const cx = w / 2
    const cy = h * 0.14
    const rMin = h * 0.2
    const rMax = Math.min(w / 2 - 4, h * 0.84)
    const rings = 64
    const r = mulberry32(3)
    // build seats on arcs so that the count is exactly `total`
    const seats: { x: number; y: number; t: number }[] = []
    const ringLen: number[] = []
    let lenSum = 0
    for (let i = 0; i < rings; i++) {
      const rr = rMin + ((rMax - rMin) * i) / (rings - 1)
      ringLen.push(rr)
      lenSum += rr
    }
    let made = 0
    for (let i = 0; i < rings; i++) {
      const n = i === rings - 1 ? total - made : Math.round((ringLen[i] / lenSum) * total)
      made += n
      for (let k = 0; k < n; k++) {
        const a = (4 + (172 * (k + 0.5)) / n) * (Math.PI / 180)
        const x = cx + ringLen[i] * Math.cos(a)
        const y = cy + ringLen[i] * Math.sin(a)
        // wave: from stage outward, with jitter
        const t = (i / rings) * 0.75 + r() * 0.25
        seats.push({ x, y, t })
      }
    }
    seats.sort((a, b) => a.t - b.t)
    // base layer: dim seats
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    for (const s of seats) ctx.fillRect(s.x - 0.7, s.y - 0.7, 1.4, 1.4)
    // stage
    ctx.fillStyle = 'rgba(90,200,250,.5)'
    ctx.fillRect(cx - w * 0.16, cy - h * 0.1, w * 0.32, h * 0.05)
    if (!run) {
      // already issued: draw the final, fully lit arena
      for (let i = 0; i < seats.length; i++) {
        const s = seats[i]
        ctx.fillStyle = i % 9 === 0 ? '#bcd6ff' : '#3e86ff'
        ctx.fillRect(s.x - 0.8, s.y - 0.8, 1.6, 1.6)
      }
      return
    }
    let lit = 0
    let raf = 0
    const start = performance.now()
    const loop = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 2.2)
      const target = Math.floor(eased * seats.length)
      for (; lit < target; lit++) {
        const s = seats[lit]
        ctx.fillStyle = lit % 9 === 0 ? '#bcd6ff' : '#3e86ff'
        ctx.fillRect(s.x - 0.8, s.y - 0.8, 1.6, 1.6)
      }
      cbs.current.onProgress(lit)
      if (p < 1) raf = requestAnimationFrame(loop)
      else cbs.current.onDone()
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [run, total, duration])
  return <canvas ref={ref} className="block h-[220px] w-full" aria-hidden="true" />
}
