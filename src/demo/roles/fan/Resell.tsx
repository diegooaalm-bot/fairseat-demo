import { AnimatePresence, motion, useAnimationControls } from 'motion/react'
import { useState } from 'react'
import { BadgeCheck, CalendarClock, Check, Circle, Lock, ShieldCheck, Users } from 'lucide-react'
import { EventImage } from '@/components/art/EventImage'
import { Button } from '@/components/ui/Button'
import { CapSlider } from '@/components/ui/CapSlider'
import { MoneySplit } from '@/components/ui/MoneySplit'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { EVENTS, type PersonId } from '@/data/world'
import { usd } from '@/lib/money'
import { spring } from '@/lib/motion'
import { capCents, resaleBreakdown } from '@/lib/rules'
import { Screen } from '@/demo/shell/Screen'
import { listingOf, minutesToShow, useDemo } from '@/store/demo'
import { useUI } from '@/store/ui'
import { DemoButton, fmtCountdown, useSimulateBuyer } from './TicketPanel'
import { shortArtist } from './Resale'

const fmt = (n: number) => usd(Math.round(n))
const closeTime = (t: string) => {
  const m = t.match(/(\d+):(\d+) (AM|PM)/)
  if (!m) return 'showtime − 2 h'
  let h = Number(m[1]) - 2
  if (h <= 0) h += 12
  return `${h}:${m[2]} ${m[3]}`
}

