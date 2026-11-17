import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

export function ListGroup({ children, header, footer, className = '' }: { children: ReactNode; header?: ReactNode; footer?: ReactNode; className?: string }) {
  return (
    <section className={className}>
      {header && <h3 className="px-4 pb-2 text-[13px] font-semibold tracking-[0.02em] text-fg-3 uppercase">{header}</h3>}
      <div className="overflow-hidden rounded-[18px] bg-ink-3 hairline">{children}</div>
      {footer && <p className="px-4 pt-2 text-[13px] leading-snug text-fg-3">{footer}</p>}
    </section>
  )
}

export function Row({
  icon,
  title,
  subtitle,
  value,
  chevron,
  onClick,
  disabled,
  className = '',
}: {
  icon?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  value?: ReactNode
  chevron?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  const Comp = onClick ? motion.button : motion.div
  return (
    <Comp
      onClick={disabled ? undefined : onClick}
      whileTap={onClick && !disabled ? { backgroundColor: 'rgba(255,255,255,0.06)' } : undefined}
      className={`relative flex min-h-[52px] w-full items-center gap-3 px-4 py-2.5 text-left after:absolute after:right-0 after:bottom-0 after:left-[56px] after:h-px after:bg-white/[0.07] last:after:hidden ${disabled ? 'opacity-45' : ''} ${className}`}
    >
      {icon && <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px]">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] tracking-[-0.01em]">{title}</span>
        {subtitle && <span className="block truncate text-[13px] text-fg-3">{subtitle}</span>}
      </span>
      {value && <span className="shrink-0 text-[15px] text-fg-2 tabular">{value}</span>}
      {chevron && <ChevronRight size={18} className="shrink-0 text-fg-3" />}
    </Comp>
  )
}
