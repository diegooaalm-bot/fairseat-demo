import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Logo, Mark } from '@/components/brand/Logo'
import { QRMark } from '@/components/ticket/DynamicQR'
import credits from '@/data/photo-credits.json'
import { Container, Reveal, Section, SlideHead } from './ui'

const DEMO_URL = 'https://diegooaalm-bot.github.io/fairseat-demo/#/demo'

/* ───────── Slide 14 · Try Proof of Seat ───────── */
export function TryDemo() {
  const roles = [
    ['Fan', 'buy at face value, resell under the 105% cap'],
    ['Artist', 'watch the 2% royalty arrive on every resale'],
    ['Gate', 'scan a ticket at the door'],
    ['Shared ledger', 'every view reads from one record'],
  ]
  return (
    <Section id="demo">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SlideHead kicker="Demo" title="Try Proof of Seat" sub="Scan to open the live demo on your phone." />
            <Reveal delay={0.1}>
              <ul className="mt-8 flex flex-col gap-3">
                {roles.map(([k, d]) => (
                  <li key={k} className="flex items-start gap-3 text-[18px] leading-snug">
                    <span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-deck-blue" />
                    <span>
                      <b className="font-semibold">{k}:</b> <span className="text-deck-slate">{d}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/demo" className="inline-flex h-[52px] items-center gap-2 rounded-full bg-deck-blue px-6 text-[16px] font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.97]">
                  Open the demo <ArrowUpRight size={17} />
                </Link>
                <span className="font-mono text-[14px] text-deck-blue-ink underline underline-offset-4">diegooaalm-bot.github.io/fairseat-demo</span>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="mx-auto w-full max-w-[400px]">
            <motion.div
              initial={{ rotate: -3, scale: 0.94 }}
              whileInView={{ rotate: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[32px] border border-deck-line bg-white p-7 shadow-[0_40px_80px_-40px_rgba(13,15,20,.45)]"
            >
              <QRMark text={DEMO_URL} size={340} fg="#0d0f14" className="h-auto w-full" />
              <div className="mt-4 flex items-center justify-center gap-2 text-[14px] font-semibold text-deck-mute">
                <Mark size={18} className="text-deck-blue" /> Scan with your camera
              </div>
            </motion.div>
          </Reveal>
        </div>
      </Container>
    </Section>
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
