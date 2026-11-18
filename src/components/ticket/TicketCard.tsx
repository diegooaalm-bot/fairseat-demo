import { motion, useTransform } from 'motion/react'
import type { ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'
import { EventImage } from '@/components/art/EventImage'
import { Mark } from '@/components/brand/Logo'
import { EVENTS } from '@/data/world'
import { useTilt } from '@/hooks/useTilt'
import type { Ticket } from '@/store/demo'

export function TicketCard({
  ticket,
  tilt = false,
  holo = true,
  chip,
  className = '',
  compact = false,
}: {
  ticket: Pick<Ticket, 'eventId' | 'section' | 'row' | 'seat' | 'faceCents' | 'tokenId'>
  tilt?: boolean
  holo?: boolean
  chip?: ReactNode
  className?: string
  compact?: boolean
}) {
  const ev = EVENTS[ticket.eventId]
  const t = useTilt(tilt)
  const holoX = useTransform(t.sheen, (s) => `${s * 100}%`)
  const glareX = useTransform(t.sheen, (s) => `${10 + s * 80}%`)
  const holoBg = useTransform(
    holoX,
    (p) => `linear-gradient(115deg, transparent 20%, rgba(255,120,220,.55) ${parseFloat(p) * 0.4 + 20}%, rgba(120,240,255,.55) ${parseFloat(p) * 0.4 + 32}%, rgba(190,255,140,.5) ${parseFloat(p) * 0.4 + 44}%, transparent ${parseFloat(p) * 0.4 + 60}%)`,
  )
  const glare = useTransform(glareX, (g) => `radial-gradient(60% 50% at ${g} 0%, rgba(255,255,255,.28), transparent 60%)`)

  return (
    <div className={`relative [perspective:1000px] ${className}`}>
      <motion.div
        ref={t.ref}
        style={{ rotateX: t.rotateX, rotateY: t.rotateY, transformStyle: 'preserve-3d' }}
        className="relative aspect-[1.586] w-full overflow-hidden rounded-[22px] text-white shadow-[0_24px_50px_-20px_rgba(0,0,0,.85),inset_0_0_0_1px_rgba(255,255,255,.1)] [isolation:isolate]"
      >
        <EventImage id={ticket.eventId} size="wide" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,14,.72)_0%,rgba(6,8,14,.25)_38%,rgba(6,8,14,.35)_60%,rgba(6,8,14,.88)_100%)]" />
        {holo && <motion.div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: holoBg, opacity: 0.35 }} />}
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: glare }} />
        <div className={`absolute inset-0 flex flex-col justify-between ${compact ? 'p-4' : 'p-5'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-white/70 uppercase">
                <Mark size={12} color="#fff" /> Proof of Seat ticket
              </div>
              <div className={`leading-none font-bold tracking-[-0.03em] ${compact ? 'text-[20px]' : 'text-[24px]'}`}>{ev.artist}</div>
              <div className="mt-1.5 truncate text-[12.5px] font-medium text-white/80">{ev.venue}</div>
            </div>
            {chip ?? (
              <span className="glass-light hairline-2 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold">
                <ShieldCheck size={13} strokeWidth={2.2} />
                Fair Resale
              </span>
            )}
          </div>
          <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-2">
            <Field k="Date" v={ev.mon ? `${ev.mon.charAt(0)}${ev.mon.slice(1).toLowerCase()} ${ev.day}` : 'TBA'} />
            <Field k="Sec" v={ticket.section} />
            <Field k="Row" v={ticket.row} />
            <Field k="Seat" v={String(ticket.seat)} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-semibold tracking-[0.08em] text-white/65 uppercase">{k}</div>
      <div className="truncate text-[16px] font-semibold tracking-[-0.01em] tabular">{v}</div>
    </div>
  )
}
