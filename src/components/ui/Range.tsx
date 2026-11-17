import { useId, type ReactNode } from 'react'
import { haptic } from '@/lib/haptics'

/** Labelled native slider with iOS styling. */
export function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  hint,
  tone = 'dark',
}: {
  label: ReactNode
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format: (v: number) => string
  hint?: ReactNode
  tone?: 'dark' | 'light'
}) {
  const id = useId()
  const p = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={`text-[15px] ${tone === 'light' ? 'text-paper-mute' : 'text-fg-2'}`}>
          {label}
        </label>
        <span className="text-[17px] font-semibold tracking-[-0.01em] tabular">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        className={`range mt-1 ${tone === 'light' ? 'light' : ''}`}
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ ['--p' as string]: `${p}%` }}
        onChange={(e) => {
          const v = Number(e.target.value)
          if (v !== value) haptic('light')
          onChange(v)
        }}
      />
      {hint && <div className={`text-[12px] ${tone === 'light' ? 'text-paper-mute' : 'text-fg-3'}`}>{hint}</div>}
    </div>
  )
}
