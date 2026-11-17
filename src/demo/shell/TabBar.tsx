import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { haptic } from '@/lib/haptics'

export interface TabItem {
  id: string
  label: string
  icon: LucideIcon
  badge?: number
}

export function TabBar({ items, value, onChange, hidden = false }: { items: TabItem[]; value: string; onChange: (id: string) => void; hidden?: boolean }) {
  return (
    <motion.nav
      className="glass absolute inset-x-0 bottom-0 z-40 border-t border-white/[0.08]"
      style={{ paddingBottom: 'var(--sab)' }}
      animate={{ y: hidden ? '110%' : 0 }}
      transition={{ type: 'spring', stiffness: 520, damping: 42 }}
    >
      <div className="flex h-[52px] items-stretch">
        {items.map((it) => {
          const active = it.id === value
          const Icon = it.icon
          return (
            <motion.button
              key={it.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (!active) haptic('light')
                onChange(it.id)
              }}
              className={`relative flex flex-1 flex-col items-center justify-center gap-[3px] pt-1 transition-colors ${active ? 'text-accent' : 'text-fg-3'}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="relative">
                <Icon size={24} strokeWidth={active ? 2.3 : 1.9} />
                {!!it.badge && (
                  <span className="absolute -top-1 -right-2 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-err px-1 text-[11px] font-bold text-white">
                    {it.badge}
                  </span>
                )}
              </span>
              <span className="text-[10.5px] font-semibold tracking-[0.005em]">{it.label}</span>
            </motion.button>
          )
        })}
      </div>
    </motion.nav>
  )
}
