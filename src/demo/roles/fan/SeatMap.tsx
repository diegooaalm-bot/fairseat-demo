import { motion } from 'motion/react'
import { memo, useMemo } from 'react'
import { LEVEL_COLORS, type EventInfo, type LevelId, type VenueId } from '@/data/world'
import { mulberry32 } from '@/lib/prng'
import { spring } from '@/lib/motion'

/**
 * Seating maps drawn from each venue's general layout (approximate, for the demo):
 * Mercedes-Benz Stadium (end-stage concert setup) and State Farm Arena.
 */
export interface Section {
  id: string
  level: LevelId
  d: string
  label: [number, number]
  avail: number // 0..1 share of seats left (0 = sold out)
  blocked?: boolean // behind the stage
  font: number
}

const rad = (a: number) => (a * Math.PI) / 180

/* ───────── Mercedes-Benz Stadium ───────── */
const MC = { x: 180, y: 150 }
const N = 4 // superellipse exponent: a rounded-rectangle bowl
function sePoint(a: number, b: number, deg: number): [number, number] {
  const t = rad(deg)
  const c = Math.cos(t)
  const s = Math.sin(t)
  return [MC.x + a * Math.sign(c) * Math.abs(c) ** (2 / N), MC.y + b * Math.sign(s) * Math.abs(s) ** (2 / N)]
}
function ringSection(inner: [number, number], outer: [number, number], d1: number, d2: number) {
  const steps = 6
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) pts.push(sePoint(outer[0], outer[1], d1 + ((d2 - d1) * i) / steps).map((v) => v.toFixed(1)).join(' '))
  for (let i = steps; i >= 0; i--) pts.push(sePoint(inner[0], inner[1], d1 + ((d2 - d1) * i) / steps).map((v) => v.toFixed(1)).join(' '))
  return 'M' + pts.join(' L') + ' Z'
}

function mbsSections(): Section[] {
  const r = mulberry32(17)
  const out: Section[] = []
  const rings: { level: LevelId; base: number; n: number; inner: [number, number]; outer: [number, number]; font: number }[] = [
    { level: '100', base: 101, n: 32, inner: [56, 82], outer: [77, 103], font: 5.6 },
    { level: '200', base: 201, n: 28, inner: [81, 107], outer: [95, 121], font: 5 },
    { level: '300', base: 301, n: 36, inner: [99, 125], outer: [127, 147], font: 6 },
  ]
  for (const ring of rings) {
    const span = 360 / ring.n
    for (let i = 0; i < ring.n; i++) {
      const d1 = -90 + i * span + 0.6
      const d2 = -90 + (i + 1) * span - 0.6
      const mid = (d1 + d2) / 2
      const dTop = (((mid + 90) % 360) + 360) % 360
      const blocked = dTop < 26 || dTop > 334 // behind the stage end
      const id = String(ring.base + i)
      const mr: [number, number] = [(ring.inner[0] + ring.outer[0]) / 2, (ring.inner[1] + ring.outer[1]) / 2]
      let avail = blocked ? 0 : r() < 0.3 ? 0 : 0.02 + r() * 0.1
      if (id === '312' || id === '118') avail = 0.07
      out.push({ id, level: ring.level, d: ringSection(ring.inner, ring.outer, d1, d2), label: sePoint(mr[0], mr[1], mid), avail, blocked, font: ring.font })
    }
  }
  // floor: six reserved blocks in front of the stage
  const fx = MC.x - 40
  const fy = MC.y - 38
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 2; col++) {
      const x = fx + col * 41
      const y = fy + row * 33
      const id = `F${row * 2 + col + 1}`
      out.push({ id, level: 'floor', d: `M${x} ${y} h38 v30 h-38 Z`, label: [x + 19, y + 17], avail: row === 0 ? 0 : 0.03 + r() * 0.04, font: 7 })
    }
  return out
}

