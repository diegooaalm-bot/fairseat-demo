import type { Transition } from 'motion/react'

/** Three springs, nothing else. */
export const spring = {
  /** taps, sheets, tabs: fast, almost no overshoot */
  snappy: { type: 'spring', stiffness: 520, damping: 42, mass: 1 } as Transition,
  /** reserved for rules: the price cap wall, the 4-ticket limit */
  wall: { type: 'spring', stiffness: 900, damping: 13, mass: 0.8 } as Transition,
  /** story, shared elements, reveals */
  gentle: { type: 'spring', stiffness: 170, damping: 26, mass: 1 } as Transition,
  /** iOS sheet */
  sheet: { type: 'spring', stiffness: 400, damping: 40, mass: 1 } as Transition,
} as const

export const press = { scale: 0.965 }
