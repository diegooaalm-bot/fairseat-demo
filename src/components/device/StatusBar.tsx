export function StatusBar({ clock = '9:41', wifiOff = false, tone = 'light' }: { clock?: string; wifiOff?: boolean; tone?: 'light' | 'dark' }) {
  const c = tone === 'dark' ? '#000' : '#fff'
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[99] flex h-[54px] items-center justify-between px-[34px] pt-[6px]" style={{ color: c }}>
      <span className="w-[86px] text-center text-[17px] font-semibold tracking-[-0.02em] tabular">{clock}</span>
      <span className="flex w-[86px] items-center justify-center gap-[6px]">
        {/* signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 5} y={9 - i * 3} width="3" height={3 + i * 3} rx="1" fill={c} opacity={wifiOff && i > 1 ? 0.3 : 1} />
          ))}
        </svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true" opacity={wifiOff ? 0.25 : 1}>
          <path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0L8 11.5Z" fill={c} />
          <path d="M3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.3 1.3a4.7 4.7 0 0 0-6.6 0L3.4 6.8Z" fill={c} />
          <path d="M1.1 4.5a9.8 9.8 0 0 1 13.8 0l-1.3 1.3a8 8 0 0 0-11.2 0L1.1 4.5Z" fill={c} />
          {wifiOff && <path d="M2 1l12 10.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" />}
        </svg>
        {/* battery */}
        <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke={c} strokeOpacity=".4" />
          <rect x="2" y="2" width="17" height="9" rx="2.4" fill={c} />
          <path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill={c} fillOpacity=".45" />
        </svg>
      </span>
    </div>
  )
}
