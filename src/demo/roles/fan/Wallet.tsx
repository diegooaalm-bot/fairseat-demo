import { AnimatePresence, LayoutGroup, motion, animate, useMotionValue, type PanInfo } from 'motion/react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeftRight, FastForward, PartyPopper, Ticket as TicketIcon } from 'lucide-react'
import { TicketCard } from '@/components/ticket/TicketCard'
import { Pill } from '@/components/ui/Pill'
import { EVENTS, type PersonId, ADDR } from '@/data/world'
import { haptic } from '@/lib/haptics'
import { usd } from '@/lib/money'
import { spring } from '@/lib/motion'
import { requestMotionPermission } from '@/hooks/useTilt'
import { Screen } from '@/demo/shell/Screen'
import { minutesToShow, useDemo, type Ticket } from '@/store/demo'
import { useUI } from '@/store/ui'
import { DemoButton, TicketPanel } from './TicketPanel'

const PEEK = 66

export function chipFor(t: Ticket, person: PersonId, listingPrice?: number) {
  if (t.status === 'used') return <Pill tone="glass">Checked in</Pill>
  if (t.status === 'listed') return <Pill tone="glass">Listed · {usd(listingPrice ?? 0, { cents: false })}</Pill>
  if (minutesToShow(t.eventId, useDemo.getState().moment) <= 120 && minutesToShow(t.eventId, useDemo.getState().moment) > 0)
    return <Pill tone="glass">Tonight</Pill>
  if (t.prevOwner && t.prevOwner !== person) return <Pill tone="glass">Fair resale</Pill>
  return undefined
}

