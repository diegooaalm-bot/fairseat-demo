import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import { EventImage } from '@/components/art/EventImage'
import { Button } from '@/components/ui/Button'
import { TicketCard } from '@/components/ticket/TicketCard'
import { EVENTS, LEVEL_COLORS, type EventId, type PersonId } from '@/data/world'
import { haptic } from '@/lib/haptics'
import { usd } from '@/lib/money'
import { spring } from '@/lib/motion'
import { DEFAULT_RULES } from '@/lib/rules'
import { Screen } from '@/demo/shell/Screen'
import { useDemo, ticketsOf } from '@/store/demo'
import { useUI } from '@/store/ui'
import { PaySheet } from './PaySheet'
import { SeatGrid, VenueMap, defaultSection, levelPrice, sectionOf } from './SeatMap'

export function Seats({ person, id }: { person: PersonId; id: EventId }) {
  const ev = EVENTS[id]
  const pop = useDemo((s) => s.pop)
  const buy = useDemo((s) => s.buyPrimary)
  const setStack = useDemo((s) => s.setStack)
  const owned = useDemo((s) => ticketsOf(s, person).filter((t) => t.eventId === id).length)
  const toast = useUI((s) => s.showToast)
  const setFocus = useUI((s) => s.setFocusTicket)
  const [section, setSection] = useState(defaultSection(ev))
  const [sel, setSel] = useState<string[]>([])
  const [shake, setShake] = useState<{ key: string; n: number } | null>(null)
  const [limitBump, setLimitBump] = useState(0)
  const [pay, setPay] = useState(false)
  const [bought, setBought] = useState<string[] | null>(null)
  const max = Math.max(0, DEFAULT_RULES.maxPerPerson - owned)
  const sec = sectionOf(ev, section)!
  const price = levelPrice(ev, sec.level)

  const toggle = (key: string) => {
    if (sel.includes(key)) {
      haptic('light')
      setSel(sel.filter((k) => k !== key))
      return
    }
    if (sel.length >= max) {
      haptic('wall')
      setShake({ key, n: Date.now() })
      setLimitBump((b) => b + 1)
      toast(`Limit: ${DEFAULT_RULES.maxPerPerson} tickets per fan. The ticket knows the rules.`)
      return
    }
    haptic('light')
    setSel([...sel, key])
  }

  const seats = sel.map((k) => {
    const [row, n] = k.split('-')
    return { section, row, seat: Number(n), faceCents: price }
  })
  const total = seats.length * price
  const seatText = sel.map((k) => k.split('-').join(' · Seat ')).join(', ')

  return (
    <>
      <Screen
        title="Select seats"
        large={false}
        onBack={() => pop(person)}
        footer={
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold">{sel.length ? `${sel.length} ticket${sel.length > 1 ? 's' : ''} · Sec ${section}` : 'Select up to 4 seats'}</div>
              <div className="text-[13px] text-fg-3 tabular">All-in price · no fees for you</div>
            </div>
            <Button size="lg" disabled={!sel.length} onClick={() => setPay(true)}>
              {usd(total || price)}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 px-4 pt-1">
          <div className="flex items-center gap-3 px-1">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[10px]">
              <EventImage id={id} size="card" />
            </span>
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold">{ev.artist}</div>
              <div className="truncate text-[12px] text-fg-3">
                {ev.dateLabel} · {ev.venue}
              </div>
            </div>
          </div>

          <div className="rounded-[16px] bg-ink-3 px-2 pt-2 pb-2 hairline">
            <VenueMap event={ev} selected={section} onSelect={(x) => (haptic('light'), setSection(x), setSel([]))} />
            <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 px-2 pb-1 text-[11px] text-fg-2">
              {ev.levels.map((l) => (
                <span key={l.id} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: LEVEL_COLORS[l.id] }} />
                  {l.label} <b className="font-semibold text-fg tabular">{usd(l.cents, { cents: false })}</b>
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[16px] bg-ink-3 p-4 hairline">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[17px] font-semibold tracking-[-0.015em]">Section {section}</div>
                <div className="text-[13px] text-fg-3 tabular">
                  {ev.levels.find((l) => l.id === sec.level)?.label} · {usd(price)} each
                </div>
              </div>
              <motion.span
                key={limitBump}
                animate={limitBump ? { scale: [1, 1.25, 1], x: [0, -4, 4, 0] } : {}}
                transition={spring.wall}
                className={`rounded-full px-3 py-1.5 text-[13px] font-bold tabular ${sel.length >= max ? 'bg-accent-fill text-white' : 'bg-white/[0.08] text-fg-2'}`}
              >
                {sel.length} / {max} max
              </motion.span>
            </div>
            <SeatGrid eventId={id} section={section} venue={ev.venueId ?? undefined} level={sec.level} selected={sel} onToggle={toggle} shakeKey={shake} suggest={section === 'M3' && id === 'nova' && !sel.length ? '14-7' : undefined} />
            <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-fg-3">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[4px] opacity-45" style={{ background: LEVEL_COLORS[sec.level] }} /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[4px]" style={{ background: LEVEL_COLORS[sec.level] }} /> Selected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[4px] bg-white/[0.06]" /> Taken
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-1 pb-2 text-[12px] text-fg-3">
            <ShieldCheck size={14} className="text-accent-soft" /> Fair Resale Protected · resale capped at {usd(Math.round(price * 1.05))} for this seat
          </div>
        </div>
      </Screen>

      <PaySheet
        open={pay}
        onClose={() => setPay(false)}
        item={{
          title: `${ev.artist} · ${ev.venue}`,
          sub: `${ev.dateLabel} · Sec ${section} · Row ${seatText}`,
          art: (
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[10px]">
              <EventImage id={id} size="card" />
            </span>
          ),
        }}
        lines={[
          { k: `${sel.length} × ${usd(price)}`, v: usd(total) },
          { k: 'Service fee', v: '$0.00 · paid by the organizer', muted: true },
        ]}
        totalCents={total}
        onPaid={() => {
          const ids = buy(person, id, seats)
          setPay(false)
          setBought(ids)
        }}
      />

      <AnimatePresence>
        {bought && (
          <Purchased
            id={id}
            seat={seats[0]}
            count={seats.length}
            onView={() => {
              setFocus(bought[0])
              setStack(person, 'tickets', [])
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function Purchased({ id, seat, count, onView }: { id: EventId; seat: { section: string; row: string; seat: number; faceCents: number }; count: number; onView: () => void }) {
  const ev = EVENTS[id]
  return (
    <motion.div className="absolute inset-0 z-[60] flex flex-col bg-ink px-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ paddingTop: 'calc(var(--sat) + 40px)', paddingBottom: 'calc(var(--sab) + 16px)' }}>
      <div className="relative flex flex-1 flex-col items-center text-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring.wall, delay: 0.1 }} className="grid h-14 w-14 place-items-center rounded-full bg-ok text-white">
          <Check size={30} strokeWidth={3} />
        </motion.span>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-5 text-[30px] leading-tight font-bold tracking-[-0.03em]">
          You’re going to {ev.artist}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-1 text-[15px] text-fg-2">
          {count > 1 ? `${count} tickets are` : 'Your ticket is'} in My Tickets. Order confirmed · {ev.dateLabel}
        </motion.p>
        <motion.div className="mt-8 w-full" initial={{ y: -240, rotate: -6, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 16, delay: 0.35 }}>
          <TicketCard ticket={{ eventId: id, section: seat.section, row: seat.row, seat: seat.seat, faceCents: seat.faceCents, tokenId: 0 }} />
        </motion.div>
      </div>
      <Button size="lg" full onClick={onView}>
        View in My Tickets
      </Button>
    </motion.div>
  )
}
