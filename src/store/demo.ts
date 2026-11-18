import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  ADDR,
  EVENTS,
  BEN_PAST_BADGES,
  MAYA_PAST_BADGES,
  MOMENTS,
  moment as momentOf,
  momentIndex,
  type Badge,
  type EventId,
  type LevelId,
  type MomentId,
  type PersonId,
} from '@/data/world'
import { DEFAULT_RULES, capCents, resaleBreakdown, resaleChecks, type Check, type Jurisdiction, type ResaleBreakdown, type Rules } from '@/lib/rules'
import { hashString, txHash } from '@/lib/prng'

/* ───────────────────────── Types ───────────────────────── */

export type Role = 'maya' | 'ben' | 'organizer' | 'artist' | 'gate' | 'proof'
export const ROLES: Role[] = ['maya', 'ben', 'organizer', 'artist', 'gate', 'proof']

export interface Route {
  name: string
  params?: Record<string, string>
}

export interface Ticket {
  id: string
  tokenId: number
  eventId: EventId
  section: string
  row: string
  seat: number
  faceCents: number
  paidCents: number
  owner: PersonId | string
  status: 'active' | 'listed' | 'used' | 'gone'
  transfersLeft: number
  /** previous owner, so the gate can catch "not the owner" */
  prevOwner?: PersonId | string
}

export type TxKind = 'issue' | 'primary' | 'resale' | 'gift' | 'entry' | 'badge' | 'reverted'

export interface Tx {
  id: string
  kind: TxKind
  hash: string
  block: number
  at: string
  eventId: EventId
  eventLabel?: string
  tokenId?: number
  qty?: number
  from?: string
  to?: string
  priceCents?: number
  breakdown?: ResaleBreakdown
  checks?: Check[]
  failed?: Check['id']
  note?: string
  live?: boolean
  parties?: { seller: string; buyer: string }
}

export interface PersonState {
  onboarded: boolean
  verified: boolean
  badges: Badge[]
}

/** A resale listing on the fan-to-fan market. */
export interface MarketListing {
  id: string
  /** set when the seller is one of the demo fans (Maya, Ben) */
  ticketId?: string
  eventId: EventId
  section: string
  row: string
  seat: number
  faceCents: number
  priceCents: number
  seller: PersonId | 'fan'
  sellerName: string
}

export type ScanMode = 'live' | 'screenshot' | 'notOwner'
export interface ScanResult {
  ok: boolean
  code: 'welcome' | 'expired' | 'used' | 'notOwner' | 'noTicket' | 'early'
  title: string
  detail: string
  ticketId?: string
  offline: boolean
  at: number
}

export interface OrgDraft {
  name: string
  venue: string
  date: string
  capacity: number
  priceCents: number
  rules: Rules
}

export interface Celebration {
  person: PersonId
  badge: Badge
  fromLevelBadges: number
}

interface Nav {
  tab: string
  stack: Route[]
}

export interface DemoData {
  role: Role
  moment: MomentId
  maya: PersonState
  ben: PersonState
  tickets: Ticket[]
  market: MarketListing[]
  ledger: Tx[]
  block: number
  botsBlocked: number
  nav: Record<Role, Nav>
  gate: { offline: boolean; pendingSync: number; lastScan: ScanResult | null; entries: number; pendingTx: Tx[] }
  organizer: { secondShowIssued: boolean; draft: OrgDraft }
  artist: { ambient: number }
  celebrations: Celebration[]
  story: { active: boolean; chapter: number }
  lastResaleTxId: string | null
  flags: Record<string, boolean>
}

interface Actions {
  setRole: (r: Role) => void
  push: (role: Role, route: Route) => void
  pop: (role: Role) => void
  popToRoot: (role: Role) => void
  setTab: (role: Role, tab: string) => void
  setStack: (role: Role, tab: string, stack: Route[]) => void
  reset: () => void
  advanceTo: (m: MomentId) => void

