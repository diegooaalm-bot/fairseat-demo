import { AnimatePresence, motion } from 'motion/react'
import { moment } from '@/data/world'
import { spring } from '@/lib/motion'
import { useDemo } from '@/store/demo'
import { describeTx } from './txText'

const toneClass = {
  accent: 'bg-accent/15 text-accent-soft',
  ok: 'bg-ok/15 text-ok',
  err: 'bg-err/15 text-err',
  gold: 'bg-gold/15 text-gold',
  neutral: 'bg-white/[0.08] text-fg-2',
}

/** Desktop side panel: the one shared ledger every view reads from. */
export function LedgerFeed() {
  const ledger = useDemo((s) => s.ledger)
  const m = useDemo((s) => s.moment)
  const items = ledger.slice(0, 6)
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-[13px] font-semibold tracking-[0.08em] text-fg-3 uppercase">Shared ledger</div>
        <div className="mt-1 text-[15px] text-fg-2">Every view reads from this one record.</div>
      </div>
      <div className="flex items-center justify-between rounded-[14px] bg-white/[0.05] px-3.5 py-2.5 hairline">
        <span className="text-[13px] text-fg-3">Demo time</span>
        <span className="text-[13px] font-semibold tabular">{moment(m).label}</span>
      </div>
      <div className="relative flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.map((tx) => {
            const d = describeTx(tx)
            const Icon = d.icon
            return (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={spring.snappy}
                className={`flex items-center gap-3 rounded-[16px] px-3 py-2.5 hairline ${tx.live ? 'bg-ink-3' : 'bg-ink-2'}`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[11px] ${toneClass[d.tone]}`}>
                  <Icon size={18} strokeWidth={2.1} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold tracking-[-0.01em]">{d.title}</span>
                  <span className="block truncate text-[12px] text-fg-3">{d.sub}</span>
                </span>
                {d.amount && <span className="shrink-0 text-[14px] font-semibold tabular">{d.amount}</span>}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
