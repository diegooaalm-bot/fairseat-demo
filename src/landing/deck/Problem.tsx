import { motion } from 'motion/react'
import { Copy, Database, Music2, Zap } from 'lucide-react'
import { Card, Container, Hi, Reveal, Section, SlideHead, Sources, asset } from './ui'

/* ───────── Slide 5 · Why ticketing is broken ───────── */
export function Broken() {
  const cards = [
    { icon: Zap, t: 'Bots & scalpers', d: 'Bots buy the moment a sale opens, then relist at several times face value.' },
    { icon: Copy, t: 'Fake & duplicate tickets', d: 'One PDF sold to five buyers: only the first one gets in. Bitcoin’s double-spend problem, for tickets.' },
    { icon: Music2, t: 'Artists earn $0 on resale', d: 'The markup goes to brokers and resale platforms, not the artist or venue.' },
    { icon: Database, t: 'One company’s ledger', d: 'A single company keeps the only record of who owns each ticket, and sets the fees.' },
  ]
  return (
    <Section id="problem">
      <Container>
        <SlideHead kicker="Part 1 · The problem" title="Why Ticketing Is Broken" sub="Four problems a regular ticketing database can’t fix on its own." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.t} delay={i * 0.08}>
              <Card className="h-full transition-transform duration-500 hover:-translate-y-1">
                <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#fdecec] text-deck-red">
                  <c.icon size={22} />
                </span>
                <div className="mt-6 text-[19px] font-semibold tracking-[-0.02em]">{c.t}</div>
                <div className="mt-2 text-[15px] leading-snug text-deck-mute">{c.d}</div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}

/* ───────── Slide 6 · Scalping in action ───────── */
const ARTISTS = [
  { img: 'artist-ariana', name: 'Ariana Grande', tour: 'Eternal Sunshine Tour · North America · 2026', face: '$80–$200', faceK: 'Face value', resale: '$953', resaleK: 'Avg. resale', pct: 377, note: 'vs. top face price' },
  { img: 'artist-pinkpantheress', name: 'PinkPantheress', tour: 'Alexandra Palace · London · May 29, 2026', face: 'from £54.35', faceK: 'Face value', resale: 'from £130.14', resaleK: 'Resale', pct: 139, note: 'cheapest seat' },
  { img: 'artist-partynextdoor', name: 'PARTYNEXTDOOR', tour: 'Sorry I’m Outside Tour · 013, Tilburg · Oct 16, 2024', face: 'from $62.29', faceK: 'Face value', resale: 'from $117.40', resaleK: 'Resale', pct: 88, note: 'cheapest seat' },
  { img: 'artist-drake', name: 'Drake', tour: 'UK & Europe tour · London · 2025', face: 'from £66.35', faceK: 'Face value', resale: 'from £110.25', resaleK: 'Resale', pct: 66, note: 'cheapest seat' },
]
export function Scalping() {
  return (
    <Section tone="gray">
      <Container>
        <SlideHead
          kicker="Part 1 · The problem"
          title={
            <>
              Scalping in action: <Hi>face value vs. resale</Hi>
            </>
          }
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ARTISTS.map((a, i) => (
            <Reveal key={a.name} delay={i * 0.08}>
              <div className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-deck-line bg-white">
                <div className="aspect-[16/9] overflow-hidden bg-deck-line">
                  <img src={asset(`deck/${a.img}.webp`)} alt={a.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="text-[19px] font-semibold tracking-[-0.02em]">{a.name}</div>
                  <div className="mt-1 text-[13px] leading-snug text-deck-mute">{a.tour}</div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[13px]">
                    <div>
                      <div className="text-deck-mute">{a.faceK}</div>
                      <div className="font-semibold">{a.face}</div>
                    </div>
                    <div>
                      <div className="text-deck-mute">{a.resaleK}</div>
                      <div className="font-semibold">{a.resale}</div>
                    </div>
                  </div>
                  <div className="mt-auto pt-6">
                    <div className="text-[48px] leading-none font-bold tracking-[-0.045em] text-deck-red tabular">+{a.pct}%</div>
                    <div className="mt-1 text-[12px] text-deck-mute">{a.note}</div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-deck-bg">
                      <motion.div
                        className="h-full rounded-full bg-deck-red"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.min(100, (a.pct / 377) * 100)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Sources>
          Markup = (resale − face) ÷ face. Sources: SeatGeek Summer Concert Report 2026, Musicfeeds, Stereoboard. “Cheapest seat” compares lowest listings; premium seats mark up far more.
        </Sources>
      </Container>
    </Section>
  )
}
