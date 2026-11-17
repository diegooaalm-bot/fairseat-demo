import { ArrowLeftRight, BadgeCheck, DoorOpen, Gift, Sparkles, Ticket, XOctagon, type LucideIcon } from 'lucide-react'
import { EVENTS } from '@/data/world'
import { usd, int } from '@/lib/money'
import type { Tx } from '@/store/demo'

export interface TxText {
  title: string
  sub: string
  amount?: string
  icon: LucideIcon
  tone: 'accent' | 'ok' | 'err' | 'gold' | 'neutral'
}

export function describeTx(tx: Tx): TxText {
  const ev = EVENTS[tx.eventId]
  const where = tx.eventLabel ?? `${ev.artist} · ${ev.venue}`
  switch (tx.kind) {
    case 'issue':
      return { title: `Issued ${int(tx.qty ?? 0)} tickets`, sub: tx.note ?? where, icon: Sparkles, tone: 'accent' }
    case 'primary':
      return { title: `Primary sale · #${tx.tokenId}`, sub: where, amount: tx.priceCents ? usd(tx.priceCents) : undefined, icon: Ticket, tone: 'neutral' }
    case 'resale':
      return { title: `Resale · #${tx.tokenId}`, sub: `${where} · cap ✓ royalty ✓`, amount: tx.priceCents ? usd(tx.priceCents) : undefined, icon: ArrowLeftRight, tone: 'ok' }
    case 'gift':
      return { title: `Gift · #${tx.tokenId}`, sub: 'To a verified fan · $0', icon: Gift, tone: 'neutral' }
    case 'entry':
      return { title: `Checked in · #${tx.tokenId}`, sub: tx.note ?? where, icon: DoorOpen, tone: 'ok' }
    case 'badge':
      return { title: '“I was there” badge', sub: `${ev.artist} · soulbound`, icon: BadgeCheck, tone: 'gold' }
    case 'reverted':
      return { title: 'Reverted by contract', sub: tx.note ?? 'Rule violated', amount: tx.priceCents ? usd(tx.priceCents) : undefined, icon: XOctagon, tone: 'err' }
  }
}
