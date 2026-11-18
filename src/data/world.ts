/**
 * The demo's world. Mid-size and independent artists, teams and Atlanta venues are real;
 * dates, listings, prices and seats are illustrative (see `illustrative`).
 * Proof of Seat is an academic concept and is not affiliated with any of them.
 */
import { address } from '@/lib/prng'

/** 'nova' is the featured show used by the canonical Maya → Ben story. */
export type EventId = 'nova' | 'manchester' | 'jbreakfast' | 'lakestreetdive' | 'waxahatchee' | 'lucydacus' | 'dream' | 'gatech' | 'aso' | 'improv' | 'puppetry' | 'dreamkids'
export type ArtVariant = 'beams' | 'rings' | 'waves' | 'grid' | 'orbits'
/** seat-map type: three-tier theatre, two-tier hall, small arena */
export type VenueId = 'theatre' | 'hall' | 'arena'
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

const lvTheatre = (orch: number, mezz: number, balc: number): PriceLevel[] => [
  { id: 'floor', label: 'Orchestra', cents: orch * 100 },
  { id: '100', label: 'Mezzanine', cents: mezz * 100 },
  { id: '200', label: 'Balcony', cents: balc * 100 },
]
const lvHall = (orch: number, balc: number): PriceLevel[] => [
  { id: 'floor', label: 'Orchestra', cents: orch * 100 },
  { id: '100', label: 'Balcony', cents: balc * 100 },
]
const lvArena = (court: number, lower: number, upper: number): PriceLevel[] => [
  { id: 'floor', label: 'Courtside', cents: court * 100 },
  { id: '100', label: 'Lower Level', cents: lower * 100 },
  { id: '200', label: 'Upper Level', cents: upper * 100 },
]

type Base = Omit<EventInfo, 'id' | 'city' | 'palette' | 'art' | 'seed' | 'illustrative'>
const ev = (id: EventId, b: Base, seed: number): EventInfo => ({
  id,
  city: 'Atlanta, GA',
  illustrative: true,
  palette: ['#3E86FF', '#7C6BFF', '#5AC8FA', '#0B1030'],
  art: 'beams',
  seed,
  ...b,
})

