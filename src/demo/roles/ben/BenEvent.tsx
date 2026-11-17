import { motion } from 'motion/react'
import { useState } from 'react'
import { BadgeCheck, ShieldCheck, Users } from 'lucide-react'
import { EventImage } from '@/components/art/EventImage'
import { Button } from '@/components/ui/Button'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { Pill } from '@/components/ui/Pill'
import { TicketCard } from '@/components/ticket/TicketCard'
import { EVENTS } from '@/data/world'
import { usd } from '@/lib/money'
import { spring } from '@/lib/motion'
import { resaleBreakdown } from '@/lib/rules'
import { Screen } from '@/demo/shell/Screen'
import { ticketsOf, useDemo } from '@/store/demo'
import { useUI } from '@/store/ui'
import { DemoButton } from '../fan/TicketPanel'
import { PaySheet } from '../fan/PaySheet'

/** Ben's footer on the (sold out) event page. */
export function BenEventFooter() {
  const listing = useDemo((s) => s.listing)
  const push = useDemo((s) => s.push)
  const ensure = useDemo((s) => s.ensure)
  const owns = useDemo((s) => s.tickets.some((t) => t.eventId === 'nova' && t.owner === 'ben' && t.status !== 'gone'))
  if (owns)
    return (
      <Button size="lg" full variant="secondary" onClick={() => useDemo.getState().setTab('ben', 'tickets')}>
        You’re going · View ticket
      </Button>
    )
  if (listing)
    return (
      <Button size="lg" full onClick={() => push('ben', { name: 'offer' })}>
        Sold out · See 1 fair resale
      </Button>
    )
  return (
    <div className="flex flex-col items-center gap-3">
      <Button size="lg" full disabled>
        Sold out · no resale listings yet
      </Button>
      <DemoButton onClick={() => ensure('listed')}>Maya lists her seat</DemoButton>
    </div>
  )
}

/** The fair resale offer: $110 here vs $400 elsewhere. */
export function ResaleOffer() {
  const listing = useDemo((s) => s.listing)
  const ticket = useDemo((s) => s.tickets.find((t) => t.id === s.listing?.ticketId))
  const held = useDemo((s) => ticketsOf(s, 'ben').filter((t) => t.eventId === 'nova').length)
  const pop = useDemo((s) => s.pop)
  const buy = useDemo((s) => s.buyResale)
  const setStack = useDemo((s) => s.setStack)
  const playSwap = useUI((s) => s.playSwap)
  const setFocus = useUI((s) => s.setFocusTicket)
  const [pay, setPay] = useState(false)

  if (!listing || !ticket) {
    return (
      <Screen title="Fair resale" large={false} onBack={() => pop('ben')}>
        <div className="px-8 pt-14 text-center text-[16px] text-fg-2">This seat was just bought by another verified fan.</div>
      </Screen>
    )
  }
  const br = resaleBreakdown(listing.priceCents)
  const elsewhere = 40000
  const ev = EVENTS[ticket.eventId]

  return (
    <>
      <Screen
        title="Fair resale"
        large={false}
        onBack={() => pop('ben')}
        footer={
          <Button size="lg" full onClick={() => setPay(true)}>
            Buy for {usd(br.buyerTotal)}
          </Button>
        }
      >
        <div className="flex flex-col gap-4 px-5 pt-1">
          <TicketCard ticket={ticket} chip={<Pill tone="glass" icon={<BadgeCheck size={13} />}>From a verified fan</Pill>} />

          {/* The comparison */}
          <div className="rounded-[24px] bg-ink-2 p-5 hairline">
            <div className="text-[13px] font-semibold tracking-[0.06em] text-fg-3 uppercase">Same seat, two worlds</div>
            <div className="mt-4 flex flex-col gap-4">
              <Bar label="On FairSeat" sub="Capped at 110% of face value" value={listing.priceCents} max={elsewhere} tone="accent" delay={0.15} />
              <Bar label="Elsewhere" sub="Typical resale site · illustrative" value={elsewhere} max={elsewhere} tone="err" delay={0.3} />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, ...spring.gentle }}
              className="mt-5 flex items-center justify-between rounded-[16px] bg-ok/12 px-4 py-3"
            >
              <span className="text-[15px] font-semibold text-ok">You pay {usd(elsewhere - br.buyerTotal)} less</span>
              <span className="text-[13px] text-fg-2">and the artist gets paid</span>
            </motion.div>
          </div>

          {/* Breakdown */}
          <div className="overflow-hidden rounded-[22px] bg-ink-3 hairline">
            <Line k="Ticket" v={usd(br.price)} />
            <Line k="Service fee · 3%" v={usd(br.fee)} />
            <Line k="You pay" v={usd(br.buyerTotal)} strong />
          </div>
          <div className="flex flex-col gap-2 px-1 text-[13px] text-fg-3">
            <span className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-ok" /> {usd(br.seller)} goes to the seller, {usd(br.royalty)} to {ev.artist}
            </span>
            <span className="flex items-center gap-2">
              <BadgeCheck size={15} className="text-ok" /> You’re a verified fan
            </span>
            <span className="flex items-center gap-2">
              <Users size={15} className="text-ok" /> You hold {held} of 4 tickets for this show
            </span>
          </div>
        </div>
      </Screen>
      <PaySheet
        open={pay}
        onClose={() => setPay(false)}
        item={{
          title: `${ev.artist} · Fair resale`,
          sub: `Sec ${ticket.section} · Row ${ticket.row} · Seat ${ticket.seat}`,
          art: (
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[11px]">
              <EventImage id={ticket.eventId} size="card" />
            </span>
          ),
        }}
        lines={[
          { k: 'Ticket', v: usd(br.price) },
          { k: 'Service fee (3%)', v: usd(br.fee) },
        ]}
        totalCents={br.buyerTotal}
        onPaid={() => {
          const id = buy('ben')
          setPay(false)
          if (id) {
            playSwap('ben')
            setFocus(id)
            setStack('ben', 'tickets', [])
          }
        }}
      />
    </>
  )
}

function Bar({ label, sub, value, max, tone, delay }: { label: string; sub: string; value: number; max: number; tone: 'accent' | 'err'; delay: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[15px] font-semibold">{label}</div>
          <div className="text-[12px] text-fg-3">{sub}</div>
        </div>
        <div className={`text-[26px] font-bold tracking-[-0.03em] ${tone === 'err' ? 'text-err' : 'text-fg'}`}>
          <NumberTicker value={value} from={0} format={(n) => usd(Math.round(n / 100) * 100, { cents: false })} duration={1.1} />
        </div>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className={`h-full rounded-full ${tone === 'err' ? 'bg-[repeating-linear-gradient(-45deg,#ff453a_0_6px,#c9352c_6px_12px)]' : 'bg-accent'}`}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ delay, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

function Line({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 last:border-0">
      <span className={strong ? 'text-[16px] font-semibold' : 'text-[15px] text-fg-2'}>{k}</span>
      <span className={`tabular ${strong ? 'text-[20px] font-bold' : 'text-[15px]'}`}>{v}</span>
    </div>
  )
}
