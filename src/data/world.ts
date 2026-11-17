/**
 * The demo's world. Artists, tours and venues are real; listings, prices,
 * seats and the Bad Bunny Atlanta date are illustrative (see `illustrative`).
 * FairSeat is an academic concept and is not affiliated with any of them.
 */
import { address } from '@/lib/prng'

/** 'nova' is the featured show used by the canonical Maya → Ben story. */
export type EventId = 'nova' | 'harry' | 'zach' | 'straykids' | 'bocelli' | 'taylor' | 'atlutd' | 'falcons' | 'hamilton' | 'cirque' | 'monsterjam' | 'disney'
export type ArtVariant = 'beams' | 'rings' | 'waves' | 'grid' | 'orbits'
export type VenueId = 'mbs' | 'sfa' | 'fox'
export type Category = 'concerts' | 'sports' | 'arts' | 'family'
export const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All events' },
  { id: 'concerts', label: 'Concerts' },
  { id: 'sports', label: 'Sports' },
  { id: 'arts', label: 'Arts & Theater' },
  { id: 'family', label: 'Family' },
]
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
  status: 'presale' | 'onsale' | 'soldout'
  category: Category
  /** 'field': stadium in sports configuration (no stage, no floor seats) */
  layout?: 'stage' | 'field' | 'dirt'
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
/** stadium without floor seats (sports, motorsports) */
const lvStands = (l100: number, l200: number, l300: number): PriceLevel[] => lv(0, l100, l200, l300).slice(1)
const lvTheatre = (orch: number, mezz: number, balc: number): PriceLevel[] => [
  { id: 'floor', label: 'Orchestra', cents: orch * 100 },
  { id: '100', label: 'Mezzanine', cents: mezz * 100 },
  { id: '200', label: 'Balcony', cents: balc * 100 },
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
    category: 'concerts',
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
    category: 'concerts',
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
    category: 'concerts',
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
    category: 'concerts',
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
    category: 'concerts',
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
    tour: 'The Life of a Showgirl Tour',
    venue: 'Mercedes-Benz Stadium',
    venueId: 'mbs',
    city: 'Atlanta, GA',
    dateLabel: 'Sat, Jul 17, 2027',
    dow: 'SAT',
    mon: 'JUL',
    day: '17',
    timeLabel: '7:00 PM',
    startMin: 241 * DAY + 19 * 60,
    faceCents: 12000,
    capacity: 71000,
    status: 'soldout',
    category: 'concerts',
    genre: 'Pop',
    photo: 'taylor',
    levels: lv(300, 200, 150, 120),
    illustrative: true,
    palette: ['#FF5D8F', '#9B3DF0', '#FF9E6B', '#1C0A1E'],
    art: 'rings',
    seed: 61,
  },
  atlutd: {
    id: 'atlutd',
    artist: 'Atlanta United vs. Inter Miami CF',
    tour: 'MLS Regular Season',
    venue: 'Mercedes-Benz Stadium',
    venueId: 'mbs',
    city: 'Atlanta, GA',
    dateLabel: 'Sat, Mar 13, 2027',
    dow: 'SAT',
    mon: 'MAR',
    day: '13',
    timeLabel: '7:30 PM',
    startMin: 115 * DAY + 19 * 60 + 30,
    faceCents: 2900,
    capacity: 42500,
    status: 'onsale',
    category: 'sports',
    layout: 'field',
    genre: 'Soccer',
    photo: 'atlutd',
    levels: lvStands(65, 45, 29),
    illustrative: true,
    palette: ['#C8102E', '#A19060', '#231F20', '#0B0B0B'],
    art: 'grid',
    seed: 71,
  },
  falcons: {
    id: 'falcons',
    artist: 'Atlanta Falcons vs. New Orleans Saints',
    tour: 'NFL Regular Season',
    venue: 'Mercedes-Benz Stadium',
    venueId: 'mbs',
    city: 'Atlanta, GA',
    dateLabel: 'Sun, Dec 13, 2026',
    dow: 'SUN',
    mon: 'DEC',
    day: '13',
    timeLabel: '1:00 PM',
    startMin: 25 * DAY + 13 * 60,
    faceCents: 7900,
    capacity: 71000,
    status: 'onsale',
    category: 'sports',
    layout: 'field',
    genre: 'Football',
    photo: 'falcons',
    levels: lvStands(189, 129, 79),
    illustrative: true,
    palette: ['#A71930', '#000000', '#A5ACAF', '#0B0B0B'],
    art: 'grid',
    seed: 73,
  },
  hamilton: {
    id: 'hamilton',
    artist: 'Hamilton',
    tour: 'The Broadway musical · North American tour',
    venue: 'Fox Theatre',
    venueId: 'fox',
    city: 'Atlanta, GA',
    dateLabel: 'Tue, Mar 16, 2027',
    dow: 'TUE',
    mon: 'MAR',
    day: '16',
    timeLabel: '7:30 PM',
    startMin: 118 * DAY + 19 * 60 + 30,
    faceCents: 7900,
    capacity: 4665,
    status: 'onsale',
    category: 'arts',
    genre: 'Musical',
    photo: 'hamilton',
    levels: lvTheatre(189, 139, 79),
    illustrative: true,
    palette: ['#C9A227', '#7A1F1F', '#F5E6C8', '#120B08'],
    art: 'grid',
    seed: 79,
  },
  cirque: {
    id: 'cirque',
    artist: 'Cirque du Soleil',
    tour: 'Corteo · Arena tour',
    venue: 'State Farm Arena',
    venueId: 'sfa',
    city: 'Atlanta, GA',
    dateLabel: 'Fri, Apr 9, 2027',
    dow: 'FRI',
    mon: 'APR',
    day: '9',
    timeLabel: '7:30 PM',
    startMin: 142 * DAY + 19 * 60 + 30,
    faceCents: 5900,
    capacity: 12000,
    status: 'onsale',
    category: 'arts',
    genre: 'Circus',
    photo: 'cirque',
    levels: lv(159, 109, 59),
    illustrative: true,
    palette: ['#F5B94A', '#B794F6', '#3E86FF', '#120B2A'],
    art: 'orbits',
    seed: 83,
  },
  monsterjam: {
    id: 'monsterjam',
    artist: 'Monster Jam',
    tour: 'Stadium Championship Series',
    venue: 'Mercedes-Benz Stadium',
    venueId: 'mbs',
    city: 'Atlanta, GA',
    dateLabel: 'Sat, Jan 30, 2027',
    dow: 'SAT',
    mon: 'JAN',
    day: '30',
    timeLabel: '7:00 PM',
    startMin: 73 * DAY + 19 * 60,
    faceCents: 2500,
    capacity: 60000,
    status: 'onsale',
    category: 'family',
    layout: 'dirt',
    genre: 'Motorsports',
    photo: 'monsterjam',
    levels: lvStands(55, 39, 25),
    illustrative: true,
    palette: ['#F28C38', '#FFC857', '#3CCFB4', '#24140A'],
    art: 'beams',
    seed: 89,
  },
  disney: {
    id: 'disney',
    artist: 'Disney On Ice',
    tour: 'Let’s Dance!',
    venue: 'State Farm Arena',
    venueId: 'sfa',
    city: 'Atlanta, GA',
    dateLabel: 'Sat, Dec 19, 2026',
    dow: 'SAT',
    mon: 'DEC',
    day: '19',
    timeLabel: '11:00 AM',
    startMin: 31 * DAY + 11 * 60,
    faceCents: 2900,
    capacity: 12000,
    status: 'onsale',
    category: 'family',
    genre: 'Family',
    photo: 'disney',
    levels: lv(95, 55, 29),
    illustrative: true,
    palette: ['#5AC8FA', '#B794F6', '#FFFFFF', '#0B1030'],
    art: 'waves',
    seed: 97,
  },
}

/** Everything except the featured show, by date. */
export const UPCOMING: EventId[] = (Object.keys(EVENTS) as EventId[]).filter((id) => id !== 'nova').sort((a, b) => EVENTS[a].startMin - EVENTS[b].startMin)

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
