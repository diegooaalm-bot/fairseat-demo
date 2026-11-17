import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeftRight, Calculator, Coins, Music2 } from 'lucide-react'
import { CapSlider } from '@/components/ui/CapSlider'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { Pill } from '@/components/ui/Pill'
import { Range } from '@/components/ui/Range'
import { Toggle } from '@/components/ui/Toggle'
import { haptic } from '@/lib/haptics'
import { int, usd } from '@/lib/money'
import { spring } from '@/lib/motion'
import { FESTIVAL_DEFAULTS, festival } from '@/lib/rules'
import { Screen } from '@/demo/shell/Screen'
import { TabBar } from '@/demo/shell/TabBar'
import { ADDR } from '@/data/world'
import { novaStats, useDemo } from '@/store/demo'

export function ArtistApp() {
  const tab = useDemo((s) => s.nav.artist.tab)
  const setTab = useDemo((s) => s.setTab)
  return (
    <div className="absolute inset-0">
      {tab === 'model' ? <FestivalModel /> : <Royalties />}
      <TabBar
        value={tab}
        onChange={(t) => setTab('artist', t)}
        items={[
          { id: 'royalties', label: 'Royalties', icon: Coins },
          { id: 'model', label: 'Festival model', icon: Calculator },
        ]}
      />
    </div>
  )
}

const money = (n: number) => usd(Math.round(n))

