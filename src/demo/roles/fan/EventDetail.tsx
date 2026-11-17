import { motion, useScroll, useTransform } from 'motion/react'
import { useRef, useState, type ReactNode } from 'react'
import { CalendarDays, ChevronLeft, Clock, MapPin, ShieldCheck, Ticket, Users } from 'lucide-react'
import { EventArt } from '@/components/art/EventArt'
import { Button } from '@/components/ui/Button'
import { Pill } from '@/components/ui/Pill'
import { EVENTS, fanLevel, type EventId, type PersonId } from '@/data/world'
import { haptic } from '@/lib/haptics'
import { usd } from '@/lib/money'
import { capCents } from '@/lib/rules'
import { useDemo } from '@/store/demo'
import { SeatMap, sectionById } from './SeatMap'

export function EventDetail({ person, id, footer }: { person: PersonId; id: EventId; footer?: ReactNode }) {
  const ev = EVENTS[id]
  const pop = useDemo((s) => s.pop)
  const push = useDemo((s) => s.push)
  const badges = useDemo((s) => s[person].badges.length)
  const owns = useDemo((s) => s.tickets.some((t) => t.eventId === id && t.owner === person && t.status !== 'gone'))
  const lvl = fanLevel(badges)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({ container: ref })
  const artY = useTransform(scrollY, [-200, 0, 300], [-60, 0, 90])
  const artScale = useTransform(scrollY, [-200, 0], [1.35, 1])
  const navBg = useTransform(scrollY, [180, 240], [0, 1])
  const [sec, setSec] = useState<string | null>('112')
  const s = sec ? sectionById(sec) : null

  return (
    <div className="absolute inset-0 bg-ink">
      {/* floating nav */}
      <div className="absolute inset-x-0 top-0 z-30" style={{ paddingTop: 'var(--sat)' }}>
        <motion.div className="glass absolute inset-0 border-b border-white/[0.07]" style={{ opacity: navBg }} />
        <div className="relative flex h-11 items-center justify-between px-3">
          <button
            onClick={() => {
              haptic('light')
              pop(person)
            }}
            aria-label="Back"
            className="glass-light hairline-2 grid h-9 w-9 place-items-center rounded-full"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
          <motion.span style={{ opacity: navBg }} className="text-[17px] font-semibold tracking-[-0.02em]">
            {ev.artist}
          </motion.span>
          <span className="w-9" />
        </div>
      </div>

      <div ref={ref} className="scroll-y no-scrollbar absolute inset-0" style={{ paddingBottom: 'calc(var(--sab) + 120px)' }}>
        <motion.div className="relative h-[360px] overflow-hidden" style={{ y: artY, scale: artScale, originY: 1 }}>
          <EventArt event={ev} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,13,0)_40%,#0a0a0d_100%)]" />
        </motion.div>
        <div className="relative -mt-28 px-5">
          <Pill tone="glass" icon={<ShieldCheck size={13} strokeWidth={2.4} />}>
            Fair Resale Protected
          </Pill>
          <h1 className="mt-3 text-[44px] leading-[0.92] font-extrabold tracking-[-0.045em] uppercase">{ev.artist}</h1>
          <div className="mt-2 text-[17px] text-fg-2">{ev.tour}</div>

          <div className="mt-6 grid grid-cols-[0.9fr_1.25fr_0.9fr] gap-2">
            <Info icon={<CalendarDays size={16} />} k={ev.dateLabel} v={ev.timeLabel} />
            <Info icon={<MapPin size={16} />} k={ev.venue} v="Atlanta" />
            <Info icon={<Ticket size={16} />} k={usd(ev.faceCents)} v="Face value" />
          </div>

          {/* The rules, in plain words */}
          <div className="mt-6 overflow-hidden rounded-[22px] bg-[linear-gradient(150deg,rgba(62,134,255,.16),rgba(62,134,255,.04))] hairline">
            <div className="flex items-center gap-3 px-4 pt-4">
              <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-accent-fill text-white">
                <ShieldCheck size={22} />
              </span>
              <div>
                <div className="text-[17px] font-semibold tracking-[-0.015em]">This ticket knows the rules</div>
                <div className="text-[13px] text-fg-2">Written into every ticket. Nobody can change them.</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-px bg-white/[0.06]">
              <Rule k="Resale cap" v={`${usd(capCents(ev.faceCents))} max`} />
              <Rule k="To the artist" v="5% of every resale" />
              <Rule k="Per fan" v="Up to 4 tickets" />
              <Rule k="Resale closes" v="2 h before the show" />
            </div>
          </div>

          {/* Priority */}
          {person === 'maya' && !owns && (
            <div className="mt-4 rounded-[22px] bg-ink-3 p-4 hairline">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] text-fg-3">Your presale access</div>
                  <div className="text-[19px] font-semibold tracking-[-0.02em]">
                    Level {lvl.level} · {lvl.priority === 'General' ? 'Fair draw' : lvl.priority}
                  </div>
                </div>
                <Users size={22} className="text-accent-soft" />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-1.5">
                {[
                  ['P1', 'Superfans', '6:00'],
                  ['P2', 'Loyal', '6:05'],
                  ['P3', 'Regular', '6:10'],
                  ['Draw', 'Everyone', '6:15'],
                ].map(([t, n, time], i) => {
                  const mine = (lvl.level === 4 && i === 0) || (lvl.level === 3 && i === 1) || (lvl.level === 2 && i === 2) || (lvl.level === 1 && i === 3)
                  return (
                    <div key={t} className={`rounded-[12px] px-2 py-2 text-center ${mine ? 'bg-accent-fill text-white' : 'bg-white/[0.05] text-fg-2'}`}>
                      <div className="text-[13px] font-bold">{t}</div>
                      <div className={`text-[11px] ${mine ? 'text-white/85' : 'text-fg-3'}`}>{n}</div>
                      <div className={`text-[11px] tabular ${mine ? 'text-white/85' : 'text-fg-3'}`}>{time}</div>
                    </div>
                  )
                })}
              </div>
              <p className="mt-3 text-[13px] leading-snug text-fg-3">Every show you attend moves you up. History can’t be bought, so bots can’t skip the line.</p>
            </div>
          )}

          {/* Seat map */}
          <div className="mt-4 rounded-[22px] bg-ink-3 p-4 hairline">
            <div className="flex items-center justify-between">
              <div className="text-[17px] font-semibold tracking-[-0.015em]">Seat map</div>
              <span className="text-[13px] text-fg-3">Tap a section</span>
            </div>
            <SeatMap className="mt-2" selected={sec} onSelect={(x) => (haptic('light'), setSec(x))} />
            <div className="mt-1 flex items-center justify-between rounded-[14px] bg-white/[0.05] px-3.5 py-2.5 text-[14px]">
              <span className="font-semibold">{s ? `Sec ${s.id} · ${s.tier}` : 'Select a section'}</span>
              <span className="text-fg-2 tabular">{s ? `${usd(ev.faceCents)} · ${Math.round(s.avail * 1000)} left` : ''}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 px-1 text-[13px] text-fg-3">
            <Clock size={14} /> Doors 7:00 PM · Show 8:00 PM
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-ink via-ink/95 to-ink/0 px-5 pt-8" style={{ paddingBottom: 'calc(var(--sab) + 12px)' }}>
        {footer ??
          (owns ? (
            <Button size="lg" full variant="secondary" onClick={() => useDemo.getState().setTab(person, 'tickets')}>
              You’re going · View ticket
            </Button>
          ) : (
            <Button size="lg" full onClick={() => push(person, { name: 'queue', params: { id } })}>
              Join the fair queue
            </Button>
          ))}
      </div>
    </div>
  )
}

function Info({ icon, k, v }: { icon: ReactNode; k: string; v: string }) {
  return (
    <div className="rounded-[16px] bg-ink-3 px-3 py-2.5 hairline">
      <div className="text-fg-3">{icon}</div>
      <div className="mt-1.5 truncate text-[14px] font-semibold tracking-[-0.01em]">{k}</div>
      <div className="truncate text-[12px] text-fg-3">{v}</div>
    </div>
  )
}
function Rule({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-ink-2/80 px-4 py-3">
      <div className="text-[12px] text-fg-3">{k}</div>
      <div className="text-[15px] font-semibold tracking-[-0.01em]">{v}</div>
    </div>
  )
}
