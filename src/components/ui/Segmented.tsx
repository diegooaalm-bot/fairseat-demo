import { motion } from 'motion/react'
import { useId, type ReactNode } from 'react'
import { haptic } from '@/lib/haptics'
import { spring } from '@/lib/motion'

export interface SegOption<T extends string> {
  value: T
  label: ReactNode
  icon?: ReactNode
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
  tone = 'dark',
}: {
  options: SegOption<T>[]
  value: T
  onChange: (v: T) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  tone?: 'dark' | 'light'
}) {
  const id = useId()
  const h = size === 'lg' ? 'h-11' : size === 'sm' ? 'h-8' : 'h-9'
  const text = size === 'lg' ? 'text-[14px]' : 'text-[13px]'
  return (
    <div
      role="tablist"
      className={`relative flex rounded-[12px] p-[3px] ${tone === 'dark' ? 'bg-white/[0.08]' : 'bg-black/[0.06]'} ${className}`}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => {
              if (!active) haptic('light')
              onChange(o.value)
            }}
            className={`relative z-[1] flex flex-1 items-center justify-center gap-1.5 rounded-[9px] px-2.5 font-semibold tracking-[-0.01em] transition-colors duration-200 ${h} ${text} ${
              active ? (tone === 'dark' ? 'text-fg' : 'text-paper-ink') : tone === 'dark' ? 'text-fg-2 hover:text-fg' : 'text-paper-mute'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={spring.snappy}
                className={`absolute inset-0 -z-[1] rounded-[9px] ${
                  tone === 'dark' ? 'bg-ink-5 shadow-[0_2px_8px_rgba(0,0,0,.35),inset_0_0_0_0.5px_rgba(255,255,255,.12)]' : 'bg-white shadow-[0_2px_6px_rgba(0,0,0,.12)]'
                }`}
              />
            )}
            {o.icon}
            <span className="truncate">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