/* ───────────────────────── Royalties, live ───────────────────────── */
function Royalties() {
  const s = useDemo()
  const st = novaStats(s)
  const ambient = useDemo((x) => x.ambientResale)
  const [live, setLive] = useState(true)
  const [chips, setChips] = useState<{ id: string; mine: boolean }[]>([])
  const seen = useRef<Set<string>>(new Set(s.ledger.filter((t) => t.kind === 'resale' && t.eventId === 'nova').map((t) => t.id)))

  useEffect(() => {
    if (!live) return
    const t = setInterval(ambient, 2600)
    return () => clearInterval(t)
  }, [live, ambient])

  // float a +$5.50 chip for every new resale
  useEffect(() => {
    const fresh = s.ledger.filter((t) => t.kind === 'resale' && t.eventId === 'nova' && !seen.current.has(t.id))
    if (!fresh.length) return
    fresh.forEach((t) => seen.current.add(t.id))
    haptic('light')
    setChips((c) => [...c, ...fresh.map((t) => ({ id: t.id, mine: t.from === ADDR.maya }))].slice(-6))
  }, [s.ledger])

  const resales = s.ledger.filter((t) => t.kind === 'resale' && t.eventId === 'nova').slice(0, 6)
  return (
    <Screen title="Royalties" tabBar roleButton>
      <div className="flex flex-col gap-4 px-4">
        {/* Counter */}
        <div className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(120%_100%_at_80%_0%,#3a2a8a,#141024_60%,#0a0a0d)] p-5 hairline">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(140deg,#8b6cff,#3e3ab0)]">
                <Music2 size={16} />
              </span>
              <div>
                <div className="text-[14px] font-semibold">Bad Bunny</div>
                <div className="text-[11px] text-white/60">DeBÍ TiRAR MáS FOToS World Tour · illustrative</div>
              </div>
            </div>
            <label className="flex items-center gap-2 text-[12px] text-white/70">
              Live
              <Toggle checked={live} onChange={setLive} label="Live resale market" tone="ok" />
            </label>
          </div>
          <div className="mt-6 text-[13px] text-white/60">Resale royalties earned</div>
          <div className="relative">
            <div className="text-[46px] leading-none font-bold tracking-[-0.045em]">
              <NumberTicker value={st.royaltyCents} format={money} duration={0.8} />
            </div>
            <div className="pointer-events-none absolute top-0 right-0 h-10 w-24">
              <AnimatePresence>
                {chips.map((c) => (
                  <motion.span
                    key={c.id}
                    initial={{ opacity: 0, y: 24, scale: 0.8 }}
                    animate={{ opacity: [0, 1, 1, 0], y: -30, scale: 1 }}
                    transition={{ duration: 1.8, times: [0, 0.15, 0.7, 1] }}
                    onAnimationComplete={() => setChips((x) => x.filter((y) => y.id !== c.id))}
                    className={`absolute right-0 rounded-full px-2 py-0.5 text-[13px] font-bold ${c.mine ? 'bg-gold text-[#1a1306]' : 'bg-ok text-ink'}`}
                  >
                    +$5.50{c.mine ? ' · Maya' : ''}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="mt-2 text-[13px] text-white/70 tabular">
            {int(st.resales)} fair resales × 5% · paid instantly, no invoices
          </div>
        </div>

        {/* Compare */}
        <div className="rounded-[24px] bg-ink-3 p-4 hairline">
          <div className="text-[17px] font-semibold tracking-[-0.015em]">One ticket, resold</div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="rounded-[18px] bg-white/[0.04] p-3.5">
              <div className="text-[12px] font-semibold text-fg-3">Traditional resale</div>
              <div className="mt-1 text-[13px] text-fg-2">Resold at $400</div>
              <div className="mt-3 text-[34px] leading-none font-bold tracking-[-0.04em] text-fg-3">$0</div>
              <div className="mt-1 text-[12px] text-fg-3">to the artist</div>
            </div>
            <div className="rounded-[18px] bg-accent/12 p-3.5 ring-1 ring-accent/40">
              <div className="text-[12px] font-semibold text-accent-soft">FairSeat</div>
              <div className="mt-1 text-[13px] text-fg-2">Resold at $110</div>
              <div className="mt-3 text-[34px] leading-none font-bold tracking-[-0.04em]">$5.50</div>
              <div className="mt-1 text-[12px] text-fg-3">to the artist, instantly</div>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-snug text-fg-3">The artist gets paid twice: once at the first sale and again on every resale.</p>
        </div>

        {/* Feed */}
        <div className="rounded-[24px] bg-ink-3 p-4 hairline">
          <div className="mb-1 text-[17px] font-semibold tracking-[-0.015em]">Latest resales</div>
          <AnimatePresence initial={false}>
            {resales.map((t) => (
              <motion.div key={t.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={spring.snappy} className="flex items-center gap-3 border-b border-white/[0.06] py-2.5 last:border-0">
                <span className={`grid h-8 w-8 place-items-center rounded-[10px] ${t.from === ADDR.maya ? 'bg-gold/15 text-gold' : 'bg-ok/15 text-ok'}`}>
                  <ArrowLeftRight size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{t.eventLabel ?? 'Mercedes-Benz Stadium · Atlanta'}</span>
                  <span className="block text-[12px] text-fg-3">
                    Resold at {usd(t.priceCents ?? 0)} · within cap
                  </span>
                </span>
                <span className="text-[14px] font-semibold text-ok tabular">+{usd(t.breakdown?.royalty ?? 0)}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Screen>
  )
}

/* ───────────────────────── Festival business model ───────────────────────── */
function FestivalModel() {
  const [v, setV] = useState(FESTIVAL_DEFAULTS)
  const f = festival(v)
  const cap = Math.round(v.price * 110)
  const set = (k: keyof typeof v, x: number) =>
    setV((o) => {
      const n = { ...o, [k]: x }
      const c = n.price * 1.1
      if (n.avgResale > c) n.avgResale = Math.floor(c)
      if (n.avgResale < n.price * 0.8) n.avgResale = Math.ceil(n.price * 0.8)
      return n
    })
  const isDefault = v.capacity === 50000 && v.price === 150 && v.resoldPct === 20 && v.avgResale === 160
  return (
    <Screen title="Festival model" tabBar roleButton titleAccessory={<Pill tone="warn">Illustrative</Pill>}>
      <div className="flex flex-col gap-4 px-4">
        <div className="grid grid-cols-2 gap-2.5">
          <Big label="FairSeat revenue" value={f.revenue} sub={`${usd(f.primaryFee * 100, { cents: false })} primary + ${usd(f.resaleFee * 100, { cents: false })} resale`} className="col-span-2" accent />
          <Big label="New artist royalties" value={f.royalties} sub="5% of every resale" gold />
          <Big label="Blockchain cost" value={f.chainCost} approx sub={`${int(f.ops)} ops × ≈ $0.01`} />
        </div>
        <div className="flex flex-col gap-5 rounded-[24px] bg-ink-3 p-4 hairline">
          <Range label="Capacity" value={v.capacity} min={5000} max={100000} step={5000} onChange={(x) => set('capacity', x)} format={(x) => int(x)} />
          <Range label="Ticket price" value={v.price} min={40} max={300} step={5} onChange={(x) => set('price', x)} format={(x) => `$${x}`} />
          <Range label="Share resold" value={v.resoldPct} min={0} max={40} step={1} onChange={(x) => set('resoldPct', x)} format={(x) => `${x}%`} hint="20–30% is typical for high-demand events" />
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] text-fg-2">Average resale price</span>
              <span className="text-[17px] font-semibold tabular">${v.avgResale}</span>
            </div>
            <CapSlider
              faceCents={v.price * 100}
              capCents={cap}
              minCents={Math.round(v.price * 80)}
              maxCents={Math.round(v.price * 140)}
              value={v.avgResale * 100}
              onChange={(c) => set('avgResale', Math.round(c / 100))}
              label="Average resale price"
              faceLabel="face"
            />
          </div>
        </div>
        <p className="px-1 text-[12px] leading-snug text-fg-3">
          Illustrative hypothesis, not a forecast. Defaults: 50,000 tickets at $150, 20% resold at an average of $160 (cap $165). The expensive parts are identity checks, card processing and support. The technology is the cheap part.
          {!isDefault && (
            <button className="ml-1 font-semibold text-accent-soft" onClick={() => setV(FESTIVAL_DEFAULTS)}>
              Reset to defaults
            </button>
          )}
        </p>
      </div>
    </Screen>
  )
}

function Big({ label, value, sub, className = '', accent, gold, approx }: { label: string; value: number; sub: string; className?: string; accent?: boolean; gold?: boolean; approx?: boolean }) {
  return (
    <div className={`rounded-[22px] p-4 hairline ${accent ? 'bg-accent/12 ring-1 ring-accent/30' : 'bg-ink-3'} ${className}`}>
      <div className={`text-[12px] font-semibold ${gold ? 'text-gold' : accent ? 'text-accent-soft' : 'text-fg-3'}`}>{label}</div>
      <div className={`mt-1 font-bold tracking-[-0.04em] ${accent ? 'text-[40px]' : 'text-[28px]'} leading-none`}>
        {approx && <span className="text-fg-3">≈ </span>}
        <NumberTicker value={value} format={(n) => usd(Math.round(n) * 100, { cents: false })} duration={0.5} />
      </div>
      <div className="mt-1.5 text-[12px] text-fg-3">{sub}</div>
    </div>
  )
}
