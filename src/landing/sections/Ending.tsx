import { motion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { QRMark } from '@/components/ticket/DynamicQR'
import { useIsDesktop } from '@/hooks/useMedia'
import credits from '@/data/photo-credits.json'
import { Container, Eyebrow, H2, Reveal } from '../ui'

/* ───────── 11 · Why now ───────── */
const MILESTONES = [
  { d: '2016', t: 'BOTS Act', s: 'Using bots to get around ticket limits becomes illegal in the US.', hot: false },
  { d: 'Nov 2022', t: 'Eras Tour chaos', s: '3.5 billion requests in one presale. Four times the previous record.', hot: false },
  { d: 'Mar 2025', t: 'Executive Order', s: 'Executive Order 14254 orders strict enforcement of the BOTS Act.', hot: true },
  { d: 'Sep 2025', t: 'FTC lawsuit', s: 'The FTC and seven states sue Live Nation and Ticketmaster.', hot: true },
  { d: 'Nov 2025', t: 'UK law', s: 'The UK announces a ban on resale above face value.', hot: true },
  { d: 'Apr 2026', t: 'Antitrust verdict', s: 'A jury finds Live Nation–Ticketmaster ran an illegal monopoly.', hot: true },
  { d: 'Jun 2026', t: 'FIFA at scale', s: 'FIFA passes 100,000 blockchain ticket tokens for the World Cup.', hot: true },
  { d: 'Oct 2026', t: 'BOTS case goes on', s: 'A judge lets the FTC’s BOTS Act case move forward.', hot: true },
]

export function WhyNow() {
  const desktop = useIsDesktop()
  const ref = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0.08, 0.92], [0, -dist])
  const fill = useTransform(scrollYProgress, [0.08, 0.92], ['0%', '100%'])
  useEffect(() => {
    const f = () => track.current && setDist(Math.max(0, track.current.scrollWidth - window.innerWidth + 80))
    f()
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [desktop])

  const header = (
    <Container>
      <Eyebrow>Why now</Eyebrow>
      <H2 className="mt-4 max-w-[18ch]">Regulators, artists and technology finally agree.</H2>
    </Container>
  )

  if (!desktop) {
    return (
      <section className="py-28">
        <Reveal>{header}</Reveal>
        <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4">
          {MILESTONES.map((m) => (
            <Card key={m.d} m={m} />
          ))}
        </div>
        <Quote />
      </section>
    )
  }
  return (
    <section ref={ref} className="relative" style={{ height: '260vh' }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        {header}
        <div className="relative mt-14">
          <div className="absolute top-[11px] right-0 left-0 h-[2px] bg-white/10">
            <motion.div className="h-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-gold))]" style={{ width: fill }} />
          </div>
          <motion.div ref={track} style={{ x }} className="flex gap-4 pl-[max(32px,calc((100vw-1180px)/2+32px))]">
            {MILESTONES.map((m) => (
              <Card key={m.d} m={m} dot />
            ))}
          </motion.div>
        </div>
        <Quote />
      </div>
    </section>
  )
}

function Card({ m, dot }: { m: (typeof MILESTONES)[number]; dot?: boolean }) {
  return (
    <div className="w-[270px] shrink-0 snap-start">
      {dot && <span className={`mb-5 block h-6 w-6 rounded-full border-4 border-ink ${m.hot ? 'bg-gold' : 'bg-accent'}`} />}
      <div className="h-full rounded-[24px] bg-ink-2 p-5 hairline">
        <div className={`text-[14px] font-semibold ${m.hot ? 'text-gold' : 'text-accent-soft'}`}>{m.d}</div>
        <div className="mt-2 text-[22px] leading-tight font-bold tracking-[-0.025em]">{m.t}</div>
        <div className="mt-2 text-[15px] leading-snug text-fg-2">{m.s}</div>
      </div>
    </div>
  )
}

function Quote() {
  return (
    <Container className="mt-12">
      <p className="max-w-[46ch] text-[18px] leading-snug text-fg-2">
        <span className="font-semibold text-gold">Gold: the last 18 months.</span> The question is no longer whether resale gets capped, but who builds the infrastructure to enforce it. And a transaction now costs about a cent.
      </p>
    </Container>
  )
}

/* ───────── 12 · Close ───────── */
export function Close() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1])
  const desktop = useIsDesktop()
  const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/demo` : ''
  return (
    <section ref={ref} className="relative overflow-hidden py-32 sm:py-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_55%,rgba(62,134,255,.25),transparent)]" />
      <motion.div style={{ scale }}>
        <Container className="relative text-center">
          <Reveal>
            <Eyebrow>Back to Maya</Eyebrow>
            <h2 className="mx-auto mt-5 max-w-[15ch] text-[clamp(48px,8vw,112px)] leading-[0.95] font-bold tracking-[-0.055em]">
              She gets in for <span className="text-gradient-accent">$110</span>, not <span className="text-err line-through decoration-[6px]">$400</span>.
            </h2>
            <p className="mx-auto mt-6 max-w-[34ch] text-[clamp(18px,2vw,22px)] text-fg-2">And the artist gets paid twice. FairSeat: the ticket that knows the rules.</p>
          </Reveal>
          <Reveal delay={0.15} className="mt-10 flex flex-col items-center gap-8">
            <Link
              to="/demo"
              className="inline-flex h-[58px] items-center gap-2 rounded-full bg-accent-fill px-8 text-[18px] font-semibold text-white shadow-[0_14px_40px_-12px_rgba(62,134,255,.9)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              <Play size={17} fill="currentColor" /> Try the live demo
            </Link>
            {desktop && (
              <div className="flex items-center gap-4 rounded-[24px] bg-ink-2 p-3 pr-6 text-left hairline">
                <span className="rounded-[14px] bg-white p-2">
                  <QRMark text={url} size={96} />
                </span>
                <span>
                  <span className="block text-[16px] font-semibold">Open it on your phone</span>
                  <span className="block text-[14px] text-fg-3">Add to Home Screen for the full app feel.</span>
                </span>
              </div>
            )}
          </Reveal>
        </Container>
      </motion.div>
    </section>
  )
}

/* ───────── 13 · Footer ───────── */
export function Footer() {
  return (
    <footer className="border-t border-white/[0.07] py-12">
      <Container className="flex flex-col gap-6 text-[13px] leading-relaxed text-fg-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo size={18} />
          <div className="flex gap-5">
            <Link to="/demo" className="hover:text-fg">
              Demo
            </Link>
            <a href="#how" className="hover:text-fg">
              How it works
            </a>
            <a href="#why" className="hover:text-fg">
              Why blockchain
            </a>
            <a href="#business" className="hover:text-fg">
              Business
            </a>
          </div>
        </div>
        <p className="text-[14px] text-fg-2">Academic concept · Blockchains &amp; Crypto Assets · Goizueta Business School · Fall 2026. Not a real product.</p>
        <p>
          Business figures ($123,000 revenue, $80,000 royalties, ≈ $1,100 blockchain cost) are illustrative hypotheses, not forecasts. Market figures come from public sources: Ticketmaster on the Eras Tour presale (2022), the
          FTC’s 2025 lawsuit, UK government and CMA findings (2025), FIFA Collect coverage (2026).
        </p>
        <p>
          Artists, tours and venues in the demo are real; listings, dates, prices, seats and figures are illustrative. Bad Bunny’s tour has announced no U.S. dates and Taylor Swift has announced no tour; those dates, like the sports,
          theater and family listings, are hypothetical. FairSeat is not affiliated with, endorsed by or selling tickets for any artist, tour or venue, and no real tickets or payments are processed.
        </p>
        <div>
          <div className="mb-1.5 font-semibold text-fg-2">Photo credits</div>
          <ul className="grid gap-1 sm:grid-cols-2">
            {Object.entries(credits as Record<string, { title: string; page: string; license: string; licenseUrl: string; author: string }>)
              .filter(([k]) => k !== 'mbs2')
              .map(([k, c]) => (
                <li key={k} className="min-w-0 truncate">
                  <a href={c.page} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-fg">
                    {c.title.replace(/^File:/, '').replace(/\.(jpg|png)$/i, '')}
                  </a>{' '}
                  · {c.author} ·{' '}
                  {c.licenseUrl ? (
                    <a href={c.licenseUrl} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-fg">
                      {c.license}
                    </a>
                  ) : (
                    c.license
                  )}
                  , cropped
                </li>
              ))}
          </ul>
        </div>
      </Container>
    </footer>
  )
}
