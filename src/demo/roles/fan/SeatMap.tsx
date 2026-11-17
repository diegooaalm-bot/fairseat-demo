import { motion } from 'motion/react'
import { memo, useMemo } from 'react'
import { mulberry32 } from '@/lib/prng'
import { spring } from '@/lib/motion'

/* ───────── Arena geometry (Peachtree Arena, fictional) ───────── */
const CX = 170
const CY = 54
interface Section {
  id: string
  tier: 'Lower bowl' | 'Upper bowl' | 'Floor'
  d: string
  label: [number, number]
  avail: number // 0..1 share of seats left
}

const rad = (a: number) => (a * Math.PI) / 180
function sector(r1: number, r2: number, a1: number, a2: number) {
  const p = (r: number, a: number) => `${(CX + r * Math.cos(rad(a))).toFixed(2)} ${(CY + r * Math.sin(rad(a))).toFixed(2)}`
  const large = a2 - a1 > 180 ? 1 : 0
  return `M${p(r2, a1)} A${r2} ${r2} 0 ${large} 1 ${p(r2, a2)} L${p(r1, a2)} A${r1} ${r1} 0 ${large} 0 ${p(r1, a1)} Z`
}

export const SECTIONS: Section[] = (() => {
  const r = mulberry32(7)
  const out: Section[] = []
  const lower = 14
  for (let i = 0; i < lower; i++) {
    const a1 = 6 + (i * 168) / lower
    const a2 = 6 + ((i + 1) * 168) / lower
    const mid = rad((a1 + a2) / 2)
    const id = String(101 + i)
    const avail = id === '112' ? 0.06 : r() < 0.35 ? 0 : 0.01 + r() * 0.07
    out.push({ id, tier: 'Lower bowl', d: sector(96, 130, a1 + 0.7, a2 - 0.7), label: [CX + 113 * Math.cos(mid), CY + 113 * Math.sin(mid)], avail })
  }
  const upper = 12
  for (let i = 0; i < upper; i++) {
    const a1 = 4 + (i * 172) / upper
    const a2 = 4 + ((i + 1) * 172) / upper
    const mid = rad((a1 + a2) / 2)
    const id = String(201 + i)
    const avail = r() < 0.3 ? 0 : 0.02 + r() * 0.1
    out.push({ id, tier: 'Upper bowl', d: sector(137, 168, a1 + 0.6, a2 - 0.6), label: [CX + 152.5 * Math.cos(mid), CY + 152.5 * Math.sin(mid)], avail })
  }
  return out
})()

export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id)

export const SeatMap = memo(function SeatMap({
  selected,
  onSelect,
  interactive = true,
  className = '',
  pulse,
}: {
  selected?: string | null
  onSelect?: (id: string) => void
  interactive?: boolean
  className?: string
  pulse?: string
}) {
  return (
    <svg viewBox="0 0 340 236" className={`w-full ${className}`} role="img" aria-label="Peachtree Arena seating map">
      <defs>
        <linearGradient id="stageG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5AC8FA" stopOpacity=".55" />
          <stop offset="1" stopColor="#3E86FF" stopOpacity=".05" />
        </linearGradient>
      </defs>
      {/* stage + floor */}
      <path d={`M${CX - 70} 8 h140 v22 a6 6 0 0 1 -6 6 h-128 a6 6 0 0 1 -6 -6z`} fill="url(#stageG)" />
      <text x={CX} y={25} textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="2" fill="rgba(255,255,255,.75)">
        STAGE
      </text>
      <rect x={CX - 62} y={44} width={124} height={44} rx={8} fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.08)" />
      <text x={CX} y={70} textAnchor="middle" fontSize="8.5" fontWeight="600" fill="rgba(255,255,255,.35)">
        FLOOR · SOLD OUT
      </text>
      {SECTIONS.map((s) => {
        const sold = s.avail === 0
        const isSel = selected === s.id
        const fill = isSel ? 'var(--color-accent)' : sold ? 'rgba(255,255,255,.05)' : `rgba(62,134,255,${0.18 + s.avail * 4})`
        return (
          <g key={s.id}>
            <motion.path
              d={s.d}
              fill={fill}
              stroke={isSel ? '#fff' : 'rgba(255,255,255,.07)'}
              strokeWidth={isSel ? 1.5 : 0.8}
              style={{ cursor: interactive && !sold ? 'pointer' : 'default' }}
              onClick={() => interactive && !sold && onSelect?.(s.id)}
              whileTap={interactive && !sold ? { scale: 0.97 } : undefined}
              animate={pulse === s.id && !isSel ? { opacity: [1, 0.55, 1] } : { opacity: 1 }}
              transition={pulse === s.id ? { duration: 1.4, repeat: Infinity } : spring.snappy}
            />
            <text
              x={s.label[0]}
              y={s.label[1] + 3}
              textAnchor="middle"
              fontSize={s.tier === 'Upper bowl' ? 7.5 : 8}
              fontWeight="700"
              fill={isSel ? '#fff' : sold ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.8)'}
              pointerEvents="none"
            >
              {s.id}
            </text>
          </g>
        )
      })}
    </svg>
  )
})

/* ───────── Seats inside a section ───────── */
export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
export const SEATS_PER_ROW = 12

export function useTakenSeats(section: string) {
  return useMemo(() => {
    const r = mulberry32(section.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7))
    const taken = new Set<string>()
    for (const row of ROWS)
      for (let n = 1; n <= SEATS_PER_ROW; n++) {
        const key = `${row}-${n}`
        if (section === '112' && row === 'F' && n >= 5 && n <= 10) continue
        if (r() < 0.86) taken.add(key)
      }
    return taken
  }, [section])
}

export function SeatGrid({
  section,
  selected,
  onToggle,
  shakeKey,
  suggest,
}: {
  section: string
  selected: string[]
  onToggle: (key: string) => void
  shakeKey?: { key: string; n: number } | null
  suggest?: string
}) {
  const taken = useTakenSeats(section)
  return (
    <div className="flex flex-col gap-[7px]">
      {ROWS.map((row) => (
        <div key={row} className="flex items-center gap-2">
          <span className="w-4 text-center text-[11px] font-semibold text-fg-3">{row}</span>
          <div className="flex flex-1 justify-between">
            {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
              const n = i + 1
              const key = `${row}-${n}`
              const isTaken = taken.has(key)
              const isSel = selected.includes(key)
              const shaking = shakeKey?.key === key
              return (
                <motion.button
                  key={shaking ? `${key}-${shakeKey!.n}` : key}
                  aria-label={`Row ${row} seat ${n}${isTaken ? ', taken' : ''}`}
                  disabled={isTaken}
                  onClick={() => onToggle(key)}
                  whileTap={!isTaken ? { scale: 0.8 } : undefined}
                  animate={
                    shaking
                      ? { x: [0, -7, 6, -4, 3, 0], transition: { duration: 0.45 } }
                      : { scale: isSel ? 1.12 : 1, x: 0 }
                  }
                  transition={spring.wall}
                  className={`relative grid h-[22px] w-[22px] place-items-center rounded-[7px] text-[9px] font-bold transition-colors ${
                    isTaken
                      ? 'bg-white/[0.06]'
                      : isSel
                        ? 'bg-accent-fill text-white shadow-[0_0_12px_rgba(62,134,255,.7)]'
                        : shaking
                          ? 'bg-err/40'
                          : suggest === key
                            ? 'bg-accent/35 ring-2 ring-accent'
                            : 'bg-accent/25 hover:bg-accent/45'
                  }`}
                >
                  {isSel ? n : ''}
                </motion.button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
