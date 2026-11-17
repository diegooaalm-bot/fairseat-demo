import { memo, useMemo } from 'react'
import { mulberry32 } from '@/lib/prng'
import type { EventInfo } from '@/data/world'

/**
 * Generative cover art for an event: layered gradient light + one geometric
 * motif per artist. No photos, no people, identical on every run.
 */
export const EventArt = memo(function EventArt({ event, className = '', intensity = 1 }: { event: EventInfo; className?: string; intensity?: number }) {
  const [a, b, c, base] = event.palette
  const r = useMemo(() => mulberry32(event.seed), [event.seed])
  const shapes = useMemo(() => motif(event.art, r, a, c), [event.art, r, a, c])
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={{ background: base }} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          opacity: intensity,
          background: `
            radial-gradient(60% 80% at 82% 12%, ${a} 0%, transparent 62%),
            radial-gradient(70% 90% at 8% 100%, ${b} 0%, transparent 60%),
            radial-gradient(38% 50% at 45% 58%, ${c}aa 0%, transparent 70%)`,
        }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`beam-${event.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {shapes}
      </svg>
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  )
})

function motif(kind: EventInfo['art'], r: () => number, a: string, c: string) {
  switch (kind) {
    case 'beams': {
      const origin = 300 + r() * 40
      return Array.from({ length: 7 }, (_, i) => {
        const spread = -160 + i * 62 + r() * 20
        const width = 14 + r() * 26
        return (
          <polygon
            key={i}
            points={`${origin},-20 ${origin + spread - width},270 ${origin + spread + width},270`}
            fill="url(#beam-nova)"
            opacity={0.18 + r() * 0.14}
          />
        )
      })
    }
    case 'rings': {
      const cx = 300 + r() * 40
      const cy = 60 + r() * 40
      return Array.from({ length: 16 }, (_, i) => (
        <circle key={i} cx={cx} cy={cy} r={14 + i * 16} fill="none" stroke="#fff" strokeOpacity={0.24 - i * 0.012} strokeWidth={1} />
      ))
    }
    case 'waves':
      return Array.from({ length: 11 }, (_, i) => {
        const y = 70 + i * 16
        const amp = 10 + r() * 14
        const ph = r() * 80
        let d = `M -10 ${y}`
        for (let x = -10; x <= 410; x += 20) d += ` L ${x} ${y + Math.sin((x + ph) / 38) * amp}`
        return <path key={i} d={d} fill="none" stroke={i % 3 === 0 ? c : '#fff'} strokeOpacity={0.28 - i * 0.015} strokeWidth={1.2} />
      })
    case 'grid': {
      const lines = []
      const hz = 120
      for (let i = -12; i <= 12; i++) lines.push(<line key={`v${i}`} x1={200 + i * 8} y1={hz} x2={200 + i * 60} y2={260} stroke="#fff" strokeOpacity={0.18} strokeWidth={0.8} />)
      for (let j = 0; j < 9; j++) {
        const y = hz + Math.pow(j / 8, 1.8) * 140
        lines.push(<line key={`h${j}`} x1={0} y1={y} x2={400} y2={y} stroke="#fff" strokeOpacity={0.1 + j * 0.015} strokeWidth={0.8} />)
      }
      lines.push(<circle key="sun" cx={200} cy={hz - 4} r={46} fill={a} opacity={0.55} />)
      return lines
    }
    case 'orbits':
      return Array.from({ length: 6 }, (_, i) => (
        <g key={i} transform={`rotate(${-20 + i * 9} 290 90)`}>
          <ellipse cx={290} cy={90} rx={50 + i * 26} ry={18 + i * 10} fill="none" stroke="#fff" strokeOpacity={0.26 - i * 0.03} strokeWidth={1} />
          <circle cx={290 + (50 + i * 26) * Math.cos(r() * 6.28)} cy={90 + (18 + i * 10) * Math.sin(r() * 6.28)} r={2.4} fill="#fff" opacity={0.8} />
        </g>
      ))
  }
}