/* ───────── State Farm Arena (end stage) ───────── */
const AC = { x: 170, y: 54 }
function arcSection(r1: number, r2: number, a1: number, a2: number) {
  const p = (r: number, a: number) => `${(AC.x + r * Math.cos(rad(a))).toFixed(1)} ${(AC.y + r * Math.sin(rad(a))).toFixed(1)}`
  return `M${p(r2, a1)} A${r2} ${r2} 0 0 1 ${p(r2, a2)} L${p(r1, a2)} A${r1} ${r1} 0 0 0 ${p(r1, a1)} Z`
}
function sfaSections(): Section[] {
  const r = mulberry32(7)
  const out: Section[] = []
  const lower = 14
  for (let i = 0; i < lower; i++) {
    const a1 = 6 + (i * 168) / lower
    const a2 = 6 + ((i + 1) * 168) / lower
    const mid = rad((a1 + a2) / 2)
    out.push({ id: String(101 + i), level: '100', d: arcSection(96, 130, a1 + 0.7, a2 - 0.7), label: [AC.x + 113 * Math.cos(mid), AC.y + 113 * Math.sin(mid)], avail: r() < 0.35 ? 0 : 0.01 + r() * 0.07, font: 8 })
  }
  const upper = 12
  for (let i = 0; i < upper; i++) {
    const a1 = 4 + (i * 172) / upper
    const a2 = 4 + ((i + 1) * 172) / upper
    const mid = rad((a1 + a2) / 2)
    out.push({ id: String(201 + i), level: '200', d: arcSection(137, 168, a1 + 0.6, a2 - 0.6), label: [AC.x + 152.5 * Math.cos(mid), AC.y + 152.5 * Math.sin(mid)], avail: r() < 0.3 ? 0 : 0.02 + r() * 0.1, font: 7.5 })
  }
  out.push({ id: 'FLR', level: 'floor', d: `M${AC.x - 62} 44 h124 v44 a8 8 0 0 1 -8 8 h-108 a8 8 0 0 1 -8 -8 Z`, label: [AC.x, 72], avail: 0.03, font: 8 })
  return out
}

const CACHE: Partial<Record<VenueId, Section[]>> = {}
export function sectionsFor(v: VenueId): Section[] {
  return (CACHE[v] ??= v === 'mbs' ? mbsSections() : sfaSections())
}
export const sectionById = (v: VenueId, id: string) => sectionsFor(v).find((s) => s.id === id)

export function levelPrice(ev: EventInfo, level: LevelId) {
  return ev.levels.find((l) => l.id === level)?.cents ?? ev.faceCents
}

