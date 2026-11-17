import { motion, useScroll, useTransform } from 'motion/react'
import { useRef, useState, type ReactNode } from 'react'
import { BadgeCheck, CalendarDays, Check, ChevronLeft, Clock, Info, MapPin, Share, ShieldCheck, Users } from 'lucide-react'
import { EventImage } from '@/components/art/EventImage'
import { Button } from '@/components/ui/Button'
import { EVENTS, LEVEL_COLORS, fanLevel, type EventId, type PersonId } from '@/data/world'
import { haptic } from '@/lib/haptics'
import { int, usd } from '@/lib/money'
import { useDemo } from '@/store/demo'
import { useUI } from '@/store/ui'
import { VenueMap, sectionById, levelPrice } from './SeatMap'

export function EventDetail({ person, id, footer }: { person: PersonId; id: EventId; footer?: ReactNode }) {
  const ev = EVENTS[id]
  const pop = useDemo((s) => s.pop)
  const push = useDemo((s) => s.push)
  const flags = useDemo((s) => s.flags)
  const setFlag = useDemo((s) => s.setFlag)
  const toast = useUI((s) => s.showToast)
  const badges = useDemo((s) => s[person].badges.length)
  const owns = useDemo((s) => s.tickets.some((t) => t.eventId === id && t.owner === person && t.status !== 'gone'))
  const lvl = fanLevel(badges)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({ container: ref })
  const imgY = useTransform(scrollY, [-200, 0, 300], [-60, 0, 80])
  const imgScale = useTransform(scrollY, [-200, 0], [1.3, 1])
  const navBg = useTransform(scrollY, [160, 220], [0, 1])
  const [sec, setSec] = useState<string | null>(ev.venueId === 'mbs' ? '312' : ev.venueId ? '104' : null)
  const s = ev.venueId && sec ? sectionById(ev.venueId, sec) : null
  const waitlist = ev.status === 'waitlist'
  const joined = !!flags.waitlistTaylor

  const cta =
    footer ??
    (owns && ev.status === 'presale' ? (
      <Button size="lg" full variant="secondary" onClick={() => useDemo.getState().setTab(person, 'tickets')}>
        You’re going · View tickets
      </Button>
    ) : waitlist ? (
      <Button
        size="lg"
        full
        variant={joined ? 'secondary' : 'primary'}
        icon={joined ? <Check size={18} /> : <Users size={18} />}
        onClick={() => {
          if (joined) return
          haptic('success')
          setFlag('waitlistTaylor')
          toast('You’re on the verified waitlist', 'ok')
        }}
      >
        {joined ? 'You’re on the waitlist' : 'Join the verified waitlist'}
      </Button>
    ) : ev.status === 'presale' ? (
      <Button size="lg" full onClick={() => push(person, { name: 'queue', params: { id } })}>
        Join the verified presale
      </Button>
    ) : (
      <Button size="lg" full onClick={() => push(person, { name: 'seats', params: { id } })}>
        Find tickets
      </Button>
    ))

  return (
    <div className="absolute inset-0 bg-ink">
      <div className="absolute inset-x-0 top-0 z-30" style={{ paddingTop: 'var(--sat)' }}>
        <motion.div className="glass absolute inset-0 border-b border-white/[0.07]" style={{ opacity: navBg }} />
        <div className="relative flex h-11 items-center justify-between px-3">
          <button onClick={() => (haptic('light'), pop(person))} aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-black/45 backdrop-blur-md">
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
          <motion.span style={{ opacity: navBg }} className="max-w-[60%] truncate text-[17px] font-semibold tracking-[-0.02em]">
            {ev.artist}
          </motion.span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-black/45 backdrop-blur-md">
            <Share size={17} />
          </span>
        </div>
      </div>

      <div ref={ref} className="scroll-y no-scrollbar absolute inset-0" style={{ paddingBottom: 'calc(var(--sab) + 120px)' }}>
        <motion.div className="relative h-[300px] overflow-hidden" style={{ y: imgY, scale: imgScale, originY: 1 }}>
          <EventImage id={id} eager />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,13,.25)_0%,rgba(10,10,13,0)_35%,#0a0a0d_100%)]" />
        </motion.div>

        <div className="relative -mt-16 flex flex-col gap-4 px-5">
          <div>
            <span className="rounded-full bg-white/[0.1] px-2.5 py-1 text-[12px] font-semibold text-fg-2 backdrop-blur-md">{ev.genre}</span>
            <h1 className="mt-3 text-[32px] leading-[1.02] font-bold tracking-[-0.035em]">{ev.artist}</h1>
            <div className="mt-1 text-[16px] text-fg-2">{ev.tour}</div>
          </div>

          <div className="overflow-hidden rounded-[16px] bg-ink-3 hairline">
            <InfoRow icon={<CalendarDays size={18} />} title={ev.dateLabel} sub={waitlist ? 'Join the waitlist to hear first' : `${ev.timeLabel} · Doors open 90 min before`} />
            <InfoRow icon={<MapPin size={18} />} title={ev.venue} sub={waitlist ? 'Atlanta-area venues likely' : `${ev.city} · Clear bag policy`} />
          </div>

          {waitlist ? (
            <div className="rounded-[16px] bg-ink-3 p-4 hairline">
              <div className="text-[17px] font-semibold tracking-[-0.015em]">Verified waitlist</div>
              <p className="mt-1 text-[14px] leading-snug text-fg-2">
                No tour has been announced. Join now and, if dates come to Atlanta, verified fans on the waitlist get presale access first, ordered by fan history, not by who refreshes fastest.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Stat k="Fans waiting in Atlanta" v={int(42_318 + (joined ? 1 : 0))} />
                <Stat k="Your access" v={`Level ${lvl.level} · ${lvl.priority === 'General' ? 'Fair draw' : lvl.priority}`} />
              </div>
            </div>
          ) : (
            <>
              {ev.status === 'presale' && !owns && person === 'maya' && (
                <div className="flex items-center gap-3 rounded-[16px] bg-accent/[0.12] p-4 hairline">
                  <BadgeCheck size={22} className="shrink-0 text-accent-soft" />
                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold">Verified fan presale is live</div>
                    <div className="text-[13px] text-fg-2">
                      Your access: Level {lvl.level} · {lvl.priority === 'General' ? 'fair draw' : lvl.priority}. Bots can’t join this line.
                    </div>
                  </div>
                </div>
              )}

              {/* Price levels */}
              <section>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="text-[18px] font-semibold tracking-[-0.015em]">Tickets</h2>
                  <span className="text-[12px] text-fg-3">All-in prices · no hidden fees</span>
                </div>
                <div className="overflow-hidden rounded-[16px] bg-ink-3 hairline">
                  {ev.levels.map((l) => (
                    <div key={l.id} className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 last:border-0">
                      <span className="flex items-center gap-2.5 text-[15px]">
                        <span className="h-3 w-3 rounded-[3px]" style={{ background: LEVEL_COLORS[l.id] }} />
                        {l.label}
                      </span>
                      <span className="text-[15px] font-semibold tabular">{usd(l.cents)}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Map */}
              <section>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="text-[18px] font-semibold tracking-[-0.015em]">Seat map</h2>
                  <span className="text-[12px] text-fg-3">{ev.venue}</span>
                </div>
                <div className="rounded-[16px] bg-ink-3 p-3 hairline">
                  <VenueMap event={ev} selected={sec} onSelect={(x) => (haptic('light'), setSec(x))} />
                  <div className="mt-2 flex items-center justify-between rounded-[12px] bg-white/[0.05] px-3.5 py-2.5 text-[14px]">
                    <span className="font-semibold">{s ? `Section ${s.id}` : 'Tap a section'}</span>
                    <span className="text-fg-2 tabular">{s ? `${usd(levelPrice(ev, s.level))} · ${Math.round(s.avail * 600)} left` : ''}</span>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Guarantee */}
          <section className="rounded-[16px] bg-ink-3 p-4 hairline">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-accent-fill text-white">
                <ShieldCheck size={20} />
              </span>
              <div>
                <div className="text-[16px] font-semibold">FairSeat Guarantee</div>
                <div className="text-[12px] text-fg-3">These rules are part of every ticket. Nobody can change them.</div>
              </div>
            </div>
            <ul className="mt-3 flex flex-col gap-2 text-[14px] text-fg-2">
              <Li>Resale never above 110% of face value</Li>
              <Li>5% of every resale goes to the artist</Li>
              <Li>Up to 4 tickets per verified fan</Li>
              <Li>Resale closes 2 hours before showtime</Li>
              <Li>Codes change every few seconds: screenshots and copies don’t work</Li>
            </ul>
          </section>

          <div className="flex items-start gap-2 px-1 text-[12px] leading-snug text-fg-3">
            <Info size={14} className="mt-0.5 shrink-0" />
            Demo listing for an academic project. {ev.illustrative ? 'This date is illustrative and has not been announced. ' : ''}Prices and seats are illustrative; no real tickets are sold.
          </div>
          {!waitlist && (
            <div className="flex items-center gap-2 px-1 text-[12px] text-fg-3">
              <Clock size={13} /> {ev.dateLabel} · {ev.timeLabel}
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 border-t border-white/[0.07] bg-ink/95 px-5 pt-3 backdrop-blur-xl" style={{ paddingBottom: 'calc(var(--sab) + 12px)' }}>
        {!waitlist && !(owns && ev.status === 'presale') && !footer && (
          <div className="mb-2 flex items-baseline justify-between text-[13px]">
            <span className={owns ? 'font-semibold text-ok' : 'text-fg-3'}>{owns ? 'You’re going · up to 4 per fan' : ev.status === 'presale' ? 'Presale · verified fans only' : 'On sale now'}</span>
            <span className="text-fg-2">
              From <b className="text-fg tabular">{usd(ev.faceCents)}</b>
            </span>
          </div>
        )}
        {cta}
      </div>
    </div>
  )
}

function InfoRow({ icon, title, sub }: { icon: ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 last:border-0">
      <span className="text-accent-soft">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold">{title}</span>
        <span className="block truncate text-[13px] text-fg-3">{sub}</span>
      </span>
    </div>
  )
}
function Li({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check size={15} className="mt-0.5 shrink-0 text-ok" />
      {children}
    </li>
  )
}
function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-[12px] bg-white/[0.04] p-3">
      <div className="text-[16px] font-semibold tabular">{v}</div>
      <div className="text-[11px] text-fg-3">{k}</div>
    </div>
  )
}
