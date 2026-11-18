import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { Lock, Search, ShieldCheck, Star } from 'lucide-react'
import { Mark } from '@/components/brand/Logo'
import { QRMark } from '@/components/ticket/DynamicQR'
import { Card, Container, Reveal, Section, SlideHead } from './ui'

/* ───────── Slide 7 · What the token changes ───────── */
export function TokenChanges() {
  const cards = [
    { icon: Lock, t: 'No double-selling', d: 'One token, one wallet. It can’t be sold to two buyers.' },
    { icon: ShieldCheck, t: 'Rules in code', d: 'The resale cap and artist royalty run on every transfer, automatically.' },
    { icon: Search, t: 'Anyone can verify', d: 'Fans, venues and artists can check a ticket’s history before buying.' },
    { icon: Star, t: 'Proof of attendance', d: 'After the show, the token earns past fans early access to the next presale.' },
  ]
  return (
    <Section id="solution">
      <Container>
        <SlideHead kicker="Part 2 · The solution" title="What the Token Changes" sub="Four things a smart contract guarantees that a PDF ticket can’t." />
        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((c, i) => (
              <Reveal key={c.t} delay={i * 0.08}>
                <Card className="h-full">
                  <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-deck-blue/10 text-deck-blue">
                    <c.icon size={20} />
                  </span>
                  <div className="mt-5 text-[19px] font-semibold tracking-[-0.02em] text-deck-blue-ink">{c.t}</div>
                  <div className="mt-1.5 text-[15px] leading-snug text-deck-slate">{c.d}</div>
                </Card>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.15} className="flex flex-col gap-4">
            <TokenTicket />
            <div className="rounded-[20px] border border-deck-green/25 bg-[#e9f6ee] p-5">
              <div className="text-[12px] font-bold tracking-[0.14em] text-deck-green-ink uppercase">Soulbound</div>
              <div className="mt-1 text-[15px] leading-snug text-deck-slate">For the biggest shows: tickets that can’t be transferred at all.</div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}

/** The deck's dark NFT ticket, with a little 3D tilt that follows the pointer. */
function TokenTicket() {
  const reduced = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 180, damping: 20 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 180, damping: 20 })
  const shine = useTransform(mx, [-0.5, 0.5], ['20%', '80%'])
  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        onPointerMove={(e) => {
          if (reduced) return
          const r = e.currentTarget.getBoundingClientRect()
          mx.set((e.clientX - r.left) / r.width - 0.5)
          my.set((e.clientY - r.top) / r.height - 0.5)
        }}
        onPointerLeave={() => {
          mx.set(0)
          my.set(0)
        }}
        style={{ rotateX: rx, rotateY: ry }}
        className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(150deg,#16213b_0%,#0d0f14_60%)] p-6 text-white shadow-[0_40px_80px_-30px_rgba(13,15,20,.6)]"
      >
        <motion.div style={{ left: shine }} className="pointer-events-none absolute -top-1/2 h-[200%] w-24 -translate-x-1/2 rotate-[20deg] bg-white/[0.06] blur-xl" />
        <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.2em] text-white/55 uppercase">
          <span>Admit one · Token #0412</span>
          <Mark size={22} className="text-deck-blue" />
        </div>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-[34px] leading-none font-bold tracking-[-0.03em]">Section 114</div>
            <div className="mt-2 text-[15px] text-white/65">Row 12 · Seat 7</div>
          </div>
          <span className="rounded-[12px] bg-white p-1.5">
            <QRMark text="https://diegooaalm-bot.github.io/fairseat-demo/#/demo" size={72} />
          </span>
        </div>
        <div className="mt-6 border-t border-dashed border-white/15 pt-4 font-mono text-[12px] leading-[1.9] text-white/55">
          <div>
            face <b className="font-semibold text-white">$100.00</b> · cap <b className="font-semibold text-[#8db8ff]">$105.00</b>
          </div>
          <div>
            owner <b className="font-semibold text-white">0x7a3…f19c</b>
          </div>
          <div>
            standard <b className="font-semibold text-white">ERC-721</b> · chain <b className="font-semibold text-white">Base</b>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
