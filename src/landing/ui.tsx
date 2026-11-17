import { motion, useInView } from 'motion/react'
import { useRef, type ReactNode } from 'react'

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1180px] px-5 sm:px-8 ${className}`}>{children}</div>
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <div className={`text-[13px] font-semibold tracking-[0.14em] uppercase ${light ? 'text-accent-on-light' : 'text-accent-soft'}`}>{children}</div>
}

export function H2({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-[clamp(40px,6.4vw,84px)] leading-[0.98] font-bold tracking-[-0.045em] ${className}`}>{children}</h2>
}

export function Lead({ children, className = '', light = false }: { children: ReactNode; className?: string; light?: boolean }) {
  return <p className={`max-w-[38ch] text-[clamp(18px,2vw,22px)] leading-[1.45] tracking-[-0.01em] ${light ? 'text-paper-mute' : 'text-fg-2'} ${className}`}>{children}</p>
}

/** Fades content up once it scrolls into view (visible at rest with reduced motion). */
export function Reveal({ children, delay = 0, className = '', y = 28 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  )
}
