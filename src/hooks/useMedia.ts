import { useSyncExternalStore } from 'react'

export function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Desktop = wide enough to show the phone frame plus side panels. */
export const useIsDesktop = () => useMedia('(min-width: 960px) and (min-height: 560px)')
