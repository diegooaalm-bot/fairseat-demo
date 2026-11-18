import { motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { ArrowLeftRight, BadgeCheck, CalendarClock, Check, ChevronRight, Lock, Percent, ShieldCheck, Tag, Users } from 'lucide-react'
import { EventImage } from '@/components/art/EventImage'
import { TicketCard } from '@/components/ticket/TicketCard'
import { Button } from '@/components/ui/Button'
import { MoneySplit } from '@/components/ui/MoneySplit'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { Pill } from '@/components/ui/Pill'
import { Segmented } from '@/components/ui/Segmented'
import { ADDR, EVENTS, type EventId, type PersonId } from '@/data/world'
import { haptic } from '@/lib/haptics'
import { usd } from '@/lib/money'
import { DEFAULT_RULES, capCents, resaleBreakdown } from '@/lib/rules'
import { Screen } from '@/demo/shell/Screen'
import { listingOf, minutesToShow, resaleOpen, ticketsOf, useDemo, type MarketListing } from '@/store/demo'
import { useUI } from '@/store/ui'
import { PaySheet } from './PaySheet'

/** Price relative to face value, as a short label. */
export function markup(l: Pick<MarketListing, 'priceCents' | 'faceCents'>) {
  const p = Math.round(((l.priceCents - l.faceCents) / l.faceCents) * 100)
  return p === 0 ? 'Face value' : p > 0 ? `+${p}%` : `${p}%`
}

/* ───────────────────────── Resale tab ───────────────────────── */

export function ResaleHub({ person }: { person: PersonId }) {
  const side = useUI((s) => s.resaleSide)
  const setSide = useUI((s) => s.setResaleSide)
  return (
    <Screen title="Resale" tabBar roleButton>
      <div className="flex flex-col gap-4 px-5">
        <p className="-mt-1 text-[15px] leading-snug text-fg-2">Buy and sell tickets fan to fan. The price can never go above 105% of face value.</p>
        <Segmented
          size="lg"
          value={side}
          onChange={(v) => setSide(v)}
          options={[
            { value: 'buy', label: 'Buy tickets', icon: <Tag size={15} /> },
            { value: 'sell', label: 'Sell a ticket', icon: <ArrowLeftRight size={15} /> },
          ]}
        />
        <RulesStrip />
        {side === 'buy' ? <BuySide person={person} /> : <SellSide person={person} />}
      </div>
    </Screen>
  )
}

function RulesStrip() {
  const items: [ReactNode, string, string][] = [
    [<ShieldCheck size={17} />, 'Max 105%', 'of face value'],
    [<Percent size={17} />, '2% to the artist', 'on every resale'],
    [<BadgeCheck size={17} />, 'Verified fans', 'buyers and sellers'],
    [<CalendarClock size={17} />, 'Closes 2 h', 'before the show'],
  ]
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[16px] bg-white/[0.06] hairline">
      {items.map(([icon, k, s]) => (
        <div key={k} className="flex items-center gap-2.5 bg-ink-3 px-3 py-2.5">
          <span className="text-accent-soft">{icon}</span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[13px] font-semibold">{k}</span>
            <span className="block truncate text-[11px] text-fg-3">{s}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function BuySide({ person }: { person: PersonId }) {
  const market = useDemo((s) => s.market)
  const moment = useDemo((s) => s.moment)
  const push = useDemo((s) => s.push)
  const open = market.filter((l) => l.seller !== person && minutesToShow(l.eventId, moment) > 120)
  const isSoldOut = (id: EventId) => EVENTS[id].status === 'soldout' || id === 'nova'
  const events = [...new Set(open.map((l) => l.eventId))].sort((a, b) => Number(isSoldOut(b)) - Number(isSoldOut(a)) || EVENTS[a].startMin - EVENTS[b].startMin)
  const firstOther = events.findIndex((id) => !isSoldOut(id))
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between px-0.5">
        <h2 className="text-[20px] font-bold tracking-[-0.02em]">Available now</h2>
        <span className="text-[13px] text-fg-3">
          {open.length} tickets · {events.length} events
        </span>
      </div>
      {events.map((id, i) => (
        <div key={id} className="flex flex-col gap-2">
          {(i === 0 || i === firstOther) && (
            <div className="px-0.5 text-[12px] font-semibold tracking-[0.04em] text-fg-3 uppercase">{isSoldOut(id) ? 'Sold-out shows' : 'More resale tickets'}</div>
          )}
          <EventListings id={id} listings={open.filter((l) => l.eventId === id).sort((a, b) => a.priceCents - b.priceCents)} onOpen={(l) => push(person, { name: 'offer', params: { id: l.id } })} />
        </div>
      ))}
      <p className="px-0.5 text-[11px] leading-snug text-fg-3">Listings are illustrative. Every price shown is checked against the cap written into the ticket.</p>
    </section>
  )
}

export function EventListings({ id, listings, onOpen, header = true, viewer }: { id: EventId; listings: MarketListing[]; onOpen: (l: MarketListing) => void; header?: boolean; viewer?: PersonId }) {
  const ev = EVENTS[id]
  const soldOut = ev.status === 'soldout' || (id === 'nova' && listings.some((l) => l.seller === 'maya'))
  return (
    <div className="overflow-hidden rounded-[16px] bg-ink-3 hairline">
      {header && (
        <div className="flex items-center gap-3 border-b border-white/[0.06] p-3">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[10px]">
            <EventImage id={id} size="card" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold">{ev.artist}</span>
            <span className="block truncate text-[12px] text-fg-3">
              {ev.dateLabel.replace(/, \d{4}$/, '')} · {ev.venue}
            </span>
          </span>
          {soldOut && <span className="shrink-0 rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-semibold text-fg-2">Sold out</span>}
        </div>
      )}
      {listings.map((l) => (
        <ListingRow key={l.id} l={l} mine={l.seller === viewer} onClick={() => onOpen(l)} />
      ))}
    </div>
  )
}

export function ListingRow({ l, onClick, mine }: { l: MarketListing; onClick: () => void; mine?: boolean }) {
  return (
    <motion.button
      whileTap={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      onClick={() => (haptic('light'), onClick())}
      className="flex w-full items-center gap-3 border-b border-white/[0.06] px-3.5 py-3 text-left last:border-0"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold">
          Sec {l.section} · Row {l.row} · Seat {l.seat}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-fg-3">
          {mine ? (
            <span className="font-semibold text-accent-soft">Your listing</span>
          ) : (
            <>
              <BadgeCheck size={12} className="text-ok" /> {l.sellerName}
            </>
          )}
          <span>· Face {usd(l.faceCents, { cents: l.faceCents % 100 !== 0 })}</span>
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-[17px] font-bold tracking-[-0.01em] tabular">{usd(l.priceCents, { cents: l.priceCents % 100 !== 0 })}</span>
        <span className={`block text-[11px] font-semibold ${l.priceCents >= capCents(l.faceCents) ? 'text-accent-soft' : 'text-ok'}`}>
          {markup(l)}
          {l.priceCents >= capCents(l.faceCents) ? ' · at cap' : ''}
        </span>
      </span>
      <ChevronRight size={17} className="shrink-0 text-fg-3" />
    </motion.button>
  )
}

function SellSide({ person }: { person: PersonId }) {
  const s = useDemo()
  const push = s.push
  const mine = ticketsOf(s, person)
    .filter((t) => t.status !== 'used')
    .sort((a, b) => EVENTS[a.eventId].startMin - EVENTS[b.eventId].startMin)
  const addr = person === 'maya' ? ADDR.maya : ADDR.ben
  const sold = s.ledger.filter((tx) => tx.kind === 'resale' && tx.live && tx.from === addr)
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="mb-2 px-0.5 text-[20px] font-bold tracking-[-0.02em]">Your tickets</h2>
        {mine.length === 0 ? (
          <div className="rounded-[16px] bg-ink-3 p-4 text-[14px] text-fg-2 hairline">No tickets to sell yet. Tickets you buy appear here.</div>
        ) : (
          <div className="overflow-hidden rounded-[16px] bg-ink-3 hairline">
            {mine.map((t) => {
              const ev = EVENTS[t.eventId]
              const l = listingOf(s, t.id)
              const open = resaleOpen(s, t.eventId)
              return (
                <motion.button
                  key={t.id}
                  whileTap={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  onClick={() => (haptic('light'), push(person, { name: 'resell', params: { id: t.id } }))}
                  className="flex w-full items-center gap-3 border-b border-white/[0.06] p-3 text-left last:border-0"
                >
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px]">
                    <EventImage id={t.eventId} size="card" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{ev.artist}</span>
                    <span className="block truncate text-[12px] text-fg-3">
                      {ev.dateLabel.replace(/, \d{4}$/, '')} · Sec {t.section} · Row {t.row} · Seat {t.seat}
                    </span>
                    <span className="block text-[12px] text-fg-3">
                      Face {usd(t.faceCents)} · max resale <b className="font-semibold text-fg-2">{usd(capCents(t.faceCents))}</b>
                    </span>
                  </span>
                  {l ? (
                    <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-1 text-[12px] font-semibold text-accent-soft">Listed {usd(l.priceCents)}</span>
                  ) : open ? (
                    <span className="shrink-0 rounded-full bg-accent-fill px-3 py-1.5 text-[13px] font-semibold text-white">Sell</span>
                  ) : (
                    <span className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-fg-3">
                      <Lock size={13} /> Closed
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      {sold.length > 0 && (
        <div>
          <h2 className="mb-2 px-0.5 text-[15px] font-semibold text-fg-2">Sold</h2>
          <div className="overflow-hidden rounded-[16px] bg-ink-3 hairline">
            {sold.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 border-b border-white/[0.06] p-3 last:border-0">
                <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-ok/15 text-ok">
                  <Check size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold">{EVENTS[tx.eventId].artist}</span>
                  <span className="block truncate text-[12px] text-fg-3">
                    Sold for {usd(tx.priceCents!)} · {tx.note}
                  </span>
                </span>
                <span className="text-[15px] font-semibold text-ok tabular">+{usd(tx.breakdown!.seller)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <HowSelling />
    </section>
  )
}

function HowSelling() {
  const steps = [
    ['Set your price', 'Anything up to 105% of what you paid. The ticket blocks higher prices.'],
    ['A verified fan buys it', 'Only real, verified fans. They pay the price you set, with no fees on top.'],
    ['Everyone is paid at once', 'The artist gets 2% of face value, Proof of Seat 1%, you keep the rest. Ticket and money move together.'],
  ]
  return (
    <div className="rounded-[16px] bg-ink-3 p-4 hairline">
      <div className="text-[17px] font-semibold tracking-[-0.015em]">How selling works</div>
      <ol className="mt-3 flex flex-col gap-3">
        {steps.map(([k, s], i) => (
          <li key={k} className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-fill text-[12px] font-bold text-white">{i + 1}</span>
            <span>
              <span className="block text-[15px] font-semibold">{k}</span>
              <span className="block text-[13px] leading-snug text-fg-3">{s}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-4 border-t border-white/[0.06] pt-3">
        <div className="mb-2.5 text-[13px] text-fg-2">
          Example: a <b className="text-fg">$100</b> ticket resold at the <b className="text-fg">$105</b> cap. The buyer pays <b className="text-fg">$105</b>, all-in.
        </div>
        <MoneySplit priceCents={10500} faceCents={10000} artist="Artist" />
      </div>
    </div>
  )
}

/* ───────────────────────── One listing: review and buy ───────────────────────── */

export function Offer({ person, id }: { person: PersonId; id: string }) {
  const l = useDemo((s) => s.market.find((x) => x.id === id))
  const held = useDemo((s) => (l ? ticketsOf(s, person).filter((t) => t.eventId === l.eventId).length : 0))
  const moment = useDemo((s) => s.moment)
  const pop = useDemo((s) => s.pop)
  const buy = useDemo((s) => s.buyListing)
  const cancel = useDemo((s) => s.cancelListing)
  const setStack = useDemo((s) => s.setStack)
  const playSwap = useUI((s) => s.playSwap)
  const setFocus = useUI((s) => s.setFocusTicket)
  const toast = useUI((s) => s.showToast)
  const [pay, setPay] = useState(false)

  if (!l) {
    return (
      <Screen title="Fair resale" large={false} onBack={() => pop(person)}>
        <div className="px-8 pt-14 text-center text-[16px] text-fg-2">This seat was just bought by another verified fan.</div>
      </Screen>
    )
  }
  const ev = EVENTS[l.eventId]
  const br = resaleBreakdown(l.priceCents, l.faceCents)
  const cap = capCents(l.faceCents)
  const elsewhere = l.eventId === 'nova' ? 40000 : Math.round((l.faceCents * 3.5) / 1000) * 1000
  const mine = l.seller === person
  const limitHit = held >= DEFAULT_RULES.maxPerPerson
  const closed = minutesToShow(l.eventId, moment) <= 120

  return (
    <>
      <Screen
        title="Fair resale"
        large={false}
        onBack={() => pop(person)}
        footer={
          mine ? (
            <Button size="lg" full variant="secondary" onClick={() => (cancel(l.ticketId!), pop(person))}>
              Cancel my listing
            </Button>
          ) : (
            <Button
              size="lg"
              full
              disabled={closed}
              onClick={() => {
                if (limitHit) {
                  haptic('wall')
                  toast(`Limit: ${DEFAULT_RULES.maxPerPerson} tickets per fan for this show`)
                  return
                }
                setPay(true)
              }}
            >
              {closed ? 'Resale closed' : `Buy for ${usd(br.buyerTotal)}`}
            </Button>
          )
        }
      >
        <div className="flex flex-col gap-4 px-5 pt-1">
          <TicketCard ticket={{ ...l, tokenId: 0 }} chip={<Pill tone="glass" icon={<BadgeCheck size={13} />}>{mine ? 'Your listing' : l.sellerName === 'Verified fan' ? 'Verified fan' : `Verified fan · ${l.sellerName}`}</Pill>} />

          {/* Price check */}
          <div className="rounded-[16px] bg-ink-3 p-4 hairline">
            <div className="flex items-center justify-between">
              <div className="text-[17px] font-semibold tracking-[-0.015em]">Price check</div>
              <span className="flex items-center gap-1 rounded-full bg-ok/15 px-2.5 py-1 text-[12px] font-semibold text-ok">
                <ShieldCheck size={13} /> Within the cap
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <PriceCell k="Face value" v={usd(l.faceCents)} />
              <PriceCell k="Listed at" v={usd(l.priceCents)} strong sub={markup(l)} />
              <PriceCell k="Max allowed" v={usd(cap)} sub="105%" />
            </div>
          </div>

          {/* Two worlds */}
          <div className="rounded-[16px] bg-ink-3 p-4 hairline">
            <div className="text-[13px] font-semibold tracking-[0.04em] text-fg-3 uppercase">Same seat, two worlds</div>
            <div className="mt-3 flex flex-col gap-3.5">
              <Bar label="On Proof of Seat" sub="Capped at 105% of face value" value={l.priceCents} max={elsewhere} tone="accent" delay={0.1} />
              <Bar label="Elsewhere" sub="Typical open resale site · illustrative" value={elsewhere} max={elsewhere} tone="err" delay={0.25} />
            </div>
          </div>

          {/* Breakdown */}
          <div className="rounded-[16px] bg-ink-3 p-4 hairline">
            <div className="flex items-baseline justify-between">
              <div className="text-[17px] font-semibold tracking-[-0.015em]">Where your money goes</div>
              <div className="text-[20px] font-bold tabular">{usd(br.buyerTotal)}</div>
            </div>
            <div className="mb-3 text-[12px] text-fg-3">
              All-in: no fees on top. The artist’s 2% and Proof of Seat’s 1% come out of the price.
            </div>
            <MoneySplit priceCents={l.priceCents} faceCents={l.faceCents} artist={shortArtist(ev.artist)} seller={l.sellerName === 'Verified fan' ? 'Seller' : l.sellerName} />
          </div>

          <div className="flex flex-col gap-2 px-1 text-[13px] text-fg-3">
            <span className="flex items-center gap-2">
              <BadgeCheck size={15} className="text-ok" /> You’re a verified fan
            </span>
            <span className="flex items-center gap-2">
              <Users size={15} className={limitHit ? 'text-err' : 'text-ok'} /> You hold {held} of {DEFAULT_RULES.maxPerPerson} tickets for this show
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-ok" /> Ticket and money change hands in one step, or not at all
            </span>
          </div>
        </div>
      </Screen>
      <PaySheet
        open={pay}
        onClose={() => setPay(false)}
        item={{
          title: `${ev.artist} · Fair resale`,
          sub: `Sec ${l.section} · Row ${l.row} · Seat ${l.seat}`,
          art: (
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[11px]">
              <EventImage id={l.eventId} size="card" />
            </span>
          ),
        }}
        lines={[
          { k: 'Ticket', v: usd(br.price) },
          { k: 'Fees', v: '$0.00 · included', muted: true },
        ]}
        totalCents={br.buyerTotal}
        onPaid={() => {
          const tid = buy(person, l.id)
          setPay(false)
          if (tid) {
            playSwap(person)
            setFocus(tid)
            setStack(person, 'tickets', [])
          } else toast('This resale didn’t pass the rules. Nothing was charged.', 'err')
        }}
      />
    </>
  )
}

export const shortArtist = (a: string) => (a.length > 16 ? a.split(' vs. ')[0].split(' ').slice(0, 2).join(' ') : a)

function PriceCell({ k, v, sub, strong }: { k: string; v: string; sub?: string; strong?: boolean }) {
  return (
    <div className={`rounded-[12px] px-1.5 py-2.5 ${strong ? 'bg-accent/[0.14]' : 'bg-white/[0.04]'}`}>
      <div className="text-[11px] text-fg-3">{k}</div>
      <div className={`mt-0.5 text-[16px] font-bold tabular ${strong ? 'text-fg' : 'text-fg-2'}`}>{v}</div>
      {sub && <div className={`text-[11px] font-semibold ${strong ? 'text-accent-soft' : 'text-fg-3'}`}>{sub}</div>}
    </div>
  )
}

function Bar({ label, sub, value, max, tone, delay }: { label: string; sub: string; value: number; max: number; tone: 'accent' | 'err'; delay: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold">{label}</div>
          <div className="truncate text-[12px] text-fg-3">{sub}</div>
        </div>
        <div className={`shrink-0 text-[22px] font-bold tracking-[-0.03em] ${tone === 'err' ? 'text-err' : 'text-fg'}`}>
          <NumberTicker value={value} from={0} format={(n) => usd(Math.round(n / 100) * 100, { cents: false })} duration={1} />
        </div>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className={`h-full rounded-full ${tone === 'err' ? 'bg-[repeating-linear-gradient(-45deg,#ff453a_0_6px,#c9352c_6px_12px)]' : 'bg-accent'}`}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ delay, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

