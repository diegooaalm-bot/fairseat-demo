/**
 * Proof of Seat rules engine. Pure functions, integer cents.
 * Resale is capped at 105% of face value. On every resale the artist gets 2% of face value and
 * the platform 1% of face value, out of the price: a $100 ticket resold at the $105 cap leaves the
 * seller $102 (face value + 2%), the artist $2 and the platform $1. The buyer pays the listing
 * price, all-in. Primary sales carry a 1% fee, paid by the organizer.
 * Any marketplace can list a ticket; every resale settles through the contract, which applies these rules.
 */

export type Jurisdiction = 'UK' | 'GA' | 'NY' | 'CO'

export interface Rules {
  capPct: number // resale cap, % of face value
  royaltyPct: number // to the artist, % of face value, out of every resale price
  feePct: number // Proof of Seat resale fee, % of face value, out of every resale price (it also pays the gas)
  primaryFeePct: number // Proof of Seat primary fee, % of face value, paid by the organizer
  maxPerPerson: number
  resaleCloseHours: number
  maxTransfers: number // gifts per ticket
  jurisdiction: Jurisdiction
}

export const DEFAULT_RULES: Rules = {
  capPct: 105,
  royaltyPct: 2,
  feePct: 1,
  primaryFeePct: 1,
  maxPerPerson: 4,
  resaleCloseHours: 2,
  maxTransfers: 2,
  jurisdiction: 'GA',
}

export const capCents = (faceCents: number, rules: Pick<Rules, 'capPct'> = DEFAULT_RULES) =>
  Math.round((faceCents * rules.capPct) / 100)

export interface ResaleBreakdown {
  price: number
  royalty: number
  seller: number
  fee: number
  buyerTotal: number
}

/** Who gets what when a ticket with this face value is resold at this price. */
export function resaleBreakdown(priceCents: number, faceCents: number, rules: Pick<Rules, 'royaltyPct' | 'feePct'> = DEFAULT_RULES): ResaleBreakdown {
  const royalty = Math.round((faceCents * rules.royaltyPct) / 100)
  const fee = Math.round((faceCents * rules.feePct) / 100)
  return { price: priceCents, royalty, seller: priceCents - royalty - fee, fee, buyerTotal: priceCents }
}

export interface JurisdictionProfile {
  id: Jurisdiction
  label: string
  short: string
  capOnPlatform: true
  openMarket: boolean
  headline: string
  note: string
}

export const JURISDICTIONS: Record<Jurisdiction, JurisdictionProfile> = {
  UK: {
    id: 'UK',
    label: 'United Kingdom',
    short: 'UK',
    capOnPlatform: true,
    openMarket: false,
    headline: 'Full cap, everywhere',
    note: 'Any marketplace can list the ticket; every resale settles through the Proof of Seat contract and is capped. Compliance is automatic and provable.',
  },
  GA: {
    id: 'GA',
    label: 'Georgia',
    short: 'GA',
    capOnPlatform: true,
    openMarket: false,
    headline: 'Full cap, everywhere',
    note: 'Like most states: resale on any marketplace, always through the contract, capped, with royalties.',
  },
  NY: {
    id: 'NY',
    label: 'New York',
    short: 'NY',
    capOnPlatform: true,
    openMarket: true,
    headline: 'Free resale protected by state law',
    note: 'The ticket stays transferable to any compatible marketplace. On Proof of Seat the cap and royalty still apply.',
  },
  CO: {
    id: 'CO',
    label: 'Colorado',
    short: 'CO',
    capOnPlatform: true,
    openMarket: true,
    headline: 'Free resale protected by state law',
    note: 'Sellers cannot be restricted. The ticket is transferable to any compatible marketplace; Proof of Seat sales stay capped.',
  },
}

/** The resale contract's checks, in the order the pseudocode lists them. */
export interface ResaleCheckInput {
  priceCents: number
  faceCents: number
  buyerVerified: boolean
  buyerTickets: number
  minutesToShow: number
  rules?: Rules
}

export interface Check {
  id: 'cap' | 'verified' | 'limit' | 'window'
  label: string
  detail: string
  ok: boolean
}

export function resaleChecks(i: ResaleCheckInput): Check[] {
  const r = i.rules ?? DEFAULT_RULES
  const cap = capCents(i.faceCents, r)
  return [
    {
      id: 'cap',
      label: 'Price ≤ cap',
      detail: `$${(i.priceCents / 100).toFixed(2)} ≤ $${(cap / 100).toFixed(2)}`,
      ok: i.priceCents <= cap,
    },
    { id: 'verified', label: 'Buyer verified', detail: i.buyerVerified ? 'Identity verified once' : 'Not verified', ok: i.buyerVerified },
    {
      id: 'limit',
      label: `Buyer holds < ${r.maxPerPerson}`,
      detail: `${i.buyerTickets} ticket${i.buyerTickets === 1 ? '' : 's'} held`,
      ok: i.buyerTickets < r.maxPerPerson,
    },
    {
      id: 'window',
      label: `Before close (−${r.resaleCloseHours}h)`,
      detail: i.minutesToShow > r.resaleCloseHours * 60 ? 'Resale window open' : 'Resale window closed',
      ok: i.minutesToShow > r.resaleCloseHours * 60,
    },
  ]
}

/* ─────────────── Festival business model (illustrative) ─────────────── */

export interface FestivalInput {
  capacity: number // tickets sold per year
  price: number // average face value, dollars
  resoldPct: number // 0-100
}

/** A pilot venue's year: e.g. a 2,600-seat theater with ~20 sold-out nights. */
export const FESTIVAL_DEFAULTS: FestivalInput = { capacity: 50_000, price: 60, resoldPct: 15 }

export function festival(i: FestivalInput, rules: Rules = DEFAULT_RULES) {
  const primaryFee = i.capacity * i.price * (rules.primaryFeePct / 100)
  const resales = Math.round((i.capacity * i.resoldPct) / 100)
  const resaleFee = resales * i.price * (rules.feePct / 100)
  const revenue = primaryFee + resaleFee
  const royalties = resales * i.price * (rules.royaltyPct / 100)
  const sellerBonus = resales * i.price * ((rules.capPct - 100 - rules.royaltyPct - rules.feePct) / 100) // at the cap
  const ops = i.capacity + resales + i.capacity // issue + resales + badges
  const chainCost = ops * 0.01
  return { primaryFee, resales, resaleFee, revenue, royalties, sellerBonus, ops, chainCost, cap: (i.price * rules.capPct) / 100 }
}
