import { motion } from 'motion/react'
import { memo, useMemo } from 'react'
import { LEVEL_COLORS, type EventInfo, type LevelId, type VenueId } from '@/data/world'
import { mulberry32 } from '@/lib/prng'
import { spring } from '@/lib/motion'

/**
 * Seating maps drawn from each venue type's general layout (simplified, for the demo):
 * a three-tier theatre (Fox Theatre), a two-tier hall (Variety Playhouse, Center Stage,
 * Symphony Hall, Center for Puppetry Arts) and a small basketball arena.
 */
export interface Section {
  id: string
  level: LevelId
  d: string
  label: [number, number]
  avail: number // 0..1 share of seats left (0 = sold out)
  font: number
}

const rad = (a: number) => (a * Math.PI) / 180

/* ───────── Theatre and hall: tiers fanning out from a proscenium stage ───────── */
const FC = { x: 170, y: 16 }
function fanArc(r1: number, r2: number, a1: number, a2: number) {
  const p = (r: number, a: number) => `${(FC.x + r * Math.cos(rad(a))).toFixed(1)} ${(FC.y + r * Math.sin(rad(a))).toFixed(1)}`
  return `M${p(r2, a1)} A${r2} ${r2} 0 0 1 ${p(r2, a2)} L${p(r1, a2)} A${r1} ${r1} 0 0 0 ${p(r1, a1)} Z`
}
type Tier = { level: LevelId; ids: string[]; r1: number; r2: number; from: number; to: number; font: number }
function tierSections(seed: number, tiers: Tier[]): Section[] {
  const r = mulberry32(seed)
  const out: Section[] = []
  for (const t of tiers) {
    const span = (t.to - t.from) / t.ids.length
    t.ids.forEach((id, i) => {
      // the stage is at the top, so house left (the audience's left) is the map's left
      const a1 = t.to - (i + 1) * span + 0.8
      const a2 = t.to - i * span - 0.8
      const mid = rad((a1 + a2) / 2)
      const rm = (t.r1 + t.r2) / 2
      let avail = t.level === 'floor' ? 0.04 + r() * 0.05 : r() < 0.25 ? 0 : 0.02 + r() * 0.1
      if (id === 'M3' || id === 'OC') avail = 0.07
      out.push({ id, level: t.level, d: fanArc(t.r1, t.r2, a1, a2), label: [FC.x + rm * Math.cos(mid), FC.y + rm * Math.sin(mid)], avail, font: t.font })
    })
  }
  return out
}
const theatreSections = () =>
  tierSections(29, [
    { level: 'floor', ids: ['ORL', 'ORC', 'ORR'], r1: 38, r2: 108, from: 34, to: 146, font: 8 },
    { level: '100', ids: ['M1', 'M2', 'M3', 'M4', 'M5'], r1: 116, r2: 142, from: 26, to: 154, font: 7.5 },
    { level: '200', ids: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'], r1: 150, r2: 180, from: 22, to: 158, font: 7.5 },
  ])
const hallSections = () =>
  tierSections(31, [
    { level: 'floor', ids: ['OL', 'OC', 'OR'], r1: 36, r2: 118, from: 30, to: 150, font: 9 },
    { level: '100', ids: ['BL', 'BC', 'BR'], r1: 128, r2: 168, from: 24, to: 156, font: 9 },
  ])

/* ───────── Small arena: a bowl around a basketball court ───────── */
const AC = { x: 180, y: 128 }
const N = 4 // superellipse exponent: a rounded-rectangle bowl
function sePoint(a: number, b: number, deg: number): [number, number] {
  const t = rad(deg)
  const c = Math.cos(t)
  const s = Math.sin(t)
  return [AC.x + a * Math.sign(c) * Math.abs(c) ** (2 / N), AC.y + b * Math.sign(s) * Math.abs(s) ** (2 / N)]
}
function ringSection(inner: [number, number], outer: [number, number], d1: number, d2: number) {
  const steps = 6
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) pts.push(sePoint(outer[0], outer[1], d1 + ((d2 - d1) * i) / steps).map((v) => v.toFixed(1)).join(' '))
  for (let i = steps; i >= 0; i--) pts.push(sePoint(inner[0], inner[1], d1 + ((d2 - d1) * i) / steps).map((v) => v.toFixed(1)).join(' '))
  return 'M' + pts.join(' L') + ' Z'
}
function arenaSections(): Section[] {
  const r = mulberry32(37)
  const out: Section[] = []
  const rings: { level: LevelId; base: number; n: number; inner: [number, number]; outer: [number, number]; font: number }[] = [
    { level: '100', base: 101, n: 16, inner: [74, 54], outer: [106, 84], font: 7 },
    { level: '200', base: 201, n: 20, inner: [112, 90], outer: [146, 120], font: 7 },
  ]
  for (const ring of rings) {
    const span = 360 / ring.n
    for (let i = 0; i < ring.n; i++) {
      const d1 = -90 + i * span + 0.8
      const d2 = -90 + (i + 1) * span - 0.8
      const mid = (d1 + d2) / 2
      const mr: [number, number] = [(ring.inner[0] + ring.outer[0]) / 2, (ring.inner[1] + ring.outer[1]) / 2]
      const avail = r() < 0.3 ? 0 : 0.02 + r() * 0.1
      out.push({ id: String(ring.base + i), level: ring.level, d: ringSection(ring.inner, ring.outer, d1, d2), label: sePoint(mr[0], mr[1], mid), avail, font: ring.font })
    }
  }
  // courtside rows along both sidelines
  out.push({ id: 'CS1', level: 'floor', d: `M${AC.x - 48} ${AC.y - 46} h96 v10 h-96 Z`, label: [AC.x, AC.y - 41], avail: 0.04, font: 6.5 })
  out.push({ id: 'CS2', level: 'floor', d: `M${AC.x - 48} ${AC.y + 36} h96 v10 h-96 Z`, label: [AC.x, AC.y + 41], avail: 0.02, font: 6.5 })
  return out
}