export function Wallet({ person }: { person: PersonId }) {
  const all = useDemo((s) => s.tickets)
  const market = useDemo((s) => s.market)
  const priceOf = (id: string) => market.find((l) => l.ticketId === id)?.priceCents
  const ledger = useDemo((s) => s.ledger)
  const setFlag = useDemo((s) => s.setFlag)
  const focus = useUI((s) => s.focusTicket)
  const setFocus = useUI((s) => s.setFocusTicket)
  const playSwap = useUI((s) => s.playSwap)
  const moment = useDemo((s) => s.moment)
  const advanceTo = useDemo((s) => s.advanceTo)
  const tickets = useMemo(
    () =>
      all
        .filter((t) => t.owner === person && t.status !== 'gone')
        .sort((a, b) => EVENTS[a.eventId].startMin - EVENTS[b.eventId].startMin)
        .reverse(),
    [all, person],
  )
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    if (person === 'maya') setFlag('giftSeen')
  }, [person, setFlag])
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!focus || !tickets.some((t) => t.id === focus)) return
    const id = focus
    setFocus(null)
    pending.current = setTimeout(() => setOpen(id), 380)
  }, [focus, tickets, setFocus])
  useEffect(() => () => void (pending.current && clearTimeout(pending.current)), [])
  useEffect(() => {
    if (open && !tickets.some((t) => t.id === open)) setOpen(null)
  }, [open, tickets])

  const sold = ledger.filter((tx) => tx.kind === 'resale' && tx.live && tx.from === (person === 'maya' ? ADDR.maya : ADDR.ben))
  const openIndex = tickets.findIndex((t) => t.id === open)

  return (
    <Screen title="My Tickets" tabBar roleButton large={!open}>
      <LayoutGroup>
        {tickets.length === 0 && sold.length === 0 && <Empty />}
        {open === null ? (
          <div className="px-5">
            <div className="relative" style={{ height: tickets.length ? (tickets.length - 1) * PEEK + 222 : 0 }}>
              {tickets.map((t, i) => (
                <motion.button
                  key={t.id}
                  layoutId={`card-${t.id}`}
                  transition={spring.snappy}
                  onClick={() => {
                    haptic('light')
                    requestMotionPermission()
                    setOpen(t.id)
                  }}
                  className="absolute inset-x-0 block text-left"
                  style={{ top: i * PEEK, zIndex: i }}
                >
                  <TicketCard ticket={t} chip={chipFor(t, person, priceOf(t.id))} />
                </motion.button>
              ))}
            </div>
            {moment === 'doors' && tickets.some((t) => t.eventId === 'nova' && t.status === 'used') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex flex-col items-center gap-3 rounded-[22px] bg-ink-3 p-4 text-center hairline">
                <PartyPopper size={26} className="text-gold" />
                <div className="text-[17px] font-semibold">You’re in. Enjoy the show.</div>
                <DemoButton icon={<FastForward size={14} />} onClick={() => advanceTo('after')}>
                  Skip to after the show
                </DemoButton>
              </motion.div>
            )}
            {sold.length > 0 && (
              <div className="mt-6 flex flex-col gap-2">
                <div className="px-1 text-[13px] font-semibold tracking-[0.04em] text-fg-3 uppercase">Activity</div>
                {sold.map((tx) => (
                  <motion.button
                    key={tx.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => playSwap(person)}
                    className="flex items-center gap-3 rounded-[18px] bg-ink-3 p-3.5 text-left hairline"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-ok/15 text-ok">
                      <ArrowLeftRight size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold">Sold to a verified fan</span>
                      <span className="block truncate text-[13px] text-fg-3">
                        {EVENTS[tx.eventId].artist} · {tx.note}
                      </span>
                    </span>
                    <span className="text-[15px] font-semibold text-ok tabular">+{usd(tx.breakdown!.seller)}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Pager tickets={tickets} index={Math.max(0, openIndex)} onIndex={(i) => setOpen(tickets[i].id)} onClose={() => setOpen(null)} person={person} priceOf={priceOf} />
        )}
      </LayoutGroup>
    </Screen>
  )
}

function Empty() {
  return (
    <div className="flex flex-col items-center px-8 pt-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-ink-3 text-fg-3 hairline">
        <TicketIcon size={30} />
      </span>
      <div className="mt-4 text-[20px] font-semibold tracking-[-0.02em]">No tickets yet</div>
      <div className="mt-1 text-[15px] text-fg-3">Tickets you buy or receive appear here.</div>
    </div>
  )
}

/** Expanded tickets: swipe left/right between them. */
function Pager({
  tickets,
  index,
  onIndex,
  onClose,
  person,
  priceOf,
}: {
  tickets: Ticket[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
  person: PersonId
  priceOf: (id: string) => number | undefined
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(350)
  const x = useMotionValue(-index * w)
  useLayoutEffect(() => {
    if (ref.current) setW(ref.current.offsetWidth)
  }, [])
  useEffect(() => {
    animate(x, -index * (w + 16), spring.snappy)
  }, [index, w, x])
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const d = info.offset.x + info.velocity.x * 0.2
    if (d < -60 && index < tickets.length - 1) {
      haptic('light')
      onIndex(index + 1)
    } else if (d > 60 && index > 0) {
      haptic('light')
      onIndex(index - 1)
    } else animate(x, -index * (w + 16), spring.snappy)
  }
  return (
    <div className="px-5 pt-1">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={onClose} className="text-[17px] font-semibold text-accent-soft">
          Done
        </button>
        {tickets.length > 1 && (
          <div className="flex gap-1.5">
            {tickets.map((t, i) => (
              <span key={t.id} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-fg' : 'w-1.5 bg-white/25'}`} />
            ))}
          </div>
        )}
      </div>
      <div ref={ref} className="overflow-visible">
        <motion.div className="flex gap-4" style={{ x }} drag="x" dragElastic={0.12} dragMomentum={false} onDragEnd={onDragEnd} dragConstraints={{ left: -(tickets.length - 1) * (w + 16), right: 0 }}>
          {tickets.map((t, i) => (
            <div key={t.id} className="shrink-0" style={{ width: w }}>
              <motion.div layoutId={`card-${t.id}`} transition={spring.snappy} onClick={() => i === index && onClose()} className="cursor-pointer">
                <TicketCard ticket={t} tilt={i === index} chip={chipFor(t, person, priceOf(t.id))} />
              </motion.div>
              <AnimatePresence>
                {i === index && (
                  <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ ...spring.gentle, delay: 0.08 }}>
                    <TicketPanel ticket={t} person={person} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