  completeOnboarding: (p: PersonId) => void
  addBotsBlocked: (n: number) => void
  buyPrimary: (p: PersonId, eventId: EventId, seats: { section: string; row: string; seat: number; faceCents: number }[]) => string[]
  listForResale: (ticketId: string, priceCents: number) => void
  cancelListing: (ticketId: string) => void
  /** buy any market listing; 'fan' = an anonymous verified fan (demo buyer) */
  buyListing: (p: PersonId | 'fan', listingId: string) => string | null
  /** the canonical flow: buy Maya's Faye Webster listing */
  buyResale: (p: PersonId) => string | null
  attemptBreak: (kind: 'overCap' | 'adminOverride') => Tx
  gift: (ticketId: string, contactId: string, contactAddr: string) => void
  scan: (mode: ScanMode) => ScanResult
  setOffline: (v: boolean) => void
  updateDraft: (d: Partial<OrgDraft>) => void
  updateDraftRules: (r: Partial<Rules>) => void
  issueSecondShow: () => void
  ambientResale: () => void
  dismissCelebration: (p?: PersonId) => void
  setStory: (s: Partial<DemoData['story']>) => void
  /** story helper: fast-forward the canonical flow up to a step */
  setFlag: (k: string, v?: boolean) => void
  ensure: (step: 'mayaOnboarded' | 'mayaBought' | 'listed' | 'benBought' | 'benEntered' | 'after') => void
}

export type DemoState = DemoData & Actions

/* ───────────────────────── Seed ───────────────────────── */

const BASE_BLOCK = 24_118_302
export const NOVA_BASELINE = {
  soldBefore: 4_512,
  botsBlocked: 184_331,
  tourResales: 1_186,
  tourRoyaltyCents: 1_186 * 200,
  waitlist: { Orchestra: 3_120, Mezzanine: 2_480, Balcony: 1_905 },
  gateSeconds: 2.4,
}

export const tokenIdFor = (eventId: string, section: string, row: string, seat: number) =>
  (hashString(`${eventId}-${section}-${row}-${seat}`) % 19_000) + 1_000

/** Maya already owns a Japanese Breakfast seat, so resale can be shown in seconds. */
const existingTicket: Ticket = {
  id: 't-jbreakfast-maya',
  tokenId: tokenIdFor('jbreakfast', 'M2', '12', 9),
  eventId: 'jbreakfast',
  section: 'M2',
  row: '12',
  seat: 9,
  faceCents: 6500,
  paidCents: 6500,
  owner: 'maya',
  status: 'active',
  transfersLeft: DEFAULT_RULES.maxTransfers,
}

function seedLedger(): Tx[] {
  const mk = (i: number, t: Omit<Tx, 'id' | 'hash' | 'block'>): Tx => ({
    id: `seed-${i}`,
    hash: txHash(`seed-${i}`),
    block: BASE_BLOCK - 4000 + i * 517,
    ...t,
  })
  const b = resaleBreakdown(10500, 10000)
  const b2 = resaleBreakdown(10300, 10000)
  return [
    mk(0, { kind: 'issue', at: 'Oct 16 · 10:00 AM', eventId: 'jbreakfast', qty: 4665, from: ADDR.organizer, to: ADDR.tickets, note: 'Japanese Breakfast · Fox Theatre' }),
    mk(1, { kind: 'primary', at: 'Oct 16 · 10:07 AM', eventId: 'jbreakfast', qty: 1, tokenId: existingTicket.tokenId, from: ADDR.tickets, to: ADDR.maya, priceCents: 6500 }),
    mk(2, { kind: 'issue', at: 'Nov 2 · 9:00 AM', eventId: 'nova', qty: 4665, from: ADDR.organizer, to: ADDR.tickets, note: 'Faye Webster · Fox Theatre' }),
    mk(3, {
      kind: 'resale', at: 'Nov 14 · 8:12 PM', eventId: 'nova', eventLabel: 'Tour · Nashville', tokenId: 6311,
      from: '0x91c4' + '2'.repeat(30) + '7e1a0b', to: '0x3fd0' + '8'.repeat(30) + 'c2b914', priceCents: 10500, breakdown: b,
      checks: resaleChecks({ priceCents: 10500, faceCents: 10000, buyerVerified: true, buyerTickets: 1, minutesToShow: 2880 }),
    }),
    mk(4, {
      kind: 'resale', at: 'Nov 15 · 1:47 PM', eventId: 'nova', eventLabel: 'Tour · Asheville', tokenId: 9874,
      from: '0x5e72' + 'a'.repeat(30) + '19dd03', to: '0xb83a' + '4'.repeat(30) + '6f2e71', priceCents: 10300, breakdown: b2,
      checks: resaleChecks({ priceCents: 10300, faceCents: 10000, buyerVerified: true, buyerTickets: 0, minutesToShow: 4320 }),
    }),
  ]
}

