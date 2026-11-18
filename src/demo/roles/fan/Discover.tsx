import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeftRight, ChevronRight, MapPin, Search, ShieldCheck, X } from 'lucide-react'
import { EventImage } from '@/components/art/EventImage'
import { CATEGORIES, EVENTS, UPCOMING, type EventId, type PersonId } from '@/data/world'
import { haptic } from '@/lib/haptics'
import { usd } from '@/lib/money'
import { spring } from '@/lib/motion'
import { Screen } from '@/demo/shell/Screen'
import { novaListing, useDemo, type MarketListing } from '@/store/demo'
import { useUI } from '@/store/ui'

const ALL: EventId[] = ['nova', ...UPCOMING]

export function Discover({ person }: { person: PersonId }) {
  const push = useDemo((s) => s.push)
  const setTab = useDemo((s) => s.setTab)
  const tickets = useDemo((s) => s.tickets)
  const market = useDemo((s) => s.market)
  const mayaListing = useDemo(novaListing)
  const cat = useUI((s) => s.category)
  const setCat = useUI((s) => s.setCategory)
  const q = useUI((s) => s.query)
  const setQ = useUI((s) => s.setQuery)
  const setSide = useUI((s) => s.setResaleSide)
  const owns = (id: EventId) => tickets.some((t) => t.eventId === id && t.owner === person && t.status !== 'gone')
  const resaleOf = (id: EventId) => market.filter((l) => l.eventId === id && l.seller !== person)
  const open = (id: EventId) => {
    haptic('light')
    push(person, { name: 'event', params: { id } })
  }
  const nova = EVENTS.nova
  const soldOutEv = EVENTS.manchester
  const soldOutResale = resaleOf('manchester')

  const status = owns('nova') ? 'You’re going' : person === 'ben' ? (mayaListing ? 'Sold out · fair resale available' : 'Sold out') : 'Verified fan presale · live'

  const needle = q.trim().toLowerCase()
  const filtering = cat !== 'all' || needle.length > 0
  const results = ALL.filter((id) => {
    const ev = EVENTS[id]
    if (cat !== 'all' && ev.category !== cat) return false
    if (!needle) return true
    return [ev.artist, ev.tour, ev.venue, ev.genre].some((x) => x.toLowerCase().includes(needle))
  })
  const catLabel = CATEGORIES.find((c) => c.id === cat)?.label ?? 'All events'

  return (
    <Screen title="Discover" tabBar roleButton>
      <div className="flex flex-col gap-6 px-5">
        {/* location + search + categories */}
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-1.5 self-start text-[15px] font-semibold text-fg-2">
            <MapPin size={16} className="text-accent-soft" /> Atlanta, GA · next 12 months
          </span>
          <label className="flex h-11 items-center gap-2 rounded-[12px] bg-ink-3 px-3.5 text-[15px] text-fg-3 hairline focus-within:ring-1 focus-within:ring-accent/60">
            <Search size={17} className="shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Artists, teams, venues"
              aria-label="Search events"
              className="min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-fg-3"
            />
            {q && (
              <button onClick={() => setQ('')} aria-label="Clear search" className="grid h-6 w-6 place-items-center rounded-full bg-white/10">
                <X size={14} />
              </button>
            )}
          </label>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5" role="tablist" aria-label="Categories">
            {CATEGORIES.map((c) => {
              const active = c.id === cat
              return (
                <motion.button
                  key={c.id}
                  role="tab"
                  aria-selected={active}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    haptic('light')
                    setCat(c.id)
                  }}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${active ? 'bg-fg text-ink' : 'bg-white/[0.07] text-fg-2'}`}
                >
                  {c.label}
                </motion.button>
              )
            })}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {filtering ? (
            <motion.section key={`r-${cat}-${needle}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <div className="mb-1 flex items-baseline justify-between">
                <h2 className="text-[20px] font-bold tracking-[-0.02em]">{needle ? `Results for “${q.trim()}”` : catLabel}</h2>
                <span className="text-[13px] text-fg-3">
                  {results.length} event{results.length === 1 ? '' : 's'}
                </span>
              </div>
              {results.length ? (
                <div className="divide-y divide-white/[0.07]">
                  {results.map((id) => (
                    <EventRow key={id} id={id} onClick={() => open(id)} owned={owns(id)} resale={resaleOf(id)} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[16px] bg-ink-3 p-5 text-center text-[14px] text-fg-2 hairline">No events match. Try another artist, team or venue.</div>
              )}
            </motion.section>
          ) : (
            <motion.div key="home" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex flex-col gap-6">
              {/* Featured */}
              <section>
                <div className="mb-2.5 flex items-baseline justify-between">
                  <h2 className="text-[20px] font-bold tracking-[-0.02em]">Featured</h2>
                  <span className="text-[13px] text-fg-3">{person === 'maya' && !owns('nova') ? 'Presale today' : nova.dateLabel.replace(/, \d{4}$/, '')}</span>
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
              </section>

              {/* Resale entry point */}
              <section className="overflow-hidden rounded-[18px] bg-ink-3 hairline">
                <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 pt-3.5 pb-3">
                  <ShieldCheck size={18} className="text-accent-soft" />
                  <div className="text-[16px] font-semibold tracking-[-0.01em]">Fair resale</div>
                  <span className="ml-auto text-[12px] text-fg-3">Never above 105% of face value</span>
                </div>
                <motion.button whileTap={{ backgroundColor: 'rgba(255,255,255,0.04)' }} onClick={() => open('manchester')} className="flex w-full items-center gap-3 p-3 text-left">
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[12px]">
                    <EventImage id="manchester" size="card" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-semibold">{soldOutEv.artist}</span>
                    <span className="block truncate text-[13px] text-fg-3">
                      {soldOutEv.dateLabel.replace(/, \d{4}$/, '')} · Sold out
                    </span>
                    <span className="mt-0.5 block text-[13px] font-semibold text-accent-soft">
                      {soldOutResale.length} resale tickets from {usd(Math.min(...soldOutResale.map((l) => l.priceCents), 99_999_00), { cents: false })}
                    </span>
                  </span>
                  <ChevronRight size={18} className="text-fg-3" />
                </motion.button>
                <div className="grid grid-cols-2 gap-px border-t border-white/[0.06] bg-white/[0.06]">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      haptic('light')
                      setSide('buy')
                      setTab(person, 'resale')
                    }}
                    className="flex items-center justify-center gap-1.5 bg-ink-3 py-3 text-[14px] font-semibold text-accent-soft"
                  >
                    Browse resale
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      haptic('light')
                      setSide('sell')
                      setTab(person, 'resale')
                    }}
                    className="flex items-center justify-center gap-1.5 bg-ink-3 py-3 text-[14px] font-semibold text-accent-soft"
                  >
                    <ArrowLeftRight size={15} /> Sell a ticket
                  </motion.button>
                </div>
              </section>

              {/* Upcoming list */}
              <section>
                <h2 className="mb-1 text-[20px] font-bold tracking-[-0.02em]">Upcoming in Atlanta</h2>
                <div className="divide-y divide-white/[0.07]">
                  {UPCOMING.map((id) => (
                    <EventRow key={id} id={id} onClick={() => open(id)} owned={owns(id)} resale={resaleOf(id)} />
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="pb-2 text-[11px] leading-snug text-fg-3">
          Academic demo. Artists, teams and venues are real; dates, listings, prices and seats are illustrative. Proof of Seat is not affiliated with any of them. Photos: Wikimedia Commons, see credits on the Proof of Seat site.
        </p>
      </div>
    </Screen>
  )
}

export function EventRow({ id, onClick, owned, resale = [] }: { id: EventId; onClick: () => void; owned?: boolean; resale?: MarketListing[] }) {
  const ev = EVENTS[id]
  const soldOut = ev.status === 'soldout'
  const from = resale.length ? Math.min(...resale.map((l) => l.priceCents)) : 0
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
          {resale.length > 0 && !soldOut && <span className="text-accent-soft"> · {resale.length} resale</span>}
        </span>
      </span>
      <span className="shrink-0 text-right">
        {owned ? (
          <span className="text-[12px] font-semibold text-ok">Going</span>
        ) : soldOut ? (
          <>
            <span className="block text-[11px] font-semibold text-fg-3">Sold out</span>
            <span className="block text-[12px] text-accent-soft">Resale</span>
            <span className="block text-[15px] font-semibold tabular">{from ? usd(from, { cents: false }) : '—'}</span>
          </>
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
