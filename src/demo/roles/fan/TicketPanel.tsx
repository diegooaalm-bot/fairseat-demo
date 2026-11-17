import { motion } from 'motion/react'
import { ArrowLeftRight, FastForward, Gift, Info, Lock, ShieldCheck } from 'lucide-react'
import { DynamicQR } from '@/components/ticket/DynamicQR'
import { Button } from '@/components/ui/Button'
import { EVENTS, ADDR, type PersonId } from '@/data/world'
import { usd } from '@/lib/money'
import { capCents } from '@/lib/rules'
import { haptic } from '@/lib/haptics'
import { listingOf, minutesToShow, useDemo, type Ticket } from '@/store/demo'
import { useUI } from '@/store/ui'

export function fmtCountdown(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`
}

export function TicketPanel({ ticket, person }: { ticket: Ticket; person: PersonId }) {
  const m = useDemo((s) => s.moment)
  const push = useDemo((s) => s.push)
  const listing = useDemo((s) => listingOf(s, ticket.id))
  const cancel = useDemo((s) => s.cancelListing)
  const advanceTo = useDemo((s) => s.advanceTo)
  const simulateBuyer = useSimulateBuyer()
  const playSwap = useUI((s) => s.playSwap)
  const toast = useUI((s) => s.showToast)
  const ev = EVENTS[ticket.eventId]
  const mins = minutesToShow(ticket.eventId, m)
  const locked = mins <= 120
  const isListed = ticket.status === 'listed'
  const used = ticket.status === 'used'
  const owner = person === 'maya' ? ADDR.maya : ADDR.ben

  return (
    <div className="flex flex-col items-center pt-5">
      {used ? (
        <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-[24px] bg-ink-3 text-center hairline">
          <ShieldCheck size={34} className="text-ok" />
          <div className="mt-2 text-[19px] font-semibold">Checked in</div>
          <div className="text-[14px] text-fg-3">Enjoy the show. This ticket can’t be used again.</div>
        </div>
      ) : (
        <>
          <DynamicQR tokenId={ticket.tokenId} owner={owner} size={176} />
          <div className="mt-3 flex items-center gap-1.5 text-[14px] font-semibold">
            <Lock size={14} className="text-accent-soft" /> Signed by owner
          </div>
          <div className="mt-0.5 max-w-[30ch] text-center text-[13px] leading-snug text-fg-3">
            Changes every 5 seconds and only works on your phone. Screenshots won’t get you in.
          </div>
        </>
      )}

      {isListed && listing && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 w-full overflow-hidden rounded-[18px] bg-accent/12 p-4 hairline">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold">Listed for {usd(listing.priceCents)}</div>
              <div className="text-[13px] text-fg-2">Only verified fans can buy it.</div>
            </div>
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => cancel(ticket.id)}>
              Cancel listing
            </Button>
            <DemoButton onClick={() => simulateBuyer(ticket.id, person) && playSwap(person)}>Simulate a buyer</DemoButton>
          </div>
        </motion.div>
      )}

      {!used && !isListed && (
        <div className="mt-5 flex w-full flex-col gap-2.5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              haptic(locked ? 'wall' : 'light')
              if (locked) toast('Resale closes 2 hours before the show')
              push(person, { name: 'resell', params: { id: ticket.id } })
            }}
            className={`flex items-center gap-3 rounded-[16px] p-3.5 text-left ${locked ? 'bg-ink-3 opacity-60 hairline' : 'bg-accent-fill text-white'}`}
          >
            <span className={`grid h-10 w-10 place-items-center rounded-[12px] ${locked ? 'bg-white/[0.06]' : 'bg-white/20'}`}>
              {locked ? <Lock size={20} /> : <ArrowLeftRight size={20} />}
            </span>
            <span className="flex-1">
              <span className="block text-[16px] font-semibold tracking-[-0.01em]">{locked ? 'Resale closed' : 'Can’t go? Sell it'}</span>
              <span className={`block text-[12px] ${locked ? 'text-fg-3' : 'text-white/80'}`}>
                {locked ? 'Closes 2 h before the show' : `To a verified fan · up to ${usd(capCents(ticket.faceCents))}`}
              </span>
            </span>
          </motion.button>
          <ActionTile
            icon={<Gift size={20} />}
            title="Gift to a friend"
            sub={`Free · ${ticket.transfersLeft} of 2 transfers left`}
            onClick={() => push(person, { name: 'gift', params: { id: ticket.id } })}
            disabled={ticket.transfersLeft <= 0}
          />
        </div>
      )}

      {locked && !used && mins > 0 && (
        <div className="mt-3 flex w-full items-center gap-3 rounded-[16px] bg-white/[0.04] px-4 py-3 hairline">
          <Info size={17} className="shrink-0 text-fg-3" />
          <span className="flex-1 text-[13px] leading-snug text-fg-2">
            Resale closed. {ev.artist} starts in {fmtCountdown(mins)}; resale stops 2 h before so seats reach real fans in time.
          </span>
        </div>
      )}

      {ticket.eventId === 'nova' && used && m === 'doors' && (
        <DemoButton className="mt-4" icon={<FastForward size={14} />} onClick={() => advanceTo('after')}>
          Skip to after the show
        </DemoButton>
      )}
      <div className="h-6" />
    </div>
  )
}

/** Demo helper: a verified fan buys this listing (Ben for Maya's Bad Bunny seat). */
export function useSimulateBuyer() {
  return (ticketId: string, seller: PersonId) => {
    const s = useDemo.getState()
    const l = listingOf(s, ticketId)
    if (!l) return null
    if (l.eventId === 'nova' && seller === 'maya') return s.buyResale('ben')
    return s.buyListing('fan', l.id)
  }
}

function ActionTile({ icon, title, sub, onClick, disabled, dim }: { icon: React.ReactNode; title: string; sub: string; onClick: () => void; disabled?: boolean; dim?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        haptic('light')
        onClick()
      }}
      disabled={disabled}
      className={`flex items-center gap-3 rounded-[16px] bg-ink-3 p-3.5 text-left hairline disabled:opacity-40 ${dim ? 'opacity-60' : ''}`}
    >
      <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-accent/15 text-accent-soft">{icon}</span>
      <span>
        <span className="block text-[16px] font-semibold tracking-[-0.01em]">{title}</span>
        <span className="block text-[12px] text-fg-3">{sub}</span>
      </span>
    </motion.button>
  )
}

/** Demo-only controls look different on purpose: dashed, labelled. */
export function DemoButton({ children, onClick, icon, className = '' }: { children: React.ReactNode; onClick: () => void; icon?: React.ReactNode; className?: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        haptic('light')
        onClick()
      }}
      className={`inline-flex h-[34px] items-center gap-1.5 rounded-full border border-dashed border-white/25 px-3.5 text-[13px] font-semibold text-fg-2 ${className}`}
    >
      <span className="rounded-full bg-white/10 px-1.5 py-px text-[10px] tracking-[0.06em] text-fg-3 uppercase">Demo</span>
      {icon}
      {children}
    </motion.button>
  )
}
