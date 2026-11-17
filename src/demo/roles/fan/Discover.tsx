import { motion } from 'motion/react'
import { BadgeCheck, ChevronRight, Gift, ShieldCheck, Users } from 'lucide-react'
import { EventArt } from '@/components/art/EventArt'
import { Pill } from '@/components/ui/Pill'
import { EVENTS, type EventId, type PersonId } from '@/data/world'
import { usd } from '@/lib/money'
import { spring } from '@/lib/motion'
import { Screen } from '@/demo/shell/Screen'
import { useDemo } from '@/store/demo'

export function Discover({ person }: { person: PersonId }) {
  const push = useDemo((s) => s.push)
  const setTab = useDemo((s) => s.setTab)
  const tickets = useDemo((s) => s.tickets)
  const flags = useDemo((s) => s.flags)
  const listing = useDemo((s) => s.listing)
  const hasNova = tickets.some((t) => t.eventId === 'nova' && t.owner === person && t.status !== 'gone')
  const giftWaiting = person === 'maya' && tickets.some((t) => t.id === 't-velvet-maya' && t.owner === 'maya') && !flags.giftSeen
  const open = (id: EventId) => push(person, { name: 'event', params: { id } })

  const status =
    person === 'ben'
      ? hasNova
        ? { text: 'You’re going', tone: 'ok' as const }
        : listing
          ? { text: 'Sold out · 1 fair resale', tone: 'accent' as const }
          : { text: 'Sold out', tone: 'neutral' as const }
      : hasNova
        ? { text: 'You’re going', tone: 'ok' as const }
        : { text: 'Presale live · verified fans', tone: 'accent' as const }

  return (
    <Screen title="Discover" tabBar roleButton>
      <div className="flex flex-col gap-7 px-5">
        {giftWaiting && (
          <motion.button
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={spring.gentle}
            onClick={() => setTab(person, 'tickets')}
            className="flex items-center gap-3 rounded-[18px] bg-[linear-gradient(120deg,rgba(255,93,143,.22),rgba(155,61,240,.18))] p-3.5 text-left hairline"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-white/10">
              <Gift size={22} className="text-[#ff8fb1]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">Lucía sent you a ticket</span>
              <span className="block truncate text-[13px] text-fg-2">The Velvet Hours · Tonight · The Foundry</span>
            </span>
            <ChevronRight size={18} className="text-fg-3" />
          </motion.button>
        )}

        {/* Featured */}
        <motion.button
          whileTap={{ scale: 0.985 }}
          transition={spring.snappy}
          onClick={() => open('nova')}
          className="relative block aspect-[4/4.6] w-full overflow-hidden rounded-[28px] text-left shadow-[0_30px_60px_-30px_rgba(62,134,255,.6)] hairline"
        >
          <EventArt event={EVENTS.nova} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.25)_0%,transparent_30%,transparent_45%,rgba(0,0,0,.8)_100%)]" />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Pill tone="glass" icon={<LiveDot tone={status.tone} />}>
              {status.text}
            </Pill>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <Pill tone="glass" icon={<ShieldCheck size={13} strokeWidth={2.4} />}>
              Fair Resale Protected
            </Pill>
            <div className="mt-3 text-[38px] leading-[0.95] font-extrabold tracking-[-0.04em] uppercase">Nova Bloom</div>
            <div className="mt-1.5 text-[15px] font-medium text-white/80">The Afterglow Tour</div>
            <div className="mt-3 flex items-center justify-between text-[14px] text-white/85">
              <span>
                {EVENTS.nova.dateLabel} · {EVENTS.nova.venue}
              </span>
              <span className="font-semibold tabular">{usd(EVENTS.nova.faceCents, { cents: false })}</span>
            </div>
          </div>
        </motion.button>

        {/* Coming up */}
        <section>
          <h2 className="mb-3 text-[22px] font-bold tracking-[-0.025em]">Coming up in Atlanta</h2>
          <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
            {(['current', 'kairo', 'juniper'] as EventId[]).map((id) => {
              const ev = EVENTS[id]
              return (
                <motion.div key={id} whileTap={{ scale: 0.97 }} className="w-[156px] shrink-0 snap-start">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] hairline">
                    <EventArt event={ev} />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
                      <div className="text-[11px] font-semibold tracking-[0.06em] text-white/75 uppercase">{ev.genre}</div>
                    </div>
                  </div>
                  <div className="mt-2 truncate text-[15px] font-semibold tracking-[-0.01em]">{ev.artist}</div>
                  <div className="truncate text-[13px] text-fg-3">
                    {ev.dateLabel} · {ev.venue}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Fair by design */}
        <section>
          <h2 className="mb-3 text-[22px] font-bold tracking-[-0.025em]">Fair by design</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { icon: ShieldCheck, t: 'Resale capped', s: 'Never above 110%' },
              { icon: Users, t: '4 per fan', s: 'No hoarding' },
              { icon: BadgeCheck, t: 'Real fans', s: 'Verified once' },
            ].map((x) => (
              <div key={x.t} className="rounded-[18px] bg-ink-3 p-3.5 hairline">
                <x.icon size={20} className="text-accent-soft" />
                <div className="mt-3 text-[14px] leading-tight font-semibold">{x.t}</div>
                <div className="mt-0.5 text-[12px] leading-tight text-fg-3">{x.s}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Screen>
  )
}

export function LiveDot({ tone = 'accent' }: { tone?: 'accent' | 'ok' | 'neutral' }) {
  const c = tone === 'ok' ? 'bg-ok' : tone === 'neutral' ? 'bg-fg-3' : 'bg-[#6fb1ff]'
  return (
    <span className="relative inline-flex h-2 w-2">
      {tone !== 'neutral' && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${c}`} />}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${c}`} />
    </span>
  )
}
