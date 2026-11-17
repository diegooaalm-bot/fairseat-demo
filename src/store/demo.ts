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
}

export interface PersonState {
  onboarded: boolean
  verified: boolean
  badges: Badge[]
}

export interface Listing {
  ticketId: string
  priceCents: number
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
  listing: Listing | null
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
  cancelListing: () => void
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
  soldBefore: 69_846,
  botsBlocked: 1_284_331,
  tourResales: 7_514,
  tourRoyaltyCents: 7_514 * 550,
  waitlist: { Floor: 31_480, '100 Level': 24_910, '200 Level': 12_660, '300 Level': 19_150 },
  gateSeconds: 2.4,
}

export const tokenIdFor = (eventId: string, section: string, row: string, seat: number) =>
  (hashString(`${eventId}-${section}-${row}-${seat}`) % 19_000) + 1_000

const existingTicket: Ticket = {
  id: 't-zach-maya',
  tokenId: tokenIdFor('zach', '118', '22', 9),
  eventId: 'zach',
  section: '118',
  row: '22',
  seat: 9,
  faceCents: 16000,
  paidCents: 16000,
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
  const b = resaleBreakdown(11000)
  const b2 = resaleBreakdown(10500)
  return [
    mk(0, { kind: 'issue', at: 'Oct 16 · 10:00 AM', eventId: 'zach', qty: 71000, from: ADDR.organizer, to: ADDR.tickets, note: 'Zach Bryan · Mercedes-Benz Stadium' }),
    mk(1, { kind: 'primary', at: 'Oct 16 · 10:07 AM', eventId: 'zach', qty: 1, tokenId: existingTicket.tokenId, from: ADDR.tickets, to: ADDR.maya, priceCents: 16000 }),
    mk(2, { kind: 'issue', at: 'Nov 2 · 9:00 AM', eventId: 'nova', qty: 71000, from: ADDR.organizer, to: ADDR.tickets, note: 'Bad Bunny · Mercedes-Benz Stadium' }),
    mk(3, {
      kind: 'resale', at: 'Nov 14 · 8:12 PM', eventId: 'nova', eventLabel: 'World Tour · Madrid', tokenId: 6311,
      from: '0x91c4' + '2'.repeat(30) + '7e1a0b', to: '0x3fd0' + '8'.repeat(30) + 'c2b914', priceCents: 11000, breakdown: b,
      checks: resaleChecks({ priceCents: 11000, faceCents: 10000, buyerVerified: true, buyerTickets: 1, minutesToShow: 2880 }),
    }),
    mk(4, {
      kind: 'resale', at: 'Nov 15 · 1:47 PM', eventId: 'nova', eventLabel: 'World Tour · Barcelona', tokenId: 9874,
      from: '0x5e72' + 'a'.repeat(30) + '19dd03', to: '0xb83a' + '4'.repeat(30) + '6f2e71', priceCents: 10500, breakdown: b2,
      checks: resaleChecks({ priceCents: 10500, faceCents: 10000, buyerVerified: true, buyerTickets: 0, minutesToShow: 4320 }),
    }),
  ]
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
  listing: null,
  ledger: seedLedger(),
  block: BASE_BLOCK,
  botsBlocked: NOVA_BASELINE.botsBlocked,
  nav: initialNav(),
  gate: { offline: false, pendingSync: 0, lastScan: null, entries: 0, pendingTx: [] },
  organizer: {
    secondShowIssued: false,
    draft: {
      name: 'Bad Bunny · Night 2',
      venue: 'Mercedes-Benz Stadium',
      date: 'Sun, Jun 27, 2027 · 8:00 PM',
      capacity: 71000,
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

const ADDR_OF = (p: PersonId | string) => (p === 'maya' ? ADDR.maya : p === 'ben' ? ADDR.ben : (ADDR as Record<string, string>)[p] ?? ADDR.lucia)

let txCounter = 0
function nextTx(s: DemoData, t: Omit<Tx, 'id' | 'hash' | 'block' | 'at'>): [Tx, number] {
  txCounter++
  const block = s.block + 3 + (txCounter % 5)
  const id = `live-${s.ledger.length}-${t.kind}`
  return [{ ...t, id, hash: txHash(id + block), block, at: momentOf(s.moment).label, live: true }, block]
}

function novaBadge(): Badge {
  return { id: 'b-nova-live', eventId: 'nova', artist: 'Bad Bunny', venue: 'Mercedes-Benz Stadium', date: 'Jun 26, 2027', hue: 220 }
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
            note: `Organizer fee $1.50 · Sec ${t.section} · Row ${t.row} · Seat ${t.seat}`,
          })
          next = { ...next, block: b, ledger: [tx, ...next.ledger] }
        }
        set({ ...next, tickets: [...next.tickets, ...newTickets] })
        return newTickets.map((t) => t.id)
      },

      listForResale: (ticketId, priceCents) => {
        const s = get()
        const t = s.tickets.find((x) => x.id === ticketId)
        if (!t) return
        const price = Math.min(priceCents, capCents(t.faceCents))
        set({
          listing: { ticketId, priceCents: price },
          tickets: s.tickets.map((x) => (x.id === ticketId ? { ...x, status: 'listed' } : x)),
        })
      },

      cancelListing: () => {
        const s = get()
        if (!s.listing) return
        const id = s.listing.ticketId
        set({ listing: null, tickets: s.tickets.map((x) => (x.id === id ? { ...x, status: 'active' } : x)) })
      },

      buyResale: (p) => {
        const s = get()
        if (!s.listing) return null
        const t = s.tickets.find((x) => x.id === s.listing!.ticketId)
        if (!t) return null
        const br = resaleBreakdown(s.listing.priceCents)
        const checks = resaleChecks({
          priceCents: s.listing.priceCents,
          faceCents: t.faceCents,
          buyerVerified: s[p].verified,
          buyerTickets: ticketsOf(s, p).filter((x) => x.eventId === t.eventId).length,
          minutesToShow: minutesToShow(t.eventId, s.moment),
        })
        if (checks.some((c) => !c.ok)) return null
        const [tx, b] = nextTx(s, {
          kind: 'resale',
          eventId: t.eventId,
          tokenId: t.tokenId,
          from: ADDR_OF(t.owner),
          to: ADDR_OF(p),
          priceCents: s.listing.priceCents,
          breakdown: br,
          checks,
        })
        const newId = `${t.id}-r-${p}`
        set({
          block: b,
          ledger: [tx, ...s.ledger],
          listing: null,
          lastResaleTxId: tx.id,
          tickets: [
            ...s.tickets.map((x) => (x.id === t.id ? { ...x, status: 'gone' as const } : x)),
            { ...t, id: newId, owner: p, prevOwner: t.owner, status: 'active', paidCents: br.buyerTotal, transfersLeft: DEFAULT_RULES.maxTransfers },
          ],
        })
        return newId
      },

      attemptBreak: (kind) => {
        const s = get()
        const price = kind === 'overCap' ? 40000 : 40000
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
          note: kind === 'adminOverride' ? 'Sent by the FairSeat admin key. Reverted: no one can bypass the cap.' : 'Resale at $400. Reverted by the contract.',
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
        if (t.status === 'used') return finish({ ok: false, code: 'used', title: 'Already used', detail: 'Checked in at 7:42 PM · North Gate.', ticketId: t.id })
        const [tx, b] = nextTx(s, { kind: 'entry', eventId: 'nova', tokenId: t.tokenId, from: ADDR.ben, note: offline ? 'Validated offline · synced later' : 'Checked in · North Gate' })
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
        const cities = ['Madrid', 'Barcelona', 'Mexico City', 'São Paulo', 'Buenos Aires', 'London', 'Paris', 'Brussels']
        const br = resaleBreakdown(11000)
        const [tx, b] = nextTx(s, {
          kind: 'resale',
          eventId: 'nova',
          eventLabel: `World Tour · ${cities[n % cities.length]}`,
          tokenId: 1000 + ((n * 7919) % 19000),
          from: txHash(`amb-from-${n}`).slice(0, 42),
          to: txHash(`amb-to-${n}`).slice(0, 42),
          priceCents: 11000,
          breakdown: br,
          checks: resaleChecks({ priceCents: 11000, faceCents: 10000, buyerVerified: true, buyerTickets: n % 3, minutesToShow: 3000 }),
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
          st().buyPrimary('maya', 'nova', [{ section: '312', row: '14', seat: 7, faceCents: 10000 }])
        }
        if (idx >= 2 && !st().listing && !st().tickets.some((t) => t.eventId === 'nova' && t.owner === 'ben')) {
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
      name: 'fairseat-demo-v3',
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
  const sold = mayaBought ? 71_000 : NOVA_BASELINE.soldBefore + livePrimaries
  const liveResales = s.ledger.filter((t) => t.live && t.kind === 'resale')
  const resales = NOVA_BASELINE.tourResales + liveResales.length
  const royaltyCents = NOVA_BASELINE.tourRoyaltyCents + liveResales.reduce((a, t) => a + (t.breakdown?.royalty ?? 0), 0)
  const entries = s.gate.entries
  return {
    sold,
    capacity: 71_000,
    revenueCents: sold * 15_200,
    botsBlocked: s.botsBlocked,
    resales,
    withinCapPct: 100,
    royaltyCents,
    liveResales: liveResales.length,
    entries,
    soldOut: mayaBought,
  }
}
