import { AnimatePresence, motion } from 'motion/react'
import { create as createQR } from 'qrcode/lib/core/qrcode'
import { useEffect, useMemo, useState } from 'react'
import { hexFrom } from '@/lib/prng'

/** Build an SVG path for a QR matrix (crisp at any size). */
export function qrPath(text: string) {
  const q = createQR(text, { errorCorrectionLevel: 'M' })
  const n = q.modules.size
  const d = q.modules.data
  let path = ''
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (d[y * n + x]) path += `M${x} ${y}h1v1h-1z`
  return { path, n }
}

export function QRMark({ text, size = 200, fg = '#0a0a0d', className = '' }: { text: string; size?: number; fg?: string; className?: string }) {
  const { path, n } = useMemo(() => qrPath(text), [text])
  return (
    <svg width={size} height={size} viewBox={`-2 -2 ${n + 4} ${n + 4}`} className={className} shapeRendering="crispEdges" aria-hidden="true">
      <path d={path} fill={fg} />
    </svg>
  )
}

/** Payload that rotates every `period` seconds and is "signed" by the owner. */
export function payloadFor(tokenId: number, owner: string, tick: number) {
  const sig = hexFrom(`${tokenId}-${owner}-${tick}`, 16)
  return { text: `fairseat://t/${tokenId}?n=${tick}&o=${owner.slice(0, 10)}&sig=${sig}`, sig }
}

export function useQrTick(period = 5, frozen = false) {
  const [tick, setTick] = useState(1)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (frozen) return
    const start = performance.now()
    let raf = 0
    const loop = () => {
      const t = (performance.now() - start) / 1000
      setTick(1 + Math.floor(t / period))
      setProgress((t % period) / period)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [period, frozen])
  return { tick, progress }
}

export function DynamicQR({
  tokenId,
  owner,
  size = 220,
  period = 5,
  frozen = false,
  frozenTick,
}: {
  tokenId: number
  owner: string
  size?: number
  period?: number
  frozen?: boolean
  frozenTick?: number
}) {
  const { tick, progress } = useQrTick(period, frozen)
  const t = frozen ? (frozenTick ?? 1) : tick
  const { text } = payloadFor(tokenId, owner, t)
  const ring = size + 36
  const r = ring / 2 - 3
  const c = 2 * Math.PI * r
  return (
    <div className="relative grid place-items-center" style={{ width: ring, height: ring }}>
      <svg width={ring} height={ring} className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx={ring / 2} cy={ring / 2} r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth={3} />
        {!frozen && (
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={r}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * progress}
          />
        )}
      </svg>
      <div className="relative overflow-hidden rounded-[22px] bg-white p-1" style={{ width: size, height: size }}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={t}
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.03, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-1"
          >
            <QRMark text={text} size={size - 8} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
