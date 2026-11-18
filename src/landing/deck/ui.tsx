import { motion, useInView } from 'motion/react'
import { useRef, type ReactNode } from 'react'

/** Shared building blocks for the product page, styled after the Proof of Seat deck. */

export const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1180px] px-5 sm:px-8 ${className}`}>{children}</div>
}

/** Fades content up once it scrolls into view. */
export function Reveal({ children, delay = 0, className = '', y = 28 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  )
}

/** The deck's slide header: a short blue bar, a small caps kicker, a big title and a subtitle. */
export function SlideHead({ kicker, title, sub, dark = false, center = false, className = '' }: { kicker: string; title: ReactNode; sub?: ReactNode; dark?: boolean; center?: boolean; className?: string }) {
  return (
    <Reveal className={`${center ? 'text-center' : ''} ${className}`}>
      <span className={`block h-[3px] w-8 rounded-full bg-deck-blue ${center ? 'mx-auto' : ''}`} />
      <div className={`mt-4 text-[13px] font-semibold tracking-[0.14em] uppercase ${dark ? 'text-[#8db8ff]' : 'text-deck-blue-ink'}`}>{kicker}</div>
      <h2 className={`mt-3 text-[clamp(38px,5.6vw,72px)] leading-[1] font-bold tracking-[-0.045em] ${center ? 'mx-auto' : ''} max-w-[20ch] ${dark ? 'text-white' : 'text-deck-ink'}`}>{title}</h2>
      {sub && <p className={`mt-4 max-w-[52ch] text-[clamp(17px,1.9vw,21px)] leading-[1.45] ${center ? 'mx-auto' : ''} ${dark ? 'text-white/70' : 'text-deck-mute'}`}>{sub}</p>}
    </Reveal>
  )
}

/** Blue highlight inside a title, like "Fair Resale" on the deck. */
export const Hi = ({ children }: { children: ReactNode }) => <span className="text-deck-blue">{children}</span>

export function Section({ id, children, className = '', tone = 'white' }: { id?: string; children: ReactNode; className?: string; tone?: 'white' | 'gray' | 'dark' }) {
  const bg = tone === 'dark' ? 'bg-deck-ink text-white' : tone === 'gray' ? 'bg-deck-bg text-deck-ink' : 'bg-white text-deck-ink'
  return (
    <section id={id} className={`relative scroll-mt-14 py-24 sm:py-32 ${bg} ${className}`}>
      {children}
    </section>
  )
}

/** The deck's light-gray card. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[24px] border border-deck-line bg-deck-bg p-6 ${className}`}>{children}</div>
}

export function Sources({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`mt-8 text-[12px] leading-relaxed text-deck-mute ${className}`}>{children}</p>
}