/** Illustrative listings from anonymous verified fans, always within the cap. */
function seedMarket(): MarketListing[] {
  const mk = (eventId: EventId, section: string, row: string, seat: number, level: LevelId, pct: number): MarketListing => {
    const face = EVENTS[eventId].levels.find((l) => l.id === level)!.cents
    const price = Math.min(capCents(face), Math.round((face * (100 + pct)) / 100 / 100) * 100)
    return { id: `m-${eventId}-${section}-${row}-${seat}`, eventId, section, row, seat, faceCents: face, priceCents: price, seller: 'fan', sellerName: 'Verified fan' }
  }
  return [
    mk('manchester', 'M2', '12', 4, '100', 5),
    mk('manchester', 'ORC', '12', 11, 'floor', 5),
    mk('manchester', 'ORL', '14', 2, 'floor', 3),
    mk('manchester', 'B4', '7', 15, '200', 0),
    mk('jbreakfast', 'B2', '9', 6, '200', 5),
    mk('lakestreetdive', 'BC', '4', 10, '100', 5),
    mk('waxahatchee', 'OC', '3', 7, 'floor', 0),
    mk('lucydacus', 'OL', '6', 12, 'floor', 5),
    mk('dream', '106', '5', 8, '100', 5),
    mk('gatech', '208', '11', 3, '200', 5),
    mk('aso', 'OC', '8', 5, 'floor', 2),
    mk('improv', 'OC', '3', 4, 'floor', 0),
    mk('puppetry', 'OL', '2', 6, 'floor', 0),
    mk('dreamkids', '112', '6', 9, '100', 5),
  ].filter((l) => EVENTS[l.eventId])
}

const initialNav = (): Record<Role, Nav> => ({
  maya: { tab: 'discover', stack: [] },
  ben: { tab: 'discover', stack: [] },
  organizer: { tab: 'dashboard', stack: [] },
  artist: { tab: 'royalties', stack: [] },
  gate: { tab: 'scan', stack: [] },
  proof: { tab: 'explorer', stack: [] },
})

export const initialData = (): DemoData => ({
  role: 'maya',
  moment: 'presale',
  maya: { onboarded: true, verified: true, badges: [...MAYA_PAST_BADGES] },
  ben: { onboarded: true, verified: true, badges: [...BEN_PAST_BADGES] },
  tickets: [existingTicket],
  market: seedMarket(),
  ledger: seedLedger(),
  block: BASE_BLOCK,
  botsBlocked: NOVA_BASELINE.botsBlocked,
  nav: initialNav(),
  gate: { offline: false, pendingSync: 0, lastScan: null, entries: 0, pendingTx: [] },
  organizer: {
    secondShowIssued: false,
    draft: {
      name: 'Faye Webster · Night 2',
      venue: 'Fox Theatre',
      date: 'Sun, Jun 27, 2027 · 8:00 PM',
      capacity: 4665,
      priceCents: 10000,
      rules: { ...DEFAULT_RULES },
    },
  },
  artist: { ambient: 0 },
  celebrations: [],
  story: { active: false, chapter: 0 },
  lastResaleTxId: null,
  flags: {},
})

