import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react'
import { mulberry32 } from '@/lib/prng'

/**
 * Canvas: bots (red) slam into an identity shield and shatter; verified humans
 * (blue) pass through and line up. 60fps with a few thousand particles.
 */
export interface BotShieldHandle {
  attack: (seconds?: number) => void
}

interface P {
  x: number
  y: number
  vx: number
  vy: number
  bot: boolean
  life: number
  r: number
  dead?: boolean
  passed?: boolean
}
interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

export const BotShield = forwardRef<BotShieldHandle, { onBlocked: (n: number) => void; height?: number; reduced?: boolean }>(function BotShield(
  { onBlocked, height = 250, reduced = false },
  ref,
) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const attackUntil = useRef(0)
  const blockedBuf = useRef(0)
  const cb = useRef(onBlocked)
  cb.current = onBlocked

  useImperativeHandle(ref, () => ({
    attack: (seconds = 3.2) => {
      attackUntil.current = performance.now() + seconds * 1000
    },
  }))

  useEffect(() => {
    const c = canvas.current!
    const ctx = c.getContext('2d')!
    const rnd = mulberry32(99)
    let w = 0
    let h = 0
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const resize = () => {
      w = c.offsetWidth
      h = c.offsetHeight
      c.width = w * dpr
      c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(c)

    const ps: P[] = []
    const sparks: Spark[] = []
    let last = performance.now()
    let acc = 0
    let raf = 0
    let flash = 0
    const shieldX = () => w * 0.56

    const spawn = (bot: boolean) => {
      const y = h * 0.12 + rnd() * h * 0.76
      const speed = bot ? 140 + rnd() * 200 : 70 + rnd() * 30
      const targetY = h * 0.5 + (rnd() - 0.5) * h * 0.5
      const vx = speed
      const vy = ((targetY - y) / (shieldX() + 10)) * speed * 0.6
      ps.push({ x: -8, y, vx, vy, bot, life: 1, r: bot ? 1.6 + rnd() * 1.4 : 3.2 })
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const attacking = now < attackUntil.current
      const botRate = attacking ? 900 : 9
      const humanRate = attacking ? 2.2 : 1.4
      acc += dt
      // Poisson-ish spawning
      const nb = botRate * dt
      for (let i = 0; i < Math.floor(nb) + (rnd() < nb % 1 ? 1 : 0); i++) spawn(true)
      if (rnd() < humanRate * dt) spawn(false)

      ctx.clearRect(0, 0, w, h)
      const sx = shieldX()

      // shield glow
      flash = Math.max(0, flash - dt * 2.5)
      const g = ctx.createLinearGradient(sx - 40, 0, sx + 8, 0)
      g.addColorStop(0, 'rgba(62,134,255,0)')
      g.addColorStop(1, `rgba(62,134,255,${0.16 + flash * 0.35})`)
      ctx.fillStyle = g
      ctx.fillRect(sx - 40, 0, 48, h)
      ctx.fillStyle = `rgba(140,190,255,${0.75 + flash * 0.25})`
      ctx.fillRect(sx, h * 0.06, 2.5, h * 0.88)
      ctx.shadowColor = 'rgba(62,134,255,.9)'
      ctx.shadowBlur = 14 + flash * 24
      ctx.fillRect(sx, h * 0.06, 2.5, h * 0.88)
      ctx.shadowBlur = 0

      // particles
      let blocked = 0
      for (const p of ps) {
        if (p.dead) continue
        p.x += p.vx * dt
        p.y += p.vy * dt
        if (p.bot && p.x >= sx - p.r) {
          p.dead = true
          blocked++
          for (let k = 0; k < (attacking ? 1 : 4); k++)
            sparks.push({ x: sx - 2, y: p.y, vx: -40 - rnd() * 140, vy: (rnd() - 0.5) * 160, life: 1 })
          continue
        }
        if (!p.bot && p.x > sx && !p.passed) p.passed = true
        if (!p.bot && p.passed) {
          // drift into the queue line on the right
          const ty = h * 0.5
          p.vy += (ty - p.y) * dt * 3
          p.vy *= 0.92
          p.vx = Math.max(40, p.vx * 0.995)
        }
        if (p.x > w + 10) p.dead = true
        if (p.bot) {
          ctx.fillStyle = 'rgba(255,82,72,.9)'
          ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2)
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = '#8db8ff'
          ctx.shadowColor = 'rgba(62,134,255,.9)'
          ctx.shadowBlur = 10
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }
      for (const s of sparks) {
        s.x += s.vx * dt
        s.y += s.vy * dt
        s.life -= dt * 2.4
        if (s.life <= 0) continue
        ctx.fillStyle = `rgba(255,140,120,${s.life * 0.8})`
        ctx.fillRect(s.x, s.y, 1.6, 1.6)
      }
      // compact arrays
      if (ps.length > 1500) {
        const alive = ps.filter((p) => !p.dead)
        ps.length = 0
        ps.push(...alive)
      }
      if (sparks.length > 1500) {
        const alive = sparks.filter((s) => s.life > 0)
        sparks.length = 0
        sparks.push(...alive)
      }
      if (blocked) {
        flash = Math.min(1, flash + blocked * 0.02)
        blockedBuf.current += blocked
      }
      if (acc > 0.1) {
        acc = 0
        if (blockedBuf.current) {
          cb.current(blockedBuf.current)
          blockedBuf.current = 0
        }
      }
      raf = requestAnimationFrame(tick)
    }
    if (!reduced) raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [reduced])

  return <canvas ref={canvas} className="block w-full" style={{ height }} aria-hidden="true" />
})