export function Resell({ person, id }: { person: PersonId; id: string }) {
  const ticket = useDemo((s) => s.tickets.find((t) => t.id === id))
  const m = useDemo((s) => s.moment)
  const pop = useDemo((s) => s.pop)
  const list = useDemo((s) => s.listForResale)
  const listing = useDemo((s) => listingOf(s, id))
  const simulateBuyer = useSimulateBuyer()
  const playSwap = useUI((s) => s.playSwap)
  const [price, setPrice] = useState(ticket?.faceCents ?? 10000)
  const [hits, setHits] = useState(0)
  const priceCtl = useAnimationControls()

  if (!ticket) {
    return (
      <Screen title="Resell" large={false} onBack={() => pop(person)}>
        <div className="px-6 pt-10 text-center text-fg-2">This ticket is no longer yours.</div>
      </Screen>
    )
  }
  const ev = EVENTS[ticket.eventId]
  const cap = capCents(ticket.faceCents)
  const br = resaleBreakdown(price, ticket.faceCents)
  const mins = minutesToShow(ticket.eventId, m)
  const locked = mins <= 120
  const isListed = !!listing
  // slider range follows the ticket's own face value (85%–125%), so the cap sits mid-track for any price
  const minC = Math.round((ticket.faceCents * 0.85) / 100) * 100
  const maxC = Math.round((ticket.faceCents * 1.25) / 100) * 100
  const artist = shortArtist(ev.artist)
  const setAtCap = () => {
    setPrice(cap)
    onHit()
  }

  const onHit = () => {
    setHits((h) => h + 1)
    priceCtl.start({ x: [0, -10, 8, -5, 3, 0], transition: { duration: 0.45 } })
  }

  if (locked) return <Locked person={person} artist={ev.artist} mins={mins} />

  return (
    <Screen
      title="Resell"
      large={false}
      onBack={() => pop(person)}
      footer={
        isListed ? undefined : (
          <Button size="lg" full onClick={() => list(ticket.id, price)}>
            List for {usd(price)}
          </Button>
        )
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {isListed ? (
          <motion.div key="listed" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={spring.gentle} className="flex flex-col items-center px-6 pt-10 text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring.wall} className="grid h-16 w-16 place-items-center rounded-full bg-accent-fill text-white">
              <Check size={34} strokeWidth={3} />
            </motion.span>
            <h2 className="mt-5 text-[30px] leading-tight font-bold tracking-[-0.03em]">Listed for {usd(listing!.priceCents)}</h2>
            <p className="mt-1 text-[15px] text-fg-2">
              {ev.artist} · Sec {ticket.section} · Row {ticket.row} · Seat {ticket.seat}
            </p>
            <ol className="mt-6 flex w-full flex-col gap-0 rounded-[16px] bg-ink-3 p-4 text-left hairline">
              <Step done title="Listed on Proof of Seat" sub="Visible to verified fans right now" />
              <Step
                title="A verified fan buys it"
                sub={ticket.eventId === 'nova' ? '7,505 verified fans are on the waitlist for this show' : `Fans following ${artist} get a notification`}
              />
              <Step
                last
                title={`You get ${usd(resaleBreakdown(listing!.priceCents, ticket.faceCents).seller)} · ${artist} gets ${usd(resaleBreakdown(listing!.priceCents, ticket.faceCents).royalty)}`}
                sub="Paid at the same moment the ticket moves"
              />
            </ol>
            <div className="mt-6 flex w-full flex-col gap-3">
              <DemoButton
                className="self-center"
                onClick={() => {
                  if (simulateBuyer(ticket.id, person)) {
                    playSwap(person)
                    pop(person)
                  }
                }}
              >
                Simulate a verified buyer
              </DemoButton>
              <Button size="lg" variant="secondary" full onClick={() => pop(person)}>
                Done
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="edit" exit={{ opacity: 0 }} className="flex flex-col gap-4 px-5 pt-1">
            {/* ticket strip */}
            <div className="flex items-center gap-3 rounded-[18px] bg-ink-3 p-3 hairline">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px]">
                <EventImage id={ticket.eventId} size="card" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">{ev.artist}</span>
                <span className="block truncate text-[13px] text-fg-3">
                  Sec {ticket.section} · Row {ticket.row} · Seat {ticket.seat}
                </span>
              </span>
              <span className="text-right">
                <span className="block text-[12px] text-fg-3">You paid</span>
                <span className="block text-[15px] font-semibold tabular">{usd(ticket.faceCents)}</span>
              </span>
            </div>

            {/* price */}
            <div className="rounded-[24px] bg-ink-2 p-5 hairline">
              <div className="flex items-end justify-between gap-3">
                <motion.div animate={priceCtl} className="text-[46px] leading-none font-bold tracking-[-0.045em] tabular">
                  {usd(price)}
                </motion.div>
                <div className="shrink-0 pb-1 text-right text-[12px] leading-tight whitespace-nowrap text-fg-3">
                  Max <span className="font-semibold text-accent-soft">{usd(cap)}</span>
                  <br />
                  105% of face
                </div>
              </div>
              <div className="mt-8">
                <CapSlider faceCents={ticket.faceCents} capCents={cap} minCents={minC} maxCents={maxC} value={price} onChange={setPrice} onHitCap={onHit} />
              </div>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <Preset active={price === ticket.faceCents} onClick={() => setPrice(ticket.faceCents)} k="Face value" v={usd(ticket.faceCents)} />
                <Preset active={price === cap} onClick={setAtCap} k="Max allowed" v={usd(cap)} />
              </div>
              <div className="h-[52px]">
                <AnimatePresence mode="wait">
                  {hits > 0 && price >= cap && (
                    <motion.div
                      key={hits}
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={spring.wall}
                      className="mt-2 flex items-start gap-2"
                    >
                      <ShieldCheck size={20} className="mt-0.5 shrink-0 text-accent" />
                      <div>
                        <div className="text-[16px] font-bold tracking-[-0.015em] text-accent-soft">This ticket knows the rules.</div>
                        <div className="text-[12px] leading-snug text-fg-3">The cap is part of the ticket. No one can sell above it, not even Proof of Seat.</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* live split */}
            <div className="rounded-[20px] bg-ink-3 p-4 hairline">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[17px] font-semibold tracking-[-0.01em]">You receive</div>
                  <div className="text-[12px] text-fg-3">Paid instantly when it sells</div>
                </div>
                <div className="text-[28px] font-bold tracking-[-0.02em] text-accent-soft">
                  <NumberTicker value={br.seller} format={fmt} duration={0.4} />
                </div>
              </div>
              <div className="mt-3 mb-2.5 border-t border-white/[0.06] pt-3 text-[13px] text-fg-2">
                The buyer pays <b className="text-fg tabular">{usd(br.buyerTotal)}</b>, all-in. It splits like this:
              </div>
              <MoneySplit priceCents={price} faceCents={ticket.faceCents} artist={artist} seller="You" />
            </div>

            <div className="flex flex-col gap-2 px-1 text-[13px] text-fg-3">
              <span className="flex items-center gap-2">
                <BadgeCheck size={15} /> Sold only to a verified fan
              </span>
              <span className="flex items-center gap-2">
                <Users size={15} /> The buyer can hold 4 tickets at most
              </span>
              <span className="flex items-center gap-2">
                <CalendarClock size={15} /> Resale closes {ev.dateLabel.replace(/, \d{4}$/, '')} at {closeTime(ev.timeLabel)}, 2 h before the show
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  )
}

function Preset({ k, v, active, onClick }: { k: string; v: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`flex items-center justify-between rounded-[12px] px-3 py-2 text-left text-[13px] transition-colors ${active ? 'bg-accent/20 text-fg ring-1 ring-accent/50' : 'bg-white/[0.05] text-fg-2'}`}
    >
      <span>{k}</span>
      <span className="font-semibold tabular">{v}</span>
    </motion.button>
  )
}

function Step({ title, sub, done, last }: { title: string; sub: string; done?: boolean; last?: boolean }) {
  return (
    <li className="flex gap-3">
      <span className="flex flex-col items-center">
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${done ? 'bg-ok text-white' : 'bg-white/[0.08] text-fg-3'}`}>
          {done ? <Check size={14} strokeWidth={3} /> : <Circle size={8} fill="currentColor" />}
        </span>
        {!last && <span className="my-1 w-px flex-1 bg-white/[0.1]" />}
      </span>
      <span className={last ? '' : 'pb-3'}>
        <span className="block text-[15px] font-semibold">{title}</span>
        <span className="block text-[13px] leading-snug text-fg-3">{sub}</span>
      </span>
    </li>
  )
}

function Locked({ person, artist, mins }: { person: PersonId; artist: string; mins: number }) {
  const pop = useDemo((s) => s.pop)
  return (
    <Screen title="Resell" large={false} onBack={() => pop(person)}>
      <div className="flex flex-col items-center px-8 pt-14 text-center">
        <motion.div
          initial={{ rotate: -12, scale: 0.7 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={spring.wall}
          className="grid h-24 w-24 place-items-center rounded-[30px] bg-ink-3 hairline"
        >
          <Lock size={42} className="text-fg-2" />
        </motion.div>
        <h2 className="mt-6 text-[30px] leading-tight font-bold tracking-[-0.03em]">Resale is closed</h2>
        <p className="mt-2 text-[16px] leading-snug text-fg-2">
          {artist} starts in {fmtCountdown(mins)}. Resale closes 2 hours before every show, so seats reach real fans in time and last-minute flipping isn’t possible.
        </p>
        <div className="mt-6 rounded-full bg-white/[0.06] px-4 py-2 text-[13px] font-semibold text-fg-3">Written into the ticket · same for everyone</div>
      </div>
    </Screen>
  )
}