/* ───────────────────────── Helpers ───────────────────────── */

export const minutesToShow = (eventId: EventId, m: MomentId) => EVENTS[eventId].startMin - momentOf(m).min
export const isAtOrAfter = (cur: MomentId, target: MomentId) => momentIndex(cur) >= momentIndex(target)
export const ticketsOf = (s: DemoData, p: PersonId | string) => s.tickets.filter((t) => t.owner === p && t.status !== 'gone')
/** Maya's Faye Webster listing: the canonical resale of the story. */
export const novaListing = (s: DemoData) => s.market.find((l) => l.eventId === 'nova' && l.seller === 'maya')
export const listingOf = (s: DemoData, ticketId: string) => s.market.find((l) => l.ticketId === ticketId)
/** Resale is open until 2 hours before the show. */
export const resaleOpen = (s: DemoData, eventId: EventId) => minutesToShow(eventId, s.moment) > 120
export const marketFor = (s: DemoData, eventId: EventId) => s.market.filter((l) => l.eventId === eventId).sort((a, b) => a.priceCents - b.priceCents)

const ADDR_OF = (p: PersonId | string) => (p === 'maya' ? ADDR.maya : p === 'ben' ? ADDR.ben : (ADDR as Record<string, string>)[p] ?? ADDR.lucia)

let txCounter = 0
function nextTx(s: DemoData, t: Omit<Tx, 'id' | 'hash' | 'block' | 'at'>): [Tx, number] {
  txCounter++
  const block = s.block + 3 + (txCounter % 5)
  const id = `live-${s.ledger.length}-${t.kind}`
  return [{ ...t, id, hash: txHash(id + block), block, at: momentOf(s.moment).label, live: true }, block]
}

function novaBadge(): Badge {
  return { id: 'b-nova-live', eventId: 'nova', artist: 'Faye Webster', venue: 'Fox Theatre', date: 'Jun 26, 2027', hue: 220 }
}

/* ───────────────────────── Store ───────────────────────── */

