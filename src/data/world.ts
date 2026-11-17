/** The fictional world of the demo. Every artist, tour and venue is invented. */
import { address } from '@/lib/prng'

export type EventId = 'nova' | 'velvet' | 'kairo' | 'juniper' | 'current'
export type ArtVariant = 'beams' | 'rings' | 'waves' | 'grid' | 'orbits'

export interface EventInfo {
  id: EventId
  artist: string
  tour: string
  venue: string
  city: string
  dateLabel: string // e.g. "Fri, Dec 11"
  timeLabel: string // "8:00 PM"
  /** minutes since demo epoch (Nov 18 2026 00:00) of show start */
  startMin: number
  faceCents: number
  capacity: number
  demand: 'extreme' | 'high' | 'normal'
  palette: [string, string, string, string] // a, b, c, base
  art: ArtVariant
  seed: number
  genre: string
}

/** Demo epoch: Wed Nov 18 2026, 00:00 (Atlanta). Times are minutes from it. */
const DAY = 24 * 60
export const EPOCH_LABEL = 'Nov 18, 2026'

export const EVENTS: Record<EventId, EventInfo> = {
  nova: {
    id: 'nova',
    artist: 'Nova Bloom',
    tour: 'The Afterglow Tour',
    venue: 'Peachtree Arena',
    city: 'Atlanta, GA',
    dateLabel: 'Fri, Dec 11',
    timeLabel: '8:00 PM',
    startMin: 23 * DAY + 20 * 60,
    faceCents: 10000,
    capacity: 20000,
    demand: 'extreme',
    palette: ['#3E86FF', '#7C6BFF', '#5AC8FA', '#0B1030'],
    art: 'beams',
    seed: 11,
    genre: 'Pop',
  },
  velvet: {
    id: 'velvet',
    artist: 'The Velvet Hours',
    tour: 'Slow Burn',
    venue: 'The Foundry',
    city: 'Atlanta, GA',
    dateLabel: 'Tonight',
    timeLabel: '8:00 PM',
    startMin: 20 * 60,
    faceCents: 4500,
    capacity: 2400,
    demand: 'high',
    palette: ['#FF5D8F', '#9B3DF0', '#FF9E6B', '#1C0A1E'],
    art: 'rings',
    seed: 23,
    genre: 'Indie soul',
  },
  kairo: {
    id: 'kairo',
    artist: 'Kairo Lune',
    tour: 'Night Swim',
    venue: 'Westside Yards',
    city: 'Atlanta, GA',
    dateLabel: 'Sat, Jan 16',
    timeLabel: '9:30 PM',
    startMin: 59 * DAY + 21 * 60 + 30,
    faceCents: 6500,
    capacity: 8000,
    demand: 'normal',
    palette: ['#2EE6C5', '#1F7AE0', '#B8F2FF', '#04161F'],
    art: 'waves',
    seed: 37,
    genre: 'Electronic',
  },
  juniper: {
    id: 'juniper',
    artist: 'Juniper Ash',
    tour: 'Paper Lanterns',
    venue: 'Ponce Hall',
    city: 'Atlanta, GA',
    dateLabel: 'Thu, Feb 4',
    timeLabel: '7:30 PM',
    startMin: 78 * DAY + 19 * 60 + 30,
    faceCents: 5500,
    capacity: 3000,
    demand: 'normal',
    palette: ['#FFC857', '#F28C38', '#FFF1C1', '#24140A'],
    art: 'orbits',
    seed: 41,
    genre: 'Folk',
  },
  current: {
    id: 'current',
    artist: 'Southern Current',
    tour: 'Festival 2027 · 3 days',
    venue: 'Midtown Green',
    city: 'Atlanta, GA',
    dateLabel: 'May 21–23',
    timeLabel: 'All day',
    startMin: 184 * DAY + 12 * 60,
    faceCents: 15000,
    capacity: 50000,
    demand: 'high',
    palette: ['#A78BFA', '#3E86FF', '#F472B6', '#120B2A'],
    art: 'grid',
    seed: 53,
    genre: 'Festival',
  },
}