export const EVENTS: Record<EventId, EventInfo> = {
  // The featured show: Maya's $100 Mezzanine seat drives the canonical example.
  nova: ev('nova', {
    artist: 'Faye Webster',
    tour: 'Hometown show · Underdressed at the Symphony Tour',
    venue: 'Fox Theatre',
    venueId: 'theatre',
    dateLabel: 'Sat, Jun 26, 2027',
    dow: 'SAT', mon: 'JUN', day: '26', timeLabel: '8:00 PM',
    startMin: 220 * DAY + 20 * 60,
    faceCents: 6500,
    capacity: 4665,
    status: 'presale',
    category: 'concerts',
    genre: 'Indie',
    photo: 'faye',
    photoPos: '50% 30%',
    levels: lvTheatre(125, 100, 65),
  }, 11),
  manchester: ev('manchester', {
    artist: 'Manchester Orchestra',
    tour: 'Hometown holiday show',
    venue: 'Fox Theatre',
    venueId: 'theatre',
    dateLabel: 'Sat, Dec 19, 2026',
    dow: 'SAT', mon: 'DEC', day: '19', timeLabel: '8:00 PM',
    startMin: 31 * DAY + 20 * 60,
    faceCents: 4500,
    capacity: 4665,
    status: 'soldout',
    category: 'concerts',
    genre: 'Indie rock',
    photo: 'manchester',
    photoPos: '50% 35%',
    levels: lvTheatre(79, 65, 45),
  }, 13),
  jbreakfast: ev('jbreakfast', {
    artist: 'Japanese Breakfast',
    tour: 'For Melancholy Brunettes Tour',
    venue: 'Fox Theatre',
    venueId: 'theatre',
    dateLabel: 'Thu, Apr 15, 2027',
    dow: 'THU', mon: 'APR', day: '15', timeLabel: '8:00 PM',
    startMin: 148 * DAY + 20 * 60,
    faceCents: 4500,
    capacity: 4665,
    status: 'onsale',
    category: 'concerts',
    genre: 'Indie pop',
    photo: 'jbreakfast',
    levels: lvTheatre(85, 65, 45),
  }, 17),
  lakestreetdive: ev('lakestreetdive', {
    artist: 'Lake Street Dive',
    tour: 'Good Together Tour',
    venue: 'Atlanta Symphony Hall',
    venueId: 'hall',
    dateLabel: 'Fri, Mar 5, 2027',
    dow: 'FRI', mon: 'MAR', day: '5', timeLabel: '8:00 PM',
    startMin: 107 * DAY + 20 * 60,
    faceCents: 5500,
    capacity: 1762,
    status: 'onsale',
    category: 'concerts',
    genre: 'Soul pop',
    photo: 'lakestreetdive',
    levels: lvHall(79, 55),
  }, 19),
  waxahatchee: ev('waxahatchee', {
    artist: 'Waxahatchee',
    tour: 'Tigers Blood Tour',
    venue: 'Variety Playhouse',
    venueId: 'hall',
    dateLabel: 'Sat, Feb 13, 2027',
    dow: 'SAT', mon: 'FEB', day: '13', timeLabel: '8:00 PM',
    startMin: 87 * DAY + 20 * 60,
    faceCents: 4000,
    capacity: 1050,
    status: 'onsale',
    category: 'concerts',
    genre: 'Americana',
    photo: 'waxahatchee',
    levels: lvHall(49, 40),
  }, 23),
  lucydacus: ev('lucydacus', {
    artist: 'Lucy Dacus',
    tour: 'Forever Is a Feeling Tour',
    venue: 'Center Stage',
    venueId: 'hall',
    dateLabel: 'Wed, May 12, 2027',
    dow: 'WED', mon: 'MAY', day: '12', timeLabel: '8:00 PM',
    startMin: 175 * DAY + 20 * 60,
    faceCents: 4500,
    capacity: 1050,
    status: 'onsale',
    category: 'concerts',
    genre: 'Indie',
    photo: 'lucydacus',
    photoPos: '50% 25%',
    levels: lvHall(59, 45),
  }, 29),
  dream: ev('dream', {
    artist: 'Atlanta Dream vs. Minnesota Lynx',
    tour: 'WNBA Regular Season',
    venue: 'Gateway Center Arena',
    venueId: 'arena',
    dateLabel: 'Sat, Jun 5, 2027',
    dow: 'SAT', mon: 'JUN', day: '5', timeLabel: '7:30 PM',
    startMin: 199 * DAY + 19 * 60 + 30,
    faceCents: 2500,
    capacity: 3500,
    status: 'onsale',
    category: 'sports',
    genre: 'Basketball',
    photo: 'dream',
    levels: lvArena(145, 49, 25),
  }, 31),
  gatech: ev('gatech', {
    artist: 'Georgia Tech vs. Duke',
    tour: 'ACC Men’s Basketball',
    venue: 'McCamish Pavilion',
    venueId: 'arena',
    dateLabel: 'Sat, Jan 23, 2027',
    dow: 'SAT', mon: 'JAN', day: '23', timeLabel: '2:00 PM',
    startMin: 66 * DAY + 14 * 60,
    faceCents: 3500,
    capacity: 8600,
    status: 'onsale',
    category: 'sports',
    genre: 'Basketball',
    photo: 'gatech',
    levels: lvArena(120, 55, 35),
  }, 37),
  aso: ev('aso', {
    artist: 'Atlanta Symphony Orchestra',
    tour: 'Beethoven’s Ninth',
    venue: 'Atlanta Symphony Hall',
    venueId: 'hall',
    dateLabel: 'Thu, Jan 14, 2027',
    dow: 'THU', mon: 'JAN', day: '14', timeLabel: '8:00 PM',
    startMin: 57 * DAY + 20 * 60,
    faceCents: 4500,
    capacity: 1762,
    status: 'onsale',
    category: 'arts',
    genre: 'Classical',
    photo: 'aso',
    levels: lvHall(89, 45),
  }, 41),
  improv: ev('improv', {
    artist: 'Dad’s Garage',
    tour: 'Improv night',
    venue: 'Dad’s Garage Theatre',
    venueId: 'hall',
    dateLabel: 'Fri, Mar 12, 2027',
    dow: 'FRI', mon: 'MAR', day: '12', timeLabel: '8:00 PM',
    startMin: 114 * DAY + 20 * 60,
    faceCents: 2000,
    capacity: 250,
    status: 'onsale',
    category: 'arts',
    genre: 'Comedy',
    photo: 'improv',
    levels: lvHall(25, 20),
  }, 43),
  puppetry: ev('puppetry', {
    artist: 'Center for Puppetry Arts',
    tour: 'Rudolph the Red-Nosed Reindeer',
    venue: 'Center for Puppetry Arts',
    venueId: 'hall',
    dateLabel: 'Sat, Dec 12, 2026',
    dow: 'SAT', mon: 'DEC', day: '12', timeLabel: '11:00 AM',
    startMin: 24 * DAY + 11 * 60,
    faceCents: 1900,
    capacity: 300,
    status: 'onsale',
    category: 'family',
    genre: 'Family',
    photo: 'puppetry',
    levels: lvHall(25, 19),
  }, 47),
  dreamkids: ev('dreamkids', {
    artist: 'Atlanta Dream Family Night',
    tour: 'vs. Chicago Sky · kids’ activities on the concourse',
    venue: 'Gateway Center Arena',
    venueId: 'arena',
    dateLabel: 'Sun, May 23, 2027',
    dow: 'SUN', mon: 'MAY', day: '23', timeLabel: '3:00 PM',
    startMin: 186 * DAY + 15 * 60,
    faceCents: 2000,
    capacity: 3500,
    status: 'onsale',
    category: 'family',
    genre: 'Family',
    photo: 'dream',
    photoPos: '60% 40%',
    levels: lvArena(125, 39, 20),
  }, 53),
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
export const GATE_NAME = 'Main Entrance · Scanner 04'

/* ─────────────── Badge history (fan level) ─────────────── */
export interface Badge {
  id: string
  eventId: EventId | 'past'
  artist: string
  venue: string
  date: string
  hue: number
}
export const MAYA_PAST_BADGES: Badge[] = [{ id: 'b-wax-25', eventId: 'past', artist: 'Waxahatchee', venue: 'Variety Playhouse', date: 'Sep 2025', hue: 38 }]
export const BEN_PAST_BADGES: Badge[] = [
  { id: 'b-lucy-25', eventId: 'past', artist: 'Lucy Dacus', venue: 'Center Stage', date: 'Apr 2025', hue: 38 },
  { id: 'b-mo-25', eventId: 'past', artist: 'Manchester Orchestra', venue: 'Fox Theatre', date: 'Dec 2025', hue: 170 },
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
