import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, Play, Volume2 } from 'lucide-react'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { Container, Hi, Reveal, Section, SlideHead, Sources, asset } from './ui'

/* ───────── Slide 1 · Title ───────── */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const reduced = useReducedMotion()
  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-end overflow-hidden bg-deck-ink pb-16 text-white sm:items-center sm:pb-0">
      <motion.div style={{ y: reduced ? 0 : imgY }} className="absolute inset-0" aria-hidden="true">
        <motion.img
          src={asset('deck/hero-crowd.webp')}
          alt=""
          fetchPriority="high"
          className="h-full w-full object-cover"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,15,20,.85)_0%,rgba(13,15,20,.45)_55%,rgba(13,15,20,.1)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,15,20,.2)_0%,transparent_40%,#0d0f14_100%)]" />
      </motion.div>
      <motion.div style={{ opacity: reduced ? 1 : fade }} className="relative w-full pt-28">
        <Container>
          <motion.span initial={{ width: 0 }} animate={{ width: 32 }} transition={{ duration: 0.8, delay: 0.2 }} className="block h-[3px] rounded-full bg-deck-blue" />
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-4 text-[13px] font-semibold tracking-[0.14em] text-[#8db8ff] uppercase">
            Final project · Blockchains &amp; Crypto Assets
          </motion.div>
          <h1 className="mt-5 text-[clamp(64px,11vw,148px)] leading-[0.92] font-bold tracking-[-0.055em]">
            {[
              ['Tickets', 'text-white'],
              ['on the', 'text-white/45 text-[0.62em] leading-[1.15] tracking-[-0.04em]'],
              ['Blockchain', 'text-deck-blue'],
            ].map(([w, c], i) => (
              <motion.span
                key={w}
                className={`block ${c}`}
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1, delay: 0.35 + i * 0.14, ease: [0.16, 1, 0.3, 1] }}
              >
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.85 }} className="mt-7 max-w-[44ch] text-[clamp(18px,2vw,23px)] leading-[1.4] text-white/80">
            <b className="font-semibold text-white">Proof of Seat:</b> NFT tickets that end scalping, fake tickets and hidden resale markups.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1 }} className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#fans" className="inline-flex h-[52px] items-center gap-2 rounded-full bg-white px-6 text-[16px] font-semibold text-deck-ink transition-transform hover:scale-[1.03] active:scale-[0.97]">
              <Play size={15} fill="currentColor" /> Start with the fans
            </a>
            <Link to="/demo" className="inline-flex h-[52px] items-center gap-2 rounded-full bg-deck-blue px-6 text-[16px] font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.97]">
              Try the live demo
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.2 }} className="mt-12 flex flex-wrap gap-x-6 gap-y-1 text-[14px] text-white/60">
            <span>Sierra Benjamin · Coralynn Yang · Diego Alcolea Martin</span>
            <span className="font-semibold text-white/80">11/18/2026</span>
          </motion.div>
        </Container>
      </motion.div>
      <motion.a
        href="#fans"
        aria-label="Scroll to the fan video"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/50 sm:block"
        animate={reduced ? {} : { y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ArrowDown size={22} />
      </motion.a>
    </section>
  )
}

/* ───────── Slide 2 · Fans are already calling it out (the opening video) ───────── */
export function FanVideo() {
  const wrap = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const inView = useInView(wrap, { margin: '-20% 0px -20% 0px' })
  const [sound, setSound] = useState(false)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start end', 'center center'] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1])
  const radius = useTransform(scrollYProgress, [0, 1], [48, 28])

  // Muted preview loops while on screen; it pauses when you scroll away.
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (inView && !reduced) v.play().catch(() => {})
    else if (!inView) v.pause()
  }, [inView, reduced])

  const playWithSound = () => {
    const v = video.current
    if (!v) return
    v.currentTime = 0
    v.muted = false
    v.loop = false
    setSound(true)
    v.play().catch(() => {})
  }

  return (
    <Section id="fans" className="overflow-hidden">
      <Container>
        <SlideHead kicker="The problem, from fans" title="Fans are already calling it out" />
        <motion.div ref={wrap} style={reduced ? undefined : { scale, borderRadius: radius }} className="relative mt-10 overflow-hidden bg-black shadow-[0_40px_80px_-40px_rgba(13,15,20,.55)] sm:mt-14">
          <video
            ref={video}
            className="block aspect-video w-full object-cover"
            src={asset('video/fans.mp4')}
            poster={asset('video/fans-poster.webp')}
            muted={!sound}
            loop={!sound}
            playsInline
            preload="metadata"
            controls={sound}
            aria-label="Fan videos about ticket resale prices"
          />
          {!sound && (
            <button
              onClick={playWithSound}
              className="group absolute inset-0 flex items-end justify-start bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,.55))] p-5 text-left sm:items-center sm:justify-center sm:p-0"
            >
              <span className="inline-flex items-center gap-3 rounded-full bg-white/90 py-2.5 pr-5 pl-2.5 text-[15px] font-semibold text-deck-ink shadow-[0_20px_40px_-12px_rgba(0,0,0,.5)] backdrop-blur transition-transform group-hover:scale-[1.04] group-active:scale-[0.97] sm:py-3 sm:pr-6 sm:text-[17px]">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-deck-blue text-white sm:h-12 sm:w-12">
                  <Play size={18} fill="currentColor" className="translate-x-[1px]" />
                </span>
                Play with sound
                <Volume2 size={17} className="text-deck-mute" />
              </span>
            </button>
          )}
        </motion.div>
        <Reveal className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[14px] text-deck-mute">
          <span>Fans on TikTok, in their own words: resale prices, scams and “resell at face value”.</span>
          <span className="tabular">0:21</span>
        </Reveal>
      </Container>
    </Section>
  )
}

