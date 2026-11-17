import { motion } from 'motion/react'
import { ChevronDown, ChevronRight, MapPin, Search, ShieldCheck, Users } from 'lucide-react'
import { EventImage } from '@/components/art/EventImage'
import { EVENTS, UPCOMING, type EventId, type PersonId } from '@/data/world'
import { haptic } from '@/lib/haptics'
import { usd } from '@/lib/money'
import { spring } from '@/lib/motion'
import { Screen } from '@/demo/shell/Screen'
import { useDemo } from '@/store/demo'

const CATS = ['Concerts', 'Sports', 'Arts & Theater', 'Family']

export function Discover({ person }: { person: PersonId }) {
  const push = useDemo((s) => s.push)
  const tickets = useDemo((s) => s.tickets)
  const listing = useDemo((s) => s.listing)
  const flags = useDemo((s) => s.flags)
  const owns = (id: EventId) => tickets.some((t) => t.eventId === id && t.owner === person && t.status !== 'gone')
  const open = (id: EventId) => {
    haptic('light')
    push(person, { name: 'event', params: { id } })
  }
  const nova = EVENTS.nova

  const status =
    person === 'ben'
      ? owns('nova')
        ? 'You’re going'
        : listing
          ? 'Sold out · 1 fair resale'
          : 'Sold out'
      : owns('nova')
        ? 'You’re going'
        : 'Verified fan presale · live'

  return (
    <Screen title="Discover" tabBar roleButton>
      <div className="flex flex-col gap-6 px-5">
        {/* location + search */}
        <div className="flex flex-col gap-3">
          <button className="flex items-center gap-1.5 self-start text-[15px] font-semibold text-fg-2">
            <MapPin size={16} className="text-accent-soft" /> Atlanta, GA <ChevronDown size={15} />
          </button>
          <div className="flex h-11 items-center gap-2 rounded-[12px] bg-ink-3 px-3.5 text-[15px] text-fg-3 hairline">
            <Search size={17} /> Artists, venues, events
          </div>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
            {CATS.map((c, i) => (
              <span key={c} className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${i === 0 ? 'bg-fg text-ink' : 'bg-white/[0.07] text-fg-2'}`}>
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Featured */}
        <section>
          <div className="mb-2.5 flex items-baseline justify-between">
            <h2 className="text-[20px] font-bold tracking-[-0.02em]">Featured</h2>
            <span className="text-[13px] text-fg-3">Presale today</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.985 }}
            transition={spring.snappy}
            onClick={() => open('nova')}
            className="relative block aspect-[16/11] w-full overflow-hidden rounded-[18px] text-left hairline"
          >
            <EventImage id="nova" scrim eager />
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-semibold backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" /> {status}
            </span>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="text-[26px] leading-none font-bold tracking-[-0.03em]">{nova.artist}</div>
              <div className="mt-1 truncate text-[14px] text-white/85">{nova.tour}</div>
              <div className="mt-2 flex items-center justify-between text-[13px] text-white/80">
                <span>
                  {nova.dateLabel} · {nova.venue}
                </span>
                <span className="font-semibold text-white">From {usd(nova.faceCents, { cents: false })}</span>
              </div>
            </div>
          </motion.button>
          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-fg-3">
            <ShieldCheck size={13} className="text-accent-soft" /> Fair Resale Protected · resale never above 110% of face value
          </div>
        </section>

        {/* Upcoming list */}
        <section>
          <h2 className="mb-1 text-[20px] font-bold tracking-[-0.02em]">Upcoming in Atlanta</h2>
          <div className="divide-y divide-white/[0.07]">
            {UPCOMING.map((id) => (
              <EventRow key={id} id={id} onClick={() => open(id)} owned={owns(id)} />
            ))}
          </div>
        </section>

        {/* Waitlist */}
        <section>
          <h2 className="mb-2.5 text-[20px] font-bold tracking-[-0.02em]">Not announced yet</h2>
          <motion.button whileTap={{ scale: 0.985 }} onClick={() => open('taylor')} className="flex w-full items-center gap-3 rounded-[16px] bg-ink-3 p-3 text-left hairline">
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[12px]">
              <EventImage id="taylor" size="card" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-semibold">Taylor Swift</span>
              <span className="block truncate text-[13px] text-fg-3">The Life of a Showgirl · no tour dates yet</span>
              <span className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-accent-soft">
                <Users size={12} /> {flags.waitlistTaylor ? 'You’re on the waitlist' : 'Join the verified waitlist'}
              </span>
            </span>
            <ChevronRight size={18} className="text-fg-3" />
          </motion.button>
        </section>

        <p className="pb-2 text-[11px] leading-snug text-fg-3">
          Academic demo. Artists, tours and venues are real; listings, dates, prices and seats are illustrative. FairSeat is not affiliated with any artist, tour or venue. Photos: Wikimedia Commons, see credits on the FairSeat site.
        </p>
      </div>
    </Screen>
  )
}

export function EventRow({ id, onClick, owned }: { id: EventId; onClick: () => void; owned?: boolean }) {
  const ev = EVENTS[id]
  return (
    <motion.button whileTap={{ backgroundColor: 'rgba(255,255,255,0.04)' }} onClick={onClick} className="flex w-full items-center gap-3 py-3 text-left">
      <span className="flex w-11 shrink-0 flex-col items-center leading-none">
        <span className="text-[11px] font-bold tracking-[0.06em] text-accent-soft">{ev.mon}</span>
        <span className="mt-0.5 text-[22px] font-bold tracking-[-0.02em]">{ev.day}</span>
        <span className="mt-0.5 text-[10px] font-semibold text-fg-3">{ev.dow}</span>
      </span>
      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px]">
        <EventImage id={id} size="card" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-semibold tracking-[-0.01em]">{ev.artist}</span>
        <span className="block truncate text-[13px] text-fg-3">{ev.tour}</span>
        <span className="block truncate text-[12px] text-fg-3">
          {ev.venue} · {ev.timeLabel}
        </span>
      </span>
      <span className="shrink-0 text-right">
        {owned ? (
          <span className="text-[12px] font-semibold text-ok">Going</span>
        ) : (
          <>
            <span className="block text-[11px] text-fg-3">From</span>
            <span className="block text-[15px] font-semibold tabular">{usd(ev.faceCents, { cents: false })}</span>
          </>
        )}
      </span>
    </motion.button>
  )
}
