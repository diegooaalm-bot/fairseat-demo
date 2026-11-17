/** FairSeat rules engine. Pure functions, integer cents. */

export type Jurisdiction = 'UK' | 'GA' | 'NY' | 'CO'

export interface Rules {
  capPct: number // resale cap, % of face value
  royaltyPct: number // to the artist, % of resale price
  buyerFeePct: number // FairSeat resale fee, paid by buyer
  primaryFeeCents: number // FairSeat primary fee per ticket, paid by organizer
  maxPerPerson: number
  resaleCloseHours: number
  maxTransfers: number // gifts per ticket
  jurisdiction: Jurisdiction
}

export const DEFAULT_RULES: Rules = {
  capPct: 110,
  royaltyPct: 5,
  buyerFeePct: 3,
  primaryFeeCents: 150,
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

export function resaleBreakdown(priceCents: number, rules: Pick<Rules, 'royaltyPct' | 'buyerFeePct'> = DEFAULT_RULES): ResaleBreakdown {
  const royalty = Math.round((priceCents * rules.royaltyPct) / 100)
  const fee = Math.round((priceCents * rules.buyerFeePct) / 100)
  return { price: priceCents, royalty, seller: priceCents - royalty, fee, buyerTotal: priceCents + fee }
}

export interface JurisdictionProfile {
  id: Jurisdiction
  label: string
  short: string
  capOnFairSeat: true
  openMarket: boolean
  headline: string
  note: string
}

export const JURISDICTIONS: Record<Jurisdiction, JurisdictionProfile> = {
  UK: {
    id: 'UK',
    label: 'United Kingdom',
    short: 'UK',
    capOnFairSeat: true,
    openMarket: false,
    headline: 'Full cap, everywhere',
    note: 'Every resale goes through the FairSeat market and is capped. Compliance is automatic and provable.',
  },
  GA: {
    id: 'GA',
    label: 'Georgia',
    short: 'GA',
    capOnFairSeat: true,
    openMarket: false,
    headline: 'Full cap, everywhere',
    note: 'Like most states: resale only through the official market, capped, with royalties.',
  },
  NY: {
    id: 'NY',
    label: 'New York',
    short: 'NY',
    capOnFairSeat: true,
    openMarket: true,
    headline: 'Free resale protected by state law',
    note: 'The ticket stays transferable to any compatible marketplace. On FairSeat the cap and royalty still apply.',
  },
  CO: {
    id: 'CO',
    label: 'Colorado',
    short: 'CO',
    capOnFairSeat: true,
    openMarket: true,
    headline: 'Free resale protected by state law',
    note: 'Sellers cannot be restricted. The ticket is transferable to any compatible marketplace; FairSeat sales stay capped.',
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
  capacity: number
  price: number // dollars
  resoldPct: number // 0-100
  avgResale: number // dollars
}

export const FESTIVAL_DEFAULTS: FestivalInput = { capacity: 50_000, price: 150, resoldPct: 20, avgResale: 160 }

export function festival(i: FestivalInput, rules: Rules = DEFAULT_RULES) {
  const primaryFee = i.capacity * (rules.primaryFeeCents / 100)
  const resales = Math.round((i.capacity * i.resoldPct) / 100)
  const resaleVolume = resales * i.avgResale
  const resaleFee = resaleVolume * (rules.buyerFeePct / 100)
  const revenue = primaryFee + resaleFee
  const royalties = resaleVolume * (rules.royaltyPct / 100)
  const ops = i.capacity + resales + i.capacity // issue + resales + badges
  const chainCost = ops * 0.01
  return { primaryFee, resales, resaleVolume, resaleFee, revenue, royalties, ops, chainCost, cap: (i.price * rules.capPct) / 100 }
}
