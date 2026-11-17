import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { EventArt } from '@/components/art/EventArt'
import { Button } from '@/components/ui/Button'
import { TicketCard } from '@/components/ticket/TicketCard'
import { EVENTS, type PersonId } from '@/data/world'
import { haptic } from '@/lib/haptics'
import { usd } from '@/lib/money'
import { spring } from '@/lib/motion'
import { DEFAULT_RULES } from '@/lib/rules'
import { Screen } from '@/demo/shell/Screen'
import { useDemo, ticketsOf } from '@/store/demo'
import { useUI } from '@/store/ui'
import { PaySheet } from './PaySheet'
import { SeatGrid, SeatMap, sectionById } from './SeatMap'

export function Seats({ person }: { person: PersonId }) {
  const ev = EVENTS.nova
  const pop = useDemo((s) => s.pop)
  const buy = useDemo((s) => s.buyPrimary)
  const setStack = useDemo((s) => s.setStack)
  const owned = useDemo((s) => ticketsOf(s, person).filter((t) => t.eventId === 'nova').length)
  const toast = useUI((s) => s.showToast)
  const setFocus = useUI((s) => s.setFocusTicket)
  const [section, setSection] = useState('112')
  const [sel, setSel] = useState<string[]>([])
  const [shake, setShake] = useState<{ key: string; n: number } | null>(null)
  const [limitBump, setLimitBump] = useState(0)
  const [pay, setPay] = useState(false)
  const [bought, setBought] = useState<string[] | null>(null)
  const max = DEFAULT_RULES.maxPerPerson - owned
  const sec = sectionById(section)!

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
      toast(`${DEFAULT_RULES.maxPerPerson} tickets per fan. The ticket knows the rules.`)
      return
    }
    haptic('light')
    setSel([...sel, key])
  }

  const seats = sel.map((k) => {
    const [row, n] = k.split('-')
    return { section, row, seat: Number(n) }
  })
  const total = seats.length * ev.faceCents

  return (
    <>
      <Screen
        title="Choose seats"
        large={false}
        onBack={() => pop(person)}
        footer={
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold">
                {sel.length ? `Sec ${section} · ${sel.map((k) => k.replace('-', '')).join(', ')}` : 'Pick up to 4 seats'}
              </div>
              <div className="text-[13px] text-fg-3 tabular">
                {sel.length} × {usd(ev.faceCents)} · no fees for you
              </div>
            </div>
            <Button size="lg" disabled={!sel.length} onClick={() => setPay(true)}>
              {usd(total || ev.faceCents)}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 px-4 pt-1">
          <div className="rounded-[22px] bg-ink-3 px-2 pt-1 pb-2 hairline">
            <SeatMap selected={section} onSelect={(id) => (haptic('light'), setSection(id), setSel([]))} />
          </div>
          <div className="rounded-[22px] bg-ink-3 p-4 hairline">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[17px] font-semibold tracking-[-0.015em]">Section {section}</div>
                <div className="text-[13px] text-fg-3">
                  {sec.tier} · {usd(ev.faceCents)} each
                </div>
              </div>
              <motion.span
                key={limitBump}
                animate={limitBump ? { scale: [1, 1.25, 1], x: [0, -4, 4, 0] } : {}}
                transition={spring.wall}
                className={`rounded-full px-3 py-1.5 text-[13px] font-bold tabular ${sel.length >= max ? 'bg-accent-fill text-white' : 'bg-white/[0.08] text-fg-2'}`}
              >
                {sel.length} / {max}
              </motion.span>
            </div>
            <SeatGrid section={section} selected={sel} onToggle={toggle} shakeKey={shake} suggest={section === '112' && !sel.length ? 'F-7' : undefined} />
            <div className="mt-4 flex justify-center gap-5 text-[12px] text-fg-3">
              <Legend c="bg-accent/25" t="Available" />
              <Legend c="bg-accent" t="Selected" />
              <Legend c="bg-white/[0.06]" t="Taken" />
            </div>
          </div>
        </div>
      </Screen>

      <PaySheet
        open={pay}
        onClose={() => setPay(false)}
        item={{
          title: `${ev.artist} · ${ev.tour}`,
          sub: `${ev.dateLabel} · Sec ${section} · ${sel.map((k) => k.replace('-', '')).join(', ')}`,
          art: (
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[11px]">
              <EventArt event={ev} />
            </span>
          ),
        }}
        lines={[
          { k: `${sel.length} ticket${sel.length === 1 ? '' : 's'} × ${usd(ev.faceCents)}`, v: usd(total) },
          { k: 'Service fee', v: '$0.00 · paid by organizer', muted: true },
        ]}
        totalCents={total}
        onPaid={() => {
          const ids = buy(person, seats)
          setPay(false)
          setBought(ids)
        }}
      />

      <AnimatePresence>
        {bought && (
          <Purchased
            seats={seats}
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

function Legend({ c, t }: { c: string; t: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-[4px] ${c}`} /> {t}
    </span>
  )
}

function Purchased({ seats, onView }: { seats: { section: string; row: string; seat: number }[]; onView: () => void }) {
  const first = seats[0]
  return (
    <motion.div className="absolute inset-0 z-[60] flex flex-col bg-ink px-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ paddingTop: 'calc(var(--sat) + 40px)', paddingBottom: 'calc(var(--sab) + 16px)' }}>
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(62,134,255,.35),transparent)]" />
      <div className="relative flex flex-1 flex-col items-center text-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring.wall, delay: 0.1 }} className="grid h-14 w-14 place-items-center rounded-full bg-ok text-white">
          <Check size={30} strokeWidth={3} />
        </motion.span>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-5 text-[36px] leading-tight font-bold tracking-[-0.035em]">
          You’re going.
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-1 text-[16px] text-fg-2">
          {seats.length > 1 ? `${seats.length} tickets` : 'Your ticket'} is in My Tickets. It can’t be copied or faked.
        </motion.p>
        <motion.div
          className="mt-8 w-full"
          initial={{ y: -260, rotate: -8, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 16, delay: 0.35 }}
        >
          <TicketCard ticket={{ eventId: 'nova', section: first.section, row: first.row, seat: first.seat, faceCents: 10000, tokenId: 0 }} />
        </motion.div>
      </div>
      <Button size="lg" full onClick={onView}>
        View in My Tickets
      </Button>
    </motion.div>
  )
}
