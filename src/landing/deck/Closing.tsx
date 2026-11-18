import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Logo, Mark } from '@/components/brand/Logo'
import { QRMark } from '@/components/ticket/DynamicQR'
import credits from '@/data/photo-credits.json'
import { Container, Reveal } from './ui'

const DEMO_URL = 'https://diegooaalm-bot.github.io/fairseat-demo/#/demo'

/* ───────── Slide 14 · Try Proof of Seat: a QR big enough to scan from the back of the room ───────── */
export function TryDemo() {
  const roles = ['Fan: buy and resell under the 105% cap', 'Artist: 2% on every resale', 'Gate: scan at the door', 'One shared ledger']
  return (
    <section id="demo" className="relative flex min-h-[100svh] scroll-mt-0 flex-col items-center justify-center bg-white px-5 py-20 text-deck-ink">
      <Reveal className="text-center">
        <span className="mx-auto block h-[3px] w-8 rounded-full bg-deck-blue" />
        <div className="mt-4 text-[13px] font-semibold tracking-[0.14em] text-deck-blue-ink uppercase">Demo</div>
        <h2 className="mt-2 text-[clamp(34px,5vw,64px)] leading-[1] font-bold tracking-[-0.045em]">Scan to try the demo</h2>
      </Reveal>
      <motion.a
        href={DEMO_URL}
        aria-label="Open the live demo"
        initial={{ scale: 0.92, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 block rounded-[28px] border border-deck-line bg-white p-[clamp(12px,1.6vw,24px)] shadow-[0_40px_90px_-40px_rgba(13,15,20,.45)]"
        style={{ width: 'min(64svh, 88vw, 720px)' }}
      >
        <QRMark text={DEMO_URL} size={600} fg="#000000" className="block h-auto w-full" />
      </motion.a>
      <Reveal delay={0.1} className="mt-6 text-center">
        <div className="font-mono text-[clamp(16px,1.8vw,22px)] font-semibold text-deck-blue-ink">diegooaalm-bot.github.io/fairseat-demo</div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {roles.map((r) => (
            <span key={r} className="rounded-full bg-deck-bg px-3 py-1.5 text-[13px] font-medium text-deck-slate">
              {r}
            </span>
          ))}
        </div>
        <Link to="/demo" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-deck-blue px-5 text-[15px] font-semibold text-white sm:hidden">
          Open the demo <ArrowUpRight size={16} />
        </Link>
      </Reveal>
    </section>
  )
}

/* ───────── Slide 15 · Thank you ───────── */
export function ThankYou() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1])
  return (
    <section ref={ref} className="relative overflow-hidden bg-deck-ink py-32 text-white sm:py-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_45%,rgba(43,107,240,.28),transparent)]" />
      <motion.div style={{ scale }}>
        <Container className="relative text-center">
          <Reveal>
            <Mark size={64} className="mx-auto text-deck-blue" />
            <div className="mt-6 text-[13px] font-semibold tracking-[0.16em] text-[#8db8ff] uppercase">Thank you</div>
            <h2 className="mt-3 text-[clamp(64px,12vw,160px)] leading-[0.95] font-bold tracking-[-0.055em] text-deck-blue">Questions?</h2>
            <p className="mx-auto mt-6 max-w-[40ch] text-[clamp(18px,2vw,22px)] text-white/75">Proof of Seat: one seat, one token, one owner, with resale capped and artists paid.</p>
          </Reveal>
        </Container>
      </motion.div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-deck-line bg-white py-12 text-deck-mute">
      <Container className="flex flex-col gap-5 text-[13px] leading-relaxed">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo size={18} className="text-deck-ink" markClass="text-deck-blue" />
          <div className="flex flex-wrap gap-5">
            <Link to="/demo" className="hover:text-deck-ink">
              Demo
            </Link>
            <a href="#problem" className="hover:text-deck-ink">
              Problem
            </a>
            <a href="#solution" className="hover:text-deck-ink">
              Solution
            </a>
            <a href="#how" className="hover:text-deck-ink">
              How it works
            </a>
            <a href="#risks" className="hover:text-deck-ink">
              Risks
            </a>
          </div>
        </div>
        <p className="text-[14px] text-deck-slate">Final project · Blockchains &amp; Crypto Assets · Sierra Benjamin, Coralynn Yang, Diego Alcolea Martin · 11/18/2026. Academic concept, not a real product.</p>
        <p>
          Figures are the ones cited in our presentation: CNN and Fortune (Eras Tour presale, Nov 2022); SeatGeek Summer Concert Report 2026, Musicfeeds and Stereoboard (face value vs. resale); Ticketmaster Face Value Exchange help pages, FIFA
          Collect, Live Nation (Olivia Dean, Nov 2025) and a KYD Labs conference talk (Dec 2025); UK DCMS press release (19 Nov 2025); FTC v. Live Nation (18 Sept 2025). Business figures are illustrative. Images on this page come from our
          presentation; the opening video is a compilation of fan posts.
        </p>
        <p>
          The demo uses real mid-size artists, teams and venues with illustrative dates, listings and prices. Proof of Seat is not affiliated with, endorsed by or selling tickets for any artist, team or venue, and no real tickets or payments
          are processed.
        </p>
        <details>
          <summary className="cursor-pointer font-semibold text-deck-slate">Demo photo credits</summary>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {Object.entries(credits as Record<string, { title: string; page: string; license: string; licenseUrl: string; author: string }>).map(([k, c]) => (
              <li key={k} className="min-w-0 truncate">
                <a href={c.page} target="_blank" rel="noreferrer" className="underline decoration-black/20 underline-offset-2 hover:text-deck-ink">
                  {c.title.replace(/^File:/, '').replace(/\.(jpe?g|png|webp)$/i, '')}
                </a>{' '}
                · {c.author} ·{' '}
                {c.licenseUrl ? (
                  <a href={c.licenseUrl} target="_blank" rel="noreferrer" className="underline decoration-black/20 underline-offset-2 hover:text-deck-ink">
                    {c.license}
                  </a>
                ) : (
                  c.license
                )}
                , cropped
              </li>
            ))}
          </ul>
        </details>
      </Container>
    </footer>
  )
}
