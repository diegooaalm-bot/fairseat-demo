import { motion } from 'motion/react'
import { haptic } from '@/lib/haptics'
import { spring } from '@/lib/motion'

export function Toggle({ checked, onChange, label, tone = 'accent' }: { checked: boolean; onChange: (v: boolean) => void; label: string; tone?: 'accent' | 'ok' | 'warn' }) {
  const on = tone === 'ok' ? 'bg-ok' : tone === 'warn' ? 'bg-warn' : 'bg-accent'
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => {
        haptic('light')
        onChange(!checked)
      }}
      className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200 ${checked ? on : 'bg-white/[0.16]'}`}
    >
      <motion.span
        className="absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,.25)]"
        animate={{ x: checked ? 20 : 0 }}
        transition={spring.snappy}
      />
    </button>
  )
}
