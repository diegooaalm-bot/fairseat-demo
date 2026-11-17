import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Hero } from './sections/Hero'
import { BigIdea, FollowTheMoney, Hook, Problem } from './sections/Story'
import { HowItWorks } from './sections/HowItWorks'
import { Audiences, Business, TryResale, WhyBlockchain } from './sections/Value'
import { Close, Footer, WhyNow } from './sections/Ending'

export default function Landing() {
  useEffect(() => {
    document.title = 'FairSeat · The ticket that knows the rules'
    // hash links (#how) live inside the HashRouter route, so scroll manually
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a || a.getAttribute('href')?.startsWith('#/')) return
      const id = a.getAttribute('href')!.slice(1)
      const el = document.getElementById(id)
      if (el) {
        e.preventDefault()
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return (
    <div className="relative bg-ink text-fg">
      <Nav />
      <main>
        <Hero />
        <Hook />
        <Problem />
        <FollowTheMoney />
        <BigIdea />
        <HowItWorks />
        <TryResale />
        <Audiences />
        <WhyBlockchain />
        <Business />
        <WhyNow />
        <Close />
      </main>
      <Footer />
    </div>
  )
}

function Nav() {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => setSolid(v > 40))
  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid ? 'glass border-b border-white/[0.07]' : 'border-b border-transparent'}`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="FairSeat home">
          <Logo size={19} />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-6">
          <a href="#how" className="hidden text-[14px] text-fg-2 transition-colors hover:text-fg sm:inline">
            How it works
          </a>
          <a href="#why" className="hidden text-[14px] text-fg-2 transition-colors hover:text-fg sm:inline">
            Why blockchain
          </a>
          <a href="#business" className="hidden text-[14px] text-fg-2 transition-colors hover:text-fg md:inline">
            Business
          </a>
          <Link to="/demo" className="inline-flex h-9 items-center rounded-full bg-accent-fill px-4 text-[14px] font-semibold text-white transition-transform hover:scale-[1.04] active:scale-[0.97]">
            Try the demo
          </Link>
        </nav>
      </div>
    </motion.header>
  )
}
