import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { CHAPTERS, Eras, FanVideo, Hero, Roadmap } from './deck/Opening'
import { Broken, Scalping } from './deck/Problem'
import { Alternatives, TokenChanges } from './deck/Solution'
import { BuildingBlocks, ContractRules } from './deck/How'
import { BuyIn, Following105, Risks } from './deck/Business'
import { Footer, ThankYou, TryDemo } from './deck/Closing'

/** The product page follows the Proof of Seat deck, slide by slide. */
export default function Landing() {
  useEffect(() => {
    document.title = 'Proof of Seat · Tickets on the Blockchain'
    // hash links (#problem) live inside the HashRouter route, so scroll manually
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a || a.getAttribute('href')?.startsWith('#/')) return
      const el = document.getElementById(a.getAttribute('href')!.slice(1))
      if (el) {
        e.preventDefault()
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return (
    <div className="relative bg-white text-deck-ink">
      <Nav />
      <main>
        <Hero />
        <FanVideo />
        <Eras />
        <Roadmap />
        <Broken />
        <Scalping />
        <TokenChanges />
        <Alternatives />
        <BuildingBlocks />
        <ContractRules />
        <Following105 />
        <BuyIn />
        <Risks />
        <TryDemo />
        <ThankYou />
      </main>
      <Footer />
    </div>
  )
}

function Nav() {
  const { scrollY } = useScroll()
  const [light, setLight] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  useMotionValueEvent(scrollY, 'change', (v) => setLight(v > window.innerHeight - 64))
  useEffect(() => {
    const ids = [...CHAPTERS.map(([id]) => id), 'rules', 'business', 'demo']
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setActive(vis[0].target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  // sections without their own chapter belong to the one before them
  const chapterOf = (id: string | null) => (id === 'rules' ? 'how' : id === 'business' ? 'buyin' : id === 'demo' ? null : id)
  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${light ? 'border-b border-black/[0.06] bg-white/80 text-deck-ink backdrop-blur-xl backdrop-saturate-150' : 'border-b border-transparent text-white'}`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" aria-label="Proof of Seat home" className="shrink-0">
          <Logo size={18} markClass="text-deck-blue" />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Chapters">
          {CHAPTERS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={`relative rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${chapterOf(active) === id ? (light ? 'text-deck-blue-ink' : 'text-white') : light ? 'text-deck-mute hover:text-deck-ink' : 'text-white/70 hover:text-white'}`}
            >
              {chapterOf(active) === id && <motion.span layoutId="chapter-pill" className={`absolute inset-0 -z-[1] rounded-full ${light ? 'bg-deck-blue/10' : 'bg-white/15'}`} />}
              {label}
            </a>
          ))}
        </nav>
        <Link to="/demo" className="inline-flex h-9 shrink-0 items-center rounded-full bg-deck-blue px-4 text-[14px] font-semibold text-white transition-transform hover:scale-[1.04] active:scale-[0.97]">
          Try the demo
        </Link>
      </div>
    </motion.header>
  )
}
