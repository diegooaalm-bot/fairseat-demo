export function ProgressRing({
  progress,
  size = 44,
  stroke = 3,
  color = 'var(--color-accent)',
  track = 'rgba(255,255,255,.12)',
  className = '',
}: {
  progress: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  className?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className={`-rotate-90 ${className}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.max(0, Math.min(1, progress)))}
      />
    </svg>
  )
}
