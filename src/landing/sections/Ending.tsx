import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { QRMark } from '@/components/ticket/DynamicQR'
import { useIsDesktop } from '@/hooks/useMedia'
import credits from '@/data/photo-credits.json'
import { Container, Eyebrow, Reveal } from '../ui'

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
            <Eyebrow>Back to the fan</Eyebrow>
            <h2 className="mx-auto mt-5 max-w-[16ch] text-[clamp(44px,7.4vw,104px)] leading-[0.95] font-bold tracking-[-0.055em]">
              Next time, the resale price is <span className="text-gradient-accent">capped</span> and the artist gets paid.
            </h2>
            <p className="mx-auto mt-6 max-w-[38ch] text-[clamp(18px,2vw,22px)] text-fg-2">Proof of Seat: one seat, one token, one owner, with resale capped and artists paid.</p>
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
            <a href="#risks" className="hover:text-fg">
              Risks
            </a>
          </div>
        </div>
        <p className="text-[14px] text-fg-2">Academic concept · Blockchains &amp; Crypto Assets · Goizueta Business School · Fall 2026. Not a real product.</p>
        <p>
          Business figures are illustrative hypotheses, not forecasts. Market figures are the ones cited in our presentation: CNN and Fortune (Eras Tour presale, Nov 2022); Pitchfork via Benzinga (Eras resale prices, 2023); AP and Arab News
          (2026 World Cup Final resale, Apr 2026); TicketData via Field Level Media and Bleacher Report (Super Bowl LX prices).
        </p>
        <p>
          Artists, teams and venues in the demo are real, mid-size and independent; dates, listings, prices, seats and figures are illustrative. Proof of Seat is not affiliated with, endorsed by or selling tickets for any artist, team
          or venue, and no real tickets or payments are processed.
        </p>
        <div>
          <div className="mb-1.5 font-semibold text-fg-2">Photo credits</div>
          <ul className="grid gap-1 sm:grid-cols-2">
            {Object.entries(credits as Record<string, { title: string; page: string; license: string; licenseUrl: string; author: string }>)
              .map(([k, c]) => (
                <li key={k} className="min-w-0 truncate">
                  <a href={c.page} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-fg">
                    {c.title.replace(/^File:/, '').replace(/\.(jpe?g|png|webp)$/i, '')}
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
