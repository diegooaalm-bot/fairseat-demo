import { motion, useScroll, useTransform } from 'motion/react'
import { ChevronLeft } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import { haptic } from '@/lib/haptics'
import { RoleButton } from './RoleButton'

/**
 * iOS screen: large title that collapses into a glass nav bar on scroll.
 */
export function Screen({
  title,
  large = true,
  onBack,
  backLabel = 'Back',
  right,
  roleButton = false,
  children,
  footer,
  tabBar = false,
  className = '',
  bg = 'bg-ink',
  titleAccessory,
}: {
  title?: ReactNode
  large?: boolean
  onBack?: () => void
  backLabel?: string
  right?: ReactNode
  roleButton?: boolean
  children: ReactNode
  footer?: ReactNode
  tabBar?: boolean
  className?: string
  bg?: string
  titleAccessory?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({ container: ref })
  const navOpacity = useTransform(scrollY, [20, 48], [0, 1])
  const largeOpacity = useTransform(scrollY, [0, 36], [1, 0])
  const bottomPad = footer ? (tabBar ? 'calc(var(--sab) + 176px)' : 'calc(var(--sab) + 120px)') : tabBar ? 'calc(var(--sab) + 96px)' : 'calc(var(--sab) + 32px)'
  return (
    <div className={`absolute inset-0 flex flex-col ${bg}`}>
      <div className="absolute inset-x-0 top-0 z-30" style={{ paddingTop: 'var(--sat)' }}>
        <motion.div className="glass absolute inset-0 border-b border-white/[0.07]" style={{ opacity: large ? navOpacity : 1 }} />
        <div className="relative flex h-11 items-center justify-between px-2">
          <div className="flex min-w-[72px] items-center">
            {onBack && (
              <button
                onClick={() => {
                  haptic('light')
                  onBack()
                }}
                className="flex h-11 items-center pr-3 text-[17px] text-accent-soft"
              >
                <ChevronLeft size={28} strokeWidth={2.4} className="-mr-0.5" />
                {backLabel}
              </button>
            )}
          </div>
          <motion.div
            className="pointer-events-none absolute left-1/2 max-w-[56%] -translate-x-1/2 truncate text-[17px] font-semibold tracking-[-0.02em]"
            style={{ opacity: large ? navOpacity : 1 }}
          >
            {title}
          </motion.div>
          <div className="flex min-w-[72px] items-center justify-end gap-1 pr-2">
            {right}
            {roleButton && !large && <RoleButton />}
          </div>
        </div>
      </div>
      <div ref={ref} className={`scroll-y no-scrollbar relative flex-1 ${className}`} style={{ paddingTop: 'calc(var(--sat) + 44px)', paddingBottom: bottomPad }}>
        {large && title && (
          <motion.div className="flex items-end justify-between gap-3 px-5 pt-0.5 pb-3" style={{ opacity: largeOpacity }}>
            <h1 className="text-[34px] leading-[1.05] font-bold tracking-[-0.032em]">{title}</h1>
            <div className="flex shrink-0 items-center gap-2 pb-1">
              {titleAccessory}
              {roleButton && <RoleButton />}
            </div>
          </motion.div>
        )}
        {children}
      </div>
      {footer && (
        <div
          className="absolute inset-x-0 z-30 bg-gradient-to-t from-ink via-ink/95 to-ink/0 px-5 pt-8"
          style={tabBar ? { bottom: 'calc(var(--sab) + 53px)', paddingBottom: 10 } : { bottom: 0, paddingBottom: 'calc(var(--sab) + 12px)' }}
        >
          {footer}
        </div>
      )}
    </div>
  )
}
