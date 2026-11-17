import type { ReactNode } from 'react'

type Tone = 'accent' | 'ok' | 'err' | 'warn' | 'neutral' | 'gold' | 'glass'
const tones: Record<Tone, string> = {
  accent: 'bg-accent/15 text-accent-soft',
  ok: 'bg-ok/15 text-ok',
  err: 'bg-err/15 text-err',
  warn: 'bg-warn/15 text-warn',
  neutral: 'bg-white/[0.08] text-fg-2',
  gold: 'bg-gold/15 text-gold',
  glass: 'glass-light text-white hairline-2',
}

export function Pill({ children, tone = 'neutral', icon, className = '' }: { children: ReactNode; tone?: Tone; icon?: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold tracking-[-0.005em] ${tones[tone]} ${className}`}>
      {icon}
      {children}
    </span>
  )
}
