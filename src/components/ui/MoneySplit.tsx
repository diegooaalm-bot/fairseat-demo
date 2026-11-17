import { motion } from 'motion/react'
import { usd } from '@/lib/money'
import { spring } from '@/lib/motion'
import { resaleBreakdown } from '@/lib/rules'

export const SPLIT_COLORS = { seller: '#3E86FF', artist: '#3CCFB4', fee: '#8E8E98' }

/**
 * Where the buyer's money goes on a resale: one bar, three parts.
 * Seller 95% of the price, artist 5% of the price, FairSeat 3% paid on top by the buyer.
 */
export function MoneySplit({ priceCents, artist, seller = 'Seller', className = '' }: { priceCents: number; artist: string; seller?: string; className?: string }) {
  const br = resaleBreakdown(priceCents)
  const parts = [
    { id: 'seller', k: seller, sub: '95% of price', v: br.seller, c: SPLIT_COLORS.seller },
    { id: 'artist', k: artist, sub: '5% royalty', v: br.royalty, c: SPLIT_COLORS.artist },
    { id: 'fee', k: 'FairSeat', sub: '3% fee', v: br.fee, c: SPLIT_COLORS.fee },
  ]
  return (
    <div className={className}>
      <div className="flex h-3.5 gap-[3px] overflow-hidden rounded-full" role="img" aria-label={`Buyer pays ${usd(br.buyerTotal)}: ${parts.map((p) => `${p.k} ${usd(p.v)}`).join(', ')}`}>
        {parts.map((p) => (
          <motion.span key={p.id} className="h-full rounded-[3px] first:rounded-l-full last:rounded-r-full" style={{ background: p.c, flexBasis: 0 }} animate={{ flexGrow: p.v }} initial={false} transition={spring.snappy} />
        ))}
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {parts.map((p) => (
          <div key={p.id} className="min-w-0">
            <div className="flex items-center gap-1.5 text-[12px] text-fg-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.c }} />
              <span className="truncate">{p.k}</span>
            </div>
            <div className="mt-0.5 text-[15px] font-semibold tabular">{usd(p.v)}</div>
            <div className="text-[11px] text-fg-3">{p.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