const CACHE: Partial<Record<VenueId, Section[]>> = {}
export function sectionsFor(v: VenueId): Section[] {
  return (CACHE[v] ??= v === 'theatre' ? theatreSections() : v === 'hall' ? hallSections() : arenaSections())
}
export const sectionById = (v: VenueId, id: string) => sectionsFor(v).find((s) => s.id === id)
export const sectionOf = (ev: EventInfo, id: string) => (ev.venueId ? sectionById(ev.venueId, id) : undefined)
/** The section the seat picker opens on. */
export function defaultSection(ev: EventInfo) {
  return ev.venueId === 'theatre' ? 'M3' : ev.venueId === 'hall' ? 'OC' : '104'
}

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
  highlight,
}: {
  event: EventInfo
  selected?: string | null
  onSelect?: (id: string) => void
  interactive?: boolean
  className?: string
  pulse?: string
  /** resale view: only these sections are shown as available */
  highlight?: string[]
}) {
  const v = event.venueId ?? 'theatre'
  const sections = sectionsFor(v)
  return (
    <svg viewBox={v === 'theatre' ? '0 0 340 204' : v === 'hall' ? '0 0 340 192' : '0 0 360 256'} className={`w-full ${className}`} role="img" aria-label={`${event.venue} seating map`}>
      {v === 'arena' ? (
        <>
          <rect x={AC.x - 46} y={AC.y - 30} width={92} height={60} rx={3} fill="rgba(214,160,92,.22)" stroke="rgba(255,255,255,.22)" />
          <line x1={AC.x} x2={AC.x} y1={AC.y - 30} y2={AC.y + 30} stroke="rgba(255,255,255,.22)" />
          <circle cx={AC.x} cy={AC.y} r={8} fill="none" stroke="rgba(255,255,255,.22)" />
          <text x={AC.x} y={AC.y + 22} textAnchor="middle" fontSize="7" fontWeight="700" letterSpacing="2" fill="rgba(255,255,255,.7)">
            COURT
          </text>
        </>
      ) : (
        <>
          <path d={`M${FC.x - 60} 2 h120 v18 a6 6 0 0 1 -6 6 h-108 a6 6 0 0 1 -6 -6z`} fill="rgba(255,255,255,.14)" />
          <text x={FC.x} y={17} textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="2" fill="rgba(255,255,255,.8)">
            STAGE
          </text>
        </>
      )}
      {sections.map((s) => {
        const sold = highlight ? !highlight.includes(s.id) : s.avail === 0
        const isSel = selected === s.id
        const color = LEVEL_COLORS[s.level]
        const priced = event.levels.some((l) => l.id === s.level)
        const fill = isSel ? color : sold || !priced ? 'rgba(255,255,255,.06)' : color
        const opacity = isSel ? 1 : sold || !priced ? 1 : highlight ? 0.95 : 0.42 + s.avail * 4
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
            {(
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
export function rowsFor(level: LevelId, venue: VenueId = 'theatre'): string[] {
  if (venue === 'arena' && level === 'floor') return ['1', '2', '3']
  const start = venue === 'theatre' ? (level === '200' ? 5 : 10) : venue === 'hall' ? 1 : level === '100' ? 1 : 8
  return Array.from({ length: 8 }, (_, i) => String(start + i))
}

export function useTakenSeats(eventId: string, section: string, rows: string[]) {
  return useMemo(() => {
    const r = mulberry32((eventId + section).split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7))
    const taken = new Set<string>()
    for (const row of rows)
      for (let n = 1; n <= SEATS_PER_ROW; n++) {
        const key = `${row}-${n}`
        if (section === 'M3' && row === '14' && n >= 5 && n <= 10) continue
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
  venue,
}: {
  eventId: string
  section: string
  venue?: VenueId
  level: LevelId
  selected: string[]
  onToggle: (key: string) => void
  shakeKey?: { key: string; n: number } | null
  suggest?: string
}) {
  const rows = useMemo(() => rowsFor(level, venue), [level, venue])
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
