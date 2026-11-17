/**
 * The demo's world. Artists, tours and venues are real; listings, prices,
 * seats and the Bad Bunny Atlanta date are illustrative (see `illustrative`).
 * FairSeat is an academic concept and is not affiliated with any of them.
 */
import { address } from '@/lib/prng'

/** 'nova' is the featured show used by the canonical Maya → Ben story. */
export type EventId = 'nova' | 'harry' | 'zach' | 'straykids' | 'bocelli' | 'taylor'
export type ArtVariant = 'beams' | 'rings' | 'waves' | 'grid' | 'orbits'
export type VenueId = 'mbs' | 'sfa'
export type LevelId = 'floor' | '100' | '200' | '300'

export interface PriceLevel {
  id: LevelId
  label: string
  cents: number
}

export interface EventInfo {
  id: EventId
  artist: string
  tour: string
  venue: string
  venueId: VenueId | null
  city: string
  dateLabel: string
  dow: string
  mon: string
  day: string
  timeLabel: string
  /** minutes since demo epoch (Wed Nov 18 2026, 00:00 Atlanta) of show start */
  startMin: number
  /** lowest face value; the featured show's $100 seats drive the canonical example */
  faceCents: number
  capacity: number
  status: 'presale' | 'onsale' | 'waitlist'
  genre: string
  photo: string
  photoPos?: string
  levels: PriceLevel[]
  illustrative?: boolean
  // generative fallback art
  palette: [string, string, string, string]
  art: ArtVariant
  seed: number
}

const DAY = 24 * 60
export const EPOCH_LABEL = 'Nov 18, 2026'

export const LEVEL_COLORS: Record<LevelId, string> = {
  floor: '#B794F6',
  '100': '#5B9BFF',
  '200': '#3CCFB4',
  '300': '#F5B94A',
}

const lv = (floor: number, l100: number, l200: number, l300?: number): PriceLevel[] => [
  { id: 'floor', label: 'Floor', cents: floor * 100 },
  { id: '100', label: '100 Level', cents: l100 * 100 },
  { id: '200', label: '200 Level', cents: l200 * 100 },
  ...(l300 ? [{ id: '300' as const, label: '300 Level', cents: l300 * 100 }] : []),
]

export const EVENTS: Record<EventId, EventInfo> = {
  nova: {
    id: 'nova',
    artist: 'Bad Bunny',
    tour: 'DeBÍ TiRAR MáS FOToS World Tour',
    venue: 'Mercedes-Benz Stadium',
    venueId: 'mbs',
    city: 'Atlanta, GA',
    dateLabel: 'Sat, Jun 26, 2027',
    dow: 'SAT',
    mon: 'JUN',
    day: '26',
    timeLabel: '8:00 PM',
    startMin: 220 * DAY + 20 * 60,
    faceCents: 10000,
    capacity: 71000,
    status: 'presale',
    genre: 'Latin',
    photo: 'badbunny',
    photoPos: '50% 30%',
    levels: lv(295, 185, 150, 100),
    illustrative: true,
    palette: ['#3E86FF', '#7C6BFF', '#5AC8FA', '#0B1030'],
    art: 'beams',
    seed: 11,
  },
  harry: {
    id: 'harry',
    artist: 'Harry Styles',
    tour: 'Together, Together',
    venue: 'Mercedes-Benz Stadium',
    venueId: 'mbs',
    city: 'Atlanta, GA',
    dateLabel: 'Fri, May 21, 2027',
    dow: 'FRI',
    mon: 'MAY',
    day: '21',
    timeLabel: '7:00 PM',
    startMin: 184 * DAY + 19 * 60,
    faceCents: 8900,
    capacity: 71000,
    status: 'onsale',
    genre: 'Pop',
    photo: 'harry',
    levels: lv(250, 170, 135, 89),
    palette: ['#FF5D8F', '#9B3DF0', '#FF9E6B', '#1C0A1E'],
    art: 'rings',
    seed: 23,
  },
  zach: {
    id: 'zach',
    artist: 'Zach Bryan',
    tour: 'Young Manhood and Other Donatable Organs Tour',
    venue: 'Mercedes-Benz Stadium',
    venueId: 'mbs',
    city: 'Atlanta, GA',
    dateLabel: 'Sat, May 29, 2027',
    dow: 'SAT',
    mon: 'MAY',
    day: '29',
    timeLabel: '7:00 PM',
    startMin: 192 * DAY + 19 * 60,
    faceCents: 7900,
    capacity: 71000,
    status: 'onsale',
    genre: 'Country',
    photo: 'zach',
    levels: lv(225, 160, 129, 79),
    palette: ['#FFC857', '#F28C38', '#FFF1C1', '#24140A'],
    art: 'orbits',
    seed: 41,
  },
  straykids: {
    id: 'straykids',
    artist: 'Stray Kids',
    tour: 'RUN IT World Tour',
    venue: 'Mercedes-Benz Stadium',
    venueId: 'mbs',
    city: 'Atlanta, GA',
    dateLabel: 'Tue, Jun 8, 2027',
    dow: 'TUE',
    mon: 'JUN',
    day: '8',
    timeLabel: '7:30 PM',
    startMin: 202 * DAY + 19 * 60 + 30,
    faceCents: 10900,
    capacity: 71000,
    status: 'onsale',
    genre: 'K-pop',
    photo: 'straykids',
    levels: lv(299, 189, 149, 109),
    palette: ['#2EE6C5', '#1F7AE0', '#B8F2FF', '#04161F'],
    art: 'waves',
    seed: 37,
  },
  bocelli: {
    id: 'bocelli',
    artist: 'Andrea Bocelli',
    tour: 'Romanza 30th Anniversary World Tour',
    venue: 'State Farm Arena',
    venueId: 'sfa',
    city: 'Atlanta, GA',
    dateLabel: 'Tue, Feb 2, 2027',
    dow: 'TUE',
    mon: 'FEB',
    day: '2',
    timeLabel: '8:00 PM',
    startMin: 76 * DAY + 20 * 60,
    faceCents: 9900,
    capacity: 21000,
    status: 'onsale',
    genre: 'Classical',
    photo: 'bocelli',
    photoPos: '42% 35%',
    levels: lv(250, 159, 99),
    palette: ['#A78BFA', '#3E86FF', '#F472B6', '#120B2A'],
    art: 'grid',
    seed: 53,
  },
  taylor: {
    id: 'taylor',
    artist: 'Taylor Swift',
    tour: 'The Life of a Showgirl',
    venue: 'Tour not announced',
    venueId: null,
    city: 'Atlanta, GA',
    dateLabel: 'Dates to be announced',
    dow: '',
    mon: 'TBA',
    day: '—',
    timeLabel: '',
    startMin: 400 * DAY,
    faceCents: 0,
    capacity: 0,
    status: 'waitlist',
    genre: 'Pop',
    photo: 'taylor',
    levels: [],
    palette: ['#FF5D8F', '#9B3DF0', '#FF9E6B', '#1C0A1E'],
    art: 'rings',
    seed: 61,
  },
}

