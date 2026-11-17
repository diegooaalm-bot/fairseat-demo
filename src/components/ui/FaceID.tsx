import { motion } from 'motion/react'

/** Face ID glyph: scans, then morphs into a check. */
export function FaceID({ state = 'scan', size = 88 }: { state?: 'idle' | 'scan' | 'success'; size?: number }) {
  const ok = state === 'success'
  const color = ok ? 'var(--color-ok)' : 'var(--color-accent)'
  const draw = { pathLength: 1, opacity: 1 }
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      animate={state === 'scan' ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={state === 'scan' ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } : { type: 'spring', stiffness: 400, damping: 18 }}
    >
      {/* corners */}
      {['M6 24V14a8 8 0 0 1 8-8h10', 'M56 6h10a8 8 0 0 1 8 8v10', 'M74 56v10a8 8 0 0 1-8 8H56', 'M24 74H14a8 8 0 0 1-8-8V56'].map((d, i) => (
        <motion.path key={i} d={d} stroke={color} strokeWidth={4} animate={{ stroke: color }} transition={{ duration: 0.3 }} />
      ))}
      {/* face */}
      <motion.g animate={{ opacity: ok ? 0 : 1, scale: ok ? 0.6 : 1 }} transition={{ duration: 0.25 }} style={{ originX: '40px', originY: '40px' }}>
        <motion.path d="M27 30v6" stroke={color} strokeWidth={4} initial={{ pathLength: 0 }} animate={draw} transition={{ duration: 0.4 }} />
        <motion.path d="M53 30v6" stroke={color} strokeWidth={4} initial={{ pathLength: 0 }} animate={draw} transition={{ duration: 0.4, delay: 0.05 }} />
        <motion.path d="M40 30v14h-4" stroke={color} strokeWidth={4} initial={{ pathLength: 0 }} animate={draw} transition={{ duration: 0.4, delay: 0.1 }} />
        <motion.path d="M29 53c6 5 16 5 22 0" stroke={color} strokeWidth={4} initial={{ pathLength: 0 }} animate={draw} transition={{ duration: 0.45, delay: 0.15 }} />
      </motion.g>
      {/* check */}
      <motion.path
        d="M25 41l10 10 20-22"
        stroke={color}
        strokeWidth={5}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={ok ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.35, delay: ok ? 0.12 : 0, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.svg>
  )
}
