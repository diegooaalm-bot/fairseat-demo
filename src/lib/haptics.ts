/**
 * Haptics.
 * - Android/Chrome: navigator.vibrate.
 * - iPhone Safari has no vibrate API. Since iOS 18, toggling an
 *   <input type="checkbox" switch> through its <label> plays the system
 *   haptic. We keep one hidden switch and click its label. Best effort:
 *   Safari may require the call to happen inside a user gesture.
 */
type Kind = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'wall'

let label: HTMLLabelElement | null = null
let last = 0

function iosTick() {
  if (typeof document === 'undefined') return
  if (!label) {
    label = document.createElement('label')
    label.setAttribute('aria-hidden', 'true')
    label.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.setAttribute('switch', '')
    input.tabIndex = -1
    label.appendChild(input)
    document.body.appendChild(label)
  }
  label.click()
}

const patterns: Record<Kind, number | number[]> = {
  light: 8,
  medium: 14,
  heavy: 24,
  wall: [18, 40, 12],
  success: [10, 60, 18],
  error: [30, 50, 30, 50, 30],
}

export function haptic(kind: Kind = 'light') {
  // never buzz before the person has interacted (browsers block it and log a warning)
  const ua = (typeof navigator !== 'undefined' ? (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation : undefined)
  if (ua && !ua.hasBeenActive) return
  const now = performance.now()
  if (now - last < 45) return
  last = now
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(patterns[kind])
      return
    }
    iosTick()
    if (kind === 'success' || kind === 'wall' || kind === 'error') setTimeout(iosTick, 90)
    if (kind === 'error') setTimeout(iosTick, 180)
  } catch {
    /* no haptics available */
  }
}