/* ───────── Slide 3 · The Eras presale ───────── */
export function Eras() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60])
  const y2 = useTransform(scrollYProgress, [0, 1], [-20, 40])
  const reduced = useReducedMotion()
  return (
    <Section className="overflow-hidden">
      <Container>
        <div ref={ref} className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Reveal>
              <span className="block h-[3px] w-8 rounded-full bg-deck-blue" />
              <div className="mt-4 text-[13px] font-semibold tracking-[0.14em] text-deck-blue-ink uppercase">November 2022 · Eras Tour presale</div>
              <p className="mt-5 max-w-[22ch] text-[clamp(26px,3.2vw,38px)] leading-[1.15] font-semibold tracking-[-0.03em]">
                The presale crashed. The next day, one Atlanta floor seat was listed for
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-4 text-[clamp(72px,11vw,148px)] leading-[0.95] font-bold tracking-[-0.055em] text-deck-red tabular">
                <NumberTicker value={35438} from={449} startOnView duration={1.8} format={(n) => `$${Math.round(n).toLocaleString('en-US')}`} />
              </div>
              <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.5] text-deck-mute">
                Listed on StubHub one day after Ticketmaster buckled. Standard Eras tickets had a face value of <b className="text-deck-ink">$49 to $449</b>.
              </p>
              <Sources className="mt-4">Sources: CNN; Fortune (Nov 2022)</Sources>
            </Reveal>
          </div>
          <div className="relative mx-auto h-[440px] w-full max-w-[520px] sm:h-[520px]">
            <motion.img
              style={reduced ? undefined : { y: y1 }}
              src={asset('deck/eras-queue.webp')}
              alt="Ticketmaster’s Eras Tour presale queue screen"
              loading="lazy"
              className="absolute top-0 right-0 w-[52%] rounded-[22px] shadow-[0_30px_60px_-30px_rgba(13,15,20,.6)] ring-1 ring-black/5"
            />
            <motion.img
              style={reduced ? undefined : { y: y2 }}
              src={asset('deck/eras-seatmap.webp')}
              alt="Stadium seat map with resale prices of $5,455 and $22,500"
              loading="lazy"
              className="absolute bottom-0 left-0 w-[72%] rounded-[22px] bg-white shadow-[0_30px_60px_-30px_rgba(13,15,20,.6)] ring-1 ring-black/5"
            />
          </div>
        </div>
      </Container>
    </Section>
  )
}

/* ───────── Slide 4 · Roadmap ───────── */
export const CHAPTERS = [
  ['problem', 'Problem'],
  ['solution', 'Solution'],
  ['why', 'Why it wins'],
  ['how', 'How it works'],
  ['buyin', 'Buy-in'],
  ['risks', 'Risks'],
] as const

export function Roadmap() {
  const cases = [
    ['road-concerts', 'Concerts'],
    ['road-worldcup', 'World Cup'],
    ['road-superbowl', 'Super Bowl'],
  ]
  return (
    <Section tone="gray">
      <Container>
        <SlideHead
          kicker="Introduction"
          title={
            <>
              From Sold Out to <Hi>Fair Resale</Hi>
            </>
          }
          sub="Our roadmap: where ticketing breaks, and how tokens fix it."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {cases.map(([img, label], i) => (
            <Reveal key={img} delay={i * 0.1}>
              <div className="group relative aspect-[16/10] overflow-hidden rounded-[22px] bg-deck-ink">
                <img src={asset(`deck/${img}.webp`)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(13,15,20,.85))]" />
                <div className="absolute bottom-4 left-5 text-[14px] font-bold tracking-[0.16em] text-white uppercase">{label}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.15} className="mt-10 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {CHAPTERS.map(([id, label], i) => (
            <a key={id} href={`#${id}`} className="group border-t-2 border-deck-line pt-3 transition-colors hover:border-deck-blue">
              <div className="text-[12px] font-semibold text-deck-blue-ink tabular">{String(i + 1).padStart(2, '0')}</div>
              <div className="mt-1 text-[18px] font-semibold tracking-[-0.02em] group-hover:text-deck-blue-ink">{label}</div>
            </a>
          ))}
        </Reveal>
      </Container>
    </Section>
  )
}
