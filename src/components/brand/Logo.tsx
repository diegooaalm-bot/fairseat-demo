/** FairSeat mark: a theater seat with a check cut into the backrest. */
export function Mark({ size = 28, className = '', color = 'currentColor' }: { size?: number; className?: string; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        fill={color}
        fillRule="evenodd"
        d="M24 6h16c6.6 0 12 5.4 12 12v18H12V18C12 11.4 17.4 6 24 6Zm-1.6 19.2 6.5 6.5 13.2-13.2-3.3-3.3-9.9 9.9-3.2-3.2-3.3 3.3Z"
      />
      <rect x="6" y="39" width="52" height="11" rx="5.5" fill={color} />
      <rect x="14" y="50" width="6" height="8" rx="2" fill={color} />
      <rect x="44" y="50" width="6" height="8" rx="2" fill={color} />
    </svg>
  )
}

export function Logo({ size = 22, className = '', markClass = 'text-accent' }: { size?: number; className?: string; markClass?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.38em] font-semibold tracking-[-0.035em] ${className}`} style={{ fontSize: size }}>
      <Mark size={size * 1.18} className={markClass} />
      <span>FairSeat</span>
    </span>
  )
}

/** App icon (squircle) */
export function AppIcon({ size = 60 }: { size?: number }) {
  return (
    <span
      className="relative inline-grid place-items-center overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.225,
        background: 'radial-gradient(90% 80% at 70% 0%, #2a4fa8 0%, #0d1430 55%, #0a0a0d 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.12), 0 10px 30px -10px rgba(62,134,255,.5)',
      }}
    >
      <Mark size={size * 0.58} color="#fff" />
    </span>
  )
}