export const DISCOVER_ORDER: EventId[] = ['nova', 'current', 'kairo', 'juniper', 'velvet']

/* ─────────────── Demo clock: four moments, only moves forward ─────────────── */
export type MomentId = 'presale' | 'velvetAfter' | 'doors' | 'after'
export interface Moment {
  id: MomentId
  min: number
  clock: string // status-bar time
  label: string
}
export const MOMENTS: Moment[] = [
  { id: 'presale', min: 18 * 60 + 18, clock: '6:18', label: 'Wed, Nov 18 · 6:18 PM' },
  { id: 'velvetAfter', min: 23 * 60 + 24, clock: '11:24', label: 'Wed, Nov 18 · 11:24 PM' },
  { id: 'doors', min: 23 * DAY + 19 * 60 + 42, clock: '7:42', label: 'Fri, Dec 11 · 7:42 PM' },
  { id: 'after', min: 23 * DAY + 23 * 60 + 48, clock: '11:48', label: 'Fri, Dec 11 · 11:48 PM' },
]
export const momentIndex = (id: MomentId) => MOMENTS.findIndex((m) => m.id === id)
export const moment = (id: MomentId) => MOMENTS[momentIndex(id)]

/* ─────────────── People ─────────────── */
export type PersonId = 'maya' | 'ben'
export interface Contact {
  id: string
  name: string
  verified: boolean
  hue: number
}
export const CONTACTS: Contact[] = [
  { id: 'lucia', name: 'Lucía', verified: true, hue: 330 },
  { id: 'jordan', name: 'Jordan', verified: true, hue: 200 },
  { id: 'alex', name: 'Alex', verified: true, hue: 150 },
  { id: 'sam', name: 'Sam', verified: false, hue: 30 },
  { id: 'priya', name: 'Priya', verified: false, hue: 270 },
]

/** Anonymous on-chain addresses. The Proof view never shows names. */
export const ADDR = {
  maya: address('maya-fairseat'),
  ben: address('ben-fairseat'),
  artistNova: address('nova-bloom-artist'),
  artistVelvet: address('velvet-hours-artist'),
  organizer: address('peachtree-live-org'),
  treasury: address('fairseat-treasury'),
  market: address('fairseat-market-v1'),
  tickets: address('fairseat-tickets-v1'),
  badges: address('fairseat-badges-v1'),
  lucia: address('lucia-fairseat'),
  jordan: address('jordan-fairseat'),
  alex: address('alex-fairseat'),
}

export const ORGANIZER_NAME = 'Peachtree Live'
export const GATE_NAME = 'Gate B · Scanner 04'

/* ─────────────── Badge history (fan level) ─────────────── */
export interface Badge {
  id: string
  eventId: EventId | 'past'
  artist: string
  venue: string
  date: string
  hue: number
}
export const BEN_PAST_BADGES: Badge[] = [
  { id: 'b-juniper-26', eventId: 'past', artist: 'Juniper Ash', venue: 'Ponce Hall', date: 'Sep 2026', hue: 38 },
  { id: 'b-kairo-26', eventId: 'past', artist: 'Kairo Lune', venue: 'Westside Yards', date: 'Jul 2026', hue: 170 },
]

export interface FanLevel {
  level: number
  name: string
  priority: string
  next: number | null
}
export function fanLevel(badges: number): FanLevel {
  if (badges >= 5) return { level: 4, name: 'Superfan', priority: 'Priority 1', next: null }
  if (badges >= 3) return { level: 3, name: 'Loyal fan', priority: 'Priority 2', next: 5 }
  if (badges >= 1) return { level: 2, name: 'Regular', priority: 'Priority 3', next: 3 }
  return { level: 1, name: 'New fan', priority: 'General', next: 1 }
}