export const UPCOMING: EventId[] = ['harry', 'zach', 'straykids', 'bocelli']
export const DISCOVER_ORDER: EventId[] = ['nova', 'harry', 'zach', 'straykids', 'bocelli', 'taylor']

export const photoUrl = (key: string, size: 'wide' | 'card' = 'wide') => `${import.meta.env.BASE_URL}photos/${key}-${size}.webp`

/* ─────────────── Demo clock: moments only move forward ─────────────── */
export type MomentId = 'presale' | 'velvetAfter' | 'doors' | 'after'
export interface Moment {
  id: MomentId
  min: number
  clock: string
  label: string
}
export const MOMENTS: Moment[] = [
  { id: 'presale', min: 18 * 60 + 18, clock: '6:18', label: 'Wed, Nov 18 · 6:18 PM' },
  { id: 'velvetAfter', min: 23 * 60 + 24, clock: '11:24', label: 'Wed, Nov 18 · 11:24 PM' },
  { id: 'doors', min: 220 * DAY + 19 * 60 + 42, clock: '7:42', label: 'Sat, Jun 26 · 7:42 PM' },
  { id: 'after', min: 220 * DAY + 23 * 60 + 48, clock: '11:48', label: 'Sat, Jun 26 · 11:48 PM' },
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
  organizer: address('peachtree-live-org'),
  treasury: address('fairseat-treasury'),
  market: address('fairseat-market-v1'),
  tickets: address('fairseat-tickets-v1'),
  badges: address('fairseat-badges-v1'),
  lucia: address('lucia-fairseat'),
  jordan: address('jordan-fairseat'),
  alex: address('alex-fairseat'),
}

export const ORGANIZER_NAME = 'Event organizer'
export const GATE_NAME = 'North Gate · Scanner 04'

/* ─────────────── Badge history (fan level) ─────────────── */
export interface Badge {
  id: string
  eventId: EventId | 'past'
  artist: string
  venue: string
  date: string
  hue: number
}
export const MAYA_PAST_BADGES: Badge[] = [{ id: 'b-beyonce-25', eventId: 'past', artist: 'Beyoncé', venue: 'Mercedes-Benz Stadium', date: 'Jul 2025', hue: 38 }]
export const BEN_PAST_BADGES: Badge[] = [
  { id: 'b-beyonce-25', eventId: 'past', artist: 'Beyoncé', venue: 'Mercedes-Benz Stadium', date: 'Jul 2025', hue: 38 },
  { id: 'b-shakira-26', eventId: 'past', artist: 'Shakira', venue: 'State Farm Arena', date: 'Jun 2026', hue: 170 },
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
