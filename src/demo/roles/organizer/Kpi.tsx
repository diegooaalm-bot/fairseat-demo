import type { ReactNode } from 'react'

export function Kpi({ label, value, sub, icon, tone = 'neutral', className = '' }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode; tone?: 'neutral' | 'ok' | 'err' | 'accent' | 'gold'; className?: string }) {
  const t = { neutral: 'text-fg-3', ok: 'text-ok', err: 'text-err', accent: 'text-accent-soft', gold: 'text-gold' }[tone]
  return (
    <div className={`flex min-w-0 flex-col rounded-[20px] bg-ink-3 p-3.5 hairline ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[12px] font-semibold tracking-[0.02em] text-fg-3">{label}</span>
        <span className={t}>{icon}</span>
      </div>
      <div className="mt-2 truncate text-[24px] leading-none font-bold tracking-[-0.03em] tabular">{value}</div>
      {sub && <div className="mt-1.5 truncate text-[12px] text-fg-3">{sub}</div>}
    </div>
  )
}
