import { memo } from 'react'
import { EVENTS, photoUrl, type EventId } from '@/data/world'

/** Real event photography (Wikimedia Commons, credited in the footer). */
export const EventImage = memo(function EventImage({
  id,
  size = 'wide',
  className = '',
  scrim = false,
  eager = false,
}: {
  id: EventId
  size?: 'wide' | 'card'
  className?: string
  scrim?: boolean
  eager?: boolean
}) {
  const ev = EVENTS[id]
  return (
    <div className={`absolute inset-0 overflow-hidden bg-ink-3 ${className}`} aria-hidden="true">
      <img
        src={photoUrl(ev.photo, size)}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className="h-full w-full object-cover"
        style={{ objectPosition: ev.photoPos ?? '50% 40%' }}
      />
      {scrim && <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.15)_0%,rgba(0,0,0,0)_35%,rgba(0,0,0,.78)_100%)]" />}
    </div>
  )
})