export const useDemo = create<DemoState>()(
  persist(
    (set, get) => ({
      ...initialData(),

      setRole: (role) => set({ role }),
      push: (role, route) => set((s) => ({ nav: { ...s.nav, [role]: { ...s.nav[role], stack: [...s.nav[role].stack, route] } } })),
      pop: (role) => set((s) => ({ nav: { ...s.nav, [role]: { ...s.nav[role], stack: s.nav[role].stack.slice(0, -1) } } })),
      popToRoot: (role) => set((s) => ({ nav: { ...s.nav, [role]: { ...s.nav[role], stack: [] } } })),
      setTab: (role, tab) => set((s) => ({ nav: { ...s.nav, [role]: { tab, stack: [] } } })),
      setStack: (role, tab, stack) => set((s) => ({ nav: { ...s.nav, [role]: { tab, stack } } })),

      reset: () => {
        txCounter = 0
        set({ ...initialData() })
      },

      advanceTo: (target) => {
        const s = get()
        if (momentIndex(target) <= momentIndex(s.moment)) return
        let next: DemoData = { ...s }
        const steps = MOMENTS.slice(momentIndex(s.moment) + 1, momentIndex(target) + 1)
        for (const m of steps) {
          next = { ...next, moment: m.id }
          // The featured show ends → whoever entered gets a badge
          if (m.id === 'after') {
            for (const p of ['maya', 'ben'] as PersonId[]) {
              const used = next.tickets.find((t) => t.eventId === 'nova' && t.owner === p && t.status === 'used')
              if (used && !next[p].badges.some((b) => b.id === 'b-nova-live')) {
                const badge = novaBadge()
                const [btx, b2] = nextTx(next, { kind: 'badge', eventId: 'nova', to: ADDR_OF(p), note: '"I was there" · soulbound' })
                next = {
                  ...next,
                  block: b2,
                  ledger: [btx, ...next.ledger],
                  [p]: { ...next[p], badges: [...next[p].badges, badge] },
                  celebrations: [...next.celebrations, { person: p, badge, fromLevelBadges: next[p].badges.length }],
                }
              }
            }
          }
        }
        set(next)
      },

      completeOnboarding: (p) => {
        const s = get()
        let next: DemoData = { ...s, [p]: { ...s[p], onboarded: true, verified: true } }
        set(next)
      },

      addBotsBlocked: (n) => set((s) => ({ botsBlocked: s.botsBlocked + n })),

      buyPrimary: (p, eventId, seats) => {
        const s = get()
        const owned = ticketsOf(s, p).filter((t) => t.eventId === eventId).length
        const allowed = Math.max(0, DEFAULT_RULES.maxPerPerson - owned)
        const take = seats.slice(0, allowed)
        const newTickets: Ticket[] = take.map((st) => ({
          id: `t-${eventId}-${p}-${st.section}-${st.row}-${st.seat}`,
          tokenId: tokenIdFor(eventId, st.section, st.row, st.seat),
          eventId,
          section: st.section,
          row: st.row,
          seat: st.seat,
          faceCents: st.faceCents,
          paidCents: st.faceCents,
          owner: p,
          status: 'active',
          transfersLeft: DEFAULT_RULES.maxTransfers,
        }))
        let next: DemoData = { ...s }
        for (const t of newTickets) {
          const [tx, b] = nextTx(next, {
            kind: 'primary',
            eventId,
            qty: 1,
            tokenId: t.tokenId,
            from: ADDR.tickets,
            to: ADDR_OF(p),
            priceCents: t.faceCents,
            note: `Organizer fee 1% · Sec ${t.section} · Row ${t.row} · Seat ${t.seat}`,
          })
          next = { ...next, block: b, ledger: [tx, ...next.ledger] }
        }
        set({ ...next, tickets: [...next.tickets, ...newTickets] })
        return newTickets.map((t) => t.id)
      },

      listForResale: (ticketId, priceCents) => {
        const s = get()
        const t = s.tickets.find((x) => x.id === ticketId)
        if (!t || (t.owner !== 'maya' && t.owner !== 'ben')) return
        const price = Math.min(priceCents, capCents(t.faceCents))
        const l: MarketListing = {
          id: `l-${ticketId}`,
          ticketId,
          eventId: t.eventId,
          section: t.section,
          row: t.row,
          seat: t.seat,
          faceCents: t.faceCents,
          priceCents: price,
          seller: t.owner,
          sellerName: t.owner === 'maya' ? 'Maya' : 'Ben',
        }
        set({
          market: [l, ...s.market.filter((x) => x.ticketId !== ticketId)],
          tickets: s.tickets.map((x) => (x.id === ticketId ? { ...x, status: 'listed' } : x)),
        })
      },

      cancelListing: (ticketId) => {
        const s = get()
        set({
          market: s.market.filter((x) => x.ticketId !== ticketId),
          tickets: s.tickets.map((x) => (x.id === ticketId && x.status === 'listed' ? { ...x, status: 'active' } : x)),
        })
      },

      buyListing: (p, listingId) => {
        const s = get()
        const l = s.market.find((x) => x.id === listingId)
        if (!l || l.seller === p) return null
        const br = resaleBreakdown(l.priceCents, l.faceCents)
        const checks = resaleChecks({
          priceCents: l.priceCents,
          faceCents: l.faceCents,
          buyerVerified: p === 'fan' ? true : s[p].verified,
          buyerTickets: p === 'fan' ? 0 : ticketsOf(s, p).filter((x) => x.eventId === l.eventId).length,
          minutesToShow: minutesToShow(l.eventId, s.moment),
        })
        if (checks.some((c) => !c.ok)) return null
        const old = l.ticketId ? s.tickets.find((x) => x.id === l.ticketId) : undefined
        const tokenId = old?.tokenId ?? tokenIdFor(l.eventId, l.section, l.row, l.seat)
        const anon = (k: string) => txHash(`anon-${k}-${l.id}`).slice(0, 42)
        const [tx, b] = nextTx(s, {
          kind: 'resale',
          eventId: l.eventId,
          tokenId,
          from: l.seller === 'fan' ? anon('seller') : ADDR_OF(l.seller),
          to: p === 'fan' ? anon('buyer') : ADDR_OF(p),
          priceCents: l.priceCents,
          breakdown: br,
          checks,
          note: `Sec ${l.section} · Row ${l.row} · Seat ${l.seat}`,
          parties: { seller: l.sellerName, buyer: p === 'fan' ? 'Verified fan' : p === 'maya' ? 'Maya' : 'Ben' },
        })
        const newId = old ? `${old.id}-r-${p}` : `t-${l.eventId}-${p}-${l.section}-${l.row}-${l.seat}-r`
        let tickets = s.tickets.map((x) => (old && x.id === old.id ? { ...x, status: 'gone' as const } : x))
        if (p !== 'fan') {
          const base: Ticket = old ?? {
            id: newId,
            tokenId,
            eventId: l.eventId,
            section: l.section,
            row: l.row,
            seat: l.seat,
            faceCents: l.faceCents,
            paidCents: 0,
            owner: 'fan',
            status: 'active',
            transfersLeft: DEFAULT_RULES.maxTransfers,
          }
          tickets = [
            ...tickets,
            { ...base, id: newId, owner: p, prevOwner: l.seller, status: 'active', paidCents: br.buyerTotal, transfersLeft: DEFAULT_RULES.maxTransfers },
          ]
        }
        set({
          block: b,
          ledger: [tx, ...s.ledger],
          market: s.market.filter((x) => x.id !== l.id),
          lastResaleTxId: tx.id,
          tickets,
        })
        return p === 'fan' ? tx.id : newId
      },

      buyResale: (p) => {
        const l = novaListing(get())
        return l ? get().buyListing(p, l.id) : null
      },

      attemptBreak: (kind) => {
        const s = get()
        const price = 40000
        const checks = resaleChecks({ priceCents: price, faceCents: 10000, buyerVerified: true, buyerTickets: 0, minutesToShow: 2000 })
        const [tx, b] = nextTx(s, {
          kind: 'reverted',
          eventId: 'nova',
          tokenId: 14207,
          from: kind === 'adminOverride' ? ADDR.treasury : ADDR.maya,
          to: ADDR.ben,
          priceCents: price,
          checks,
          failed: 'cap',
          note: kind === 'adminOverride' ? 'Sent by the Proof of Seat admin key. Reverted: no one can bypass the cap.' : 'Resale at $400. Reverted by the contract.',
        })
        set({ block: b, ledger: [tx, ...s.ledger] })
        return tx
      },

      gift: (ticketId, contactId, contactAddr) => {
        const s = get()
        const t = s.tickets.find((x) => x.id === ticketId)
        if (!t || t.transfersLeft <= 0) return
        const [tx, b] = nextTx(s, { kind: 'gift', eventId: t.eventId, tokenId: t.tokenId, from: ADDR_OF(t.owner), to: contactAddr, note: 'Gift to a verified fan · $0' })
        set({
          block: b,
          ledger: [tx, ...s.ledger],
          tickets: s.tickets.map((x) =>
            x.id === ticketId ? { ...x, owner: contactId, prevOwner: x.owner, transfersLeft: x.transfersLeft - 1 } : x,
          ),
        })
      },

      scan: (mode) => {
        const s = get()
        const offline = s.gate.offline
        const at = Date.now()
        const finish = (r: Omit<ScanResult, 'offline' | 'at'>) => {
          const res = { ...r, offline, at }
          set({ gate: { ...get().gate, lastScan: res } })
          return res
        }
        if (!isAtOrAfter(s.moment, 'doors')) {
          return finish({ ok: false, code: 'early', title: 'Doors not open yet', detail: 'Doors open Sat, Jun 26 at 6:30 PM.' })
        }
        if (mode === 'screenshot') {
          return finish({ ok: false, code: 'expired', title: 'Code expired', detail: 'This code is a few minutes old. Screenshots don’t get in.' })
        }
        if (mode === 'notOwner') {
          return finish({ ok: false, code: 'notOwner', title: 'Not the owner', detail: 'This ticket was resold. It now belongs to another verified fan.' })
        }
        const t = s.tickets.find((x) => x.eventId === 'nova' && x.owner === 'ben' && x.status !== 'gone')
        if (!t) return finish({ ok: false, code: 'noTicket', title: 'No valid ticket', detail: 'Ben has no ticket for tonight yet.' })
        if (t.status === 'used') return finish({ ok: false, code: 'used', title: 'Already used', detail: 'Checked in at 7:42 PM · Main Entrance.', ticketId: t.id })
        const [tx, b] = nextTx(s, { kind: 'entry', eventId: 'nova', tokenId: t.tokenId, from: ADDR.ben, note: offline ? 'Validated offline · synced later' : 'Checked in · Main Entrance' })
        set({
          block: b,
          ledger: offline ? s.ledger : [tx, ...s.ledger],
          tickets: s.tickets.map((x) => (x.id === t.id ? { ...x, status: 'used' } : x)),
          gate: {
            ...s.gate,
            entries: s.gate.entries + 1,
            pendingSync: offline ? s.gate.pendingSync + 1 : s.gate.pendingSync,
            pendingTx: offline ? [...s.gate.pendingTx, tx] : s.gate.pendingTx,
          },
        })
        return finish({ ok: true, code: 'welcome', title: 'Welcome, Ben', detail: `Sec ${t.section} · Row ${t.row} · Seat ${t.seat}`, ticketId: t.id })
      },

      setOffline: (v) => {
        const s = get()
        if (!v && s.gate.pendingTx.length) {
          set({ ledger: [...s.gate.pendingTx].reverse().concat(s.ledger), gate: { ...s.gate, offline: false, pendingSync: 0, pendingTx: [] } })
          return
        }
        set({ gate: { ...s.gate, offline: v } })
      },

      updateDraft: (d) => set((s) => ({ organizer: { ...s.organizer, draft: { ...s.organizer.draft, ...d } } })),
      updateDraftRules: (r) =>
        set((s) => ({ organizer: { ...s.organizer, draft: { ...s.organizer.draft, rules: { ...s.organizer.draft.rules, ...r } } } })),

      issueSecondShow: () => {
        const s = get()
        if (s.organizer.secondShowIssued) return
        const [tx, b] = nextTx(s, {
          kind: 'issue',
          eventId: 'nova',
          qty: s.organizer.draft.capacity,
          from: ADDR.organizer,
          to: ADDR.tickets,
          note: `${s.organizer.draft.name} · cap ${s.organizer.draft.rules.capPct}% · royalty ${s.organizer.draft.rules.royaltyPct}% · ${s.organizer.draft.rules.jurisdiction}`,
        })
        set({ block: b, ledger: [tx, ...s.ledger], organizer: { ...s.organizer, secondShowIssued: true } })
      },

      ambientResale: () => {
        const s = get()
        const n = s.artist.ambient + 1
        const cities = ['Nashville', 'Asheville', 'Chicago', 'Brooklyn', 'Philadelphia', 'Austin', 'Denver', 'Seattle']
        const br = resaleBreakdown(10500, 10000)
        const [tx, b] = nextTx(s, {
          kind: 'resale',
          eventId: 'nova',
          eventLabel: `Tour · ${cities[n % cities.length]}`,
          tokenId: 1000 + ((n * 7919) % 19000),
          from: txHash(`amb-from-${n}`).slice(0, 42),
          to: txHash(`amb-to-${n}`).slice(0, 42),
          priceCents: 10500,
          breakdown: br,
          checks: resaleChecks({ priceCents: 10500, faceCents: 10000, buyerVerified: true, buyerTickets: n % 3, minutesToShow: 3000 }),
        })
        set({ block: b, ledger: [tx, ...s.ledger].slice(0, 120), artist: { ambient: n } })
      },

      setFlag: (k, v = true) => set((s) => ({ flags: { ...s.flags, [k]: v } })),
      dismissCelebration: (p) =>
        set((s) => {
          const i = p ? s.celebrations.findIndex((c) => c.person === p) : 0
          return i < 0 ? s : { celebrations: s.celebrations.filter((_, k) => k !== i) }
        }),
      setStory: (st) => set((s) => ({ story: { ...s.story, ...st } })),

      ensure: (step) => {
        const order = ['mayaOnboarded', 'mayaBought', 'listed', 'benBought', 'benEntered', 'after'] as const
        const idx = order.indexOf(step)
        const st = () => get()
        if (idx >= 0 && !st().maya.onboarded) st().completeOnboarding('maya')
        if (idx >= 1 && !st().tickets.some((t) => t.eventId === 'nova' && (t.owner === 'maya' || t.prevOwner === 'maya'))) {
          st().addBotsBlocked(4_812)
          st().buyPrimary('maya', 'nova', [{ section: 'M3', row: '14', seat: 7, faceCents: 10000 }])
        }
        if (idx >= 2 && !novaListing(st()) && !st().tickets.some((t) => t.eventId === 'nova' && t.owner === 'ben')) {
          const mt = st().tickets.find((t) => t.eventId === 'nova' && t.owner === 'maya' && t.status === 'active')
          if (mt) st().listForResale(mt.id, capCents(mt.faceCents))
        }
        if (idx >= 3 && !st().tickets.some((t) => t.eventId === 'nova' && t.owner === 'ben')) st().buyResale('ben')
        if (idx >= 4) {
          st().advanceTo('doors')
          const bt = st().tickets.find((t) => t.eventId === 'nova' && t.owner === 'ben')
          if (bt && bt.status !== 'used') {
            const off = st().gate.offline
            if (off) st().setOffline(false)
            st().scan('live')
          }
        }
        if (idx >= 5) st().advanceTo('after')
      },
    }),
    {
      name: 'proofofseat-demo-v5',
      version: 1,
      storage: createJSONStorage(() => {
        try {
          return window.localStorage
        } catch {
          return undefined as unknown as Storage
        }
      }),
      partialize: (s) => {
        const data: Partial<DemoState> = { ...s }
        // celebrations are transient UI; don't replay them after a reload
        data.celebrations = []
        return data
      },
    },
  ),
)

/* ───────────────────────── Selectors ───────────────────────── */

export const selectJurisdiction = (s: DemoData): Jurisdiction => s.organizer.draft.rules.jurisdiction

export function novaStats(s: DemoData) {
  const mayaBought = s.tickets.some((t) => t.eventId === 'nova' && (t.owner === 'maya' || t.prevOwner === 'maya'))
  const livePrimaries = s.ledger.filter((t) => t.live && t.kind === 'primary').length
  const sold = mayaBought ? 4_665 : NOVA_BASELINE.soldBefore + livePrimaries
  const liveResales = s.ledger.filter((t) => t.live && t.kind === 'resale' && t.eventId === 'nova')
  const resales = NOVA_BASELINE.tourResales + liveResales.length
  const royaltyCents = NOVA_BASELINE.tourRoyaltyCents + liveResales.reduce((a, t) => a + (t.breakdown?.royalty ?? 0), 0)
  const entries = s.gate.entries
  return {
    sold,
    capacity: 4_665,
    revenueCents: sold * 9_500,
    botsBlocked: s.botsBlocked,
    resales,
    withinCapPct: 100,
    royaltyCents,
    liveResales: liveResales.length,
    entries,
    soldOut: mayaBought,
  }
}