export const VenueMap = memo(function VenueMap({
  event,
  selected,
  onSelect,
  interactive = true,
  className = '',
  pulse,
}: {
  event: EventInfo
  selected?: string | null
  onSelect?: (id: string) => void
  interactive?: boolean
  className?: string
  pulse?: string
}) {
  const v = event.venueId ?? 'mbs'
  const sections = sectionsFor(v)
  const isMbs = v === 'mbs'
  return (
    <svg viewBox={isMbs ? '0 0 360 300' : '0 0 340 236'} className={`w-full ${className}`} role="img" aria-label={`${event.venue} seating map`}>
      {isMbs ? (
        <>
          <rect x={MC.x - 48} y={MC.y - 76} width={96} height={152} rx={10} fill="rgba(80,170,110,.10)" stroke="rgba(255,255,255,.08)" />
          <rect x={MC.x - 40} y={MC.y - 70} width={80} height={24} rx={4} fill="rgba(255,255,255,.14)" />
          <text x={MC.x} y={MC.y - 54.5} textAnchor="middle" fontSize="8" fontWeight="700" letterSpacing="2" fill="rgba(255,255,255,.8)">
            STAGE
          </text>
        </>
      ) : (
        <>
          <path d={`M${AC.x - 70} 8 h140 v22 a6 6 0 0 1 -6 6 h-128 a6 6 0 0 1 -6 -6z`} fill="rgba(255,255,255,.14)" />
          <text x={AC.x} y={25} textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="2" fill="rgba(255,255,255,.8)">
            STAGE
          </text>
        </>
      )}
      {sections.map((s) => {
        const sold = s.avail === 0
        const isSel = selected === s.id
        const color = LEVEL_COLORS[s.level]
        const priced = event.levels.some((l) => l.id === s.level)
        const fill = isSel ? color : sold || !priced ? 'rgba(255,255,255,.06)' : color
        const opacity = isSel ? 1 : sold || !priced ? 1 : 0.42 + s.avail * 4
        return (
          <g key={s.id}>
            <motion.path
              d={s.d}
              fill={fill}
              fillOpacity={opacity}
              stroke={isSel ? '#fff' : 'rgba(10,10,13,.9)'}
              strokeWidth={isSel ? 1.4 : 0.6}
              style={{ cursor: interactive && !sold ? 'pointer' : 'default' }}
              onClick={() => interactive && !sold && priced && onSelect?.(s.id)}
              animate={pulse === s.id && !isSel ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
              transition={pulse === s.id ? { duration: 1.4, repeat: Infinity } : spring.snappy}
            />
            {!s.blocked && (
              <text
                x={s.label[0]}
                y={s.label[1] + s.font * 0.36}
                textAnchor="middle"
                fontSize={s.font}
                fontWeight="700"
                fill={isSel ? '#0a0a0d' : sold ? 'rgba(255,255,255,.22)' : 'rgba(10,10,13,.82)'}
                pointerEvents="none"
              >
                {s.id}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
})

/* ───────── Seats inside a section ───────── */
export const SEATS_PER_ROW = 12
export function rowsFor(level: LevelId): string[] {
  const start = level === 'floor' ? 1 : level === '100' ? 15 : level === '200' ? 5 : 10
  return Array.from({ length: 8 }, (_, i) => String(start + i))
}

export function useTakenSeats(eventId: string, section: string, rows: string[]) {
  return useMemo(() => {
    const r = mulberry32((eventId + section).split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7))
    const taken = new Set<string>()
    for (const row of rows)
      for (let n = 1; n <= SEATS_PER_ROW; n++) {
        const key = `${row}-${n}`
        if (section === '312' && row === '14' && n >= 5 && n <= 10) continue
        if (r() < 0.84) taken.add(key)
      }
    return taken
  }, [eventId, section, rows])
}

export function SeatGrid({
  eventId,
  section,
  level,
  selected,
  onToggle,
  shakeKey,
  suggest,
}: {
  eventId: string
  section: string
  level: LevelId
  selected: string[]
  onToggle: (key: string) => void
  shakeKey?: { key: string; n: number } | null
  suggest?: string
}) {
  const rows = useMemo(() => rowsFor(level), [level])
  const taken = useTakenSeats(eventId, section, rows)
  const color = LEVEL_COLORS[level]
  return (
    <div className="flex flex-col gap-[7px]">
      {rows.map((row) => (
        <div key={row} className="flex items-center gap-2">
          <span className="w-5 text-right text-[11px] font-semibold text-fg-3 tabular">{row}</span>
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
                  animate={shaking ? { x: [0, -7, 6, -4, 3, 0], transition: { duration: 0.45 } } : { scale: isSel ? 1.12 : 1, x: 0 }}
                  transition={spring.wall}
                  className={`relative grid h-[22px] w-[22px] place-items-center rounded-[6px] text-[9px] font-bold transition-colors ${
                    isTaken ? 'bg-white/[0.06]' : isSel ? 'text-ink' : shaking ? 'bg-err/50' : suggest === key ? 'ring-2 ring-white' : ''
                  }`}
                  style={!isTaken && !shaking ? { background: color, opacity: isSel ? 1 : suggest === key ? 0.85 : 0.45, boxShadow: isSel ? `0 0 12px ${color}` : undefined } : undefined}
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
