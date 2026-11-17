import { useState, type ReactNode } from 'react'
import { Bell, CreditCard, Fingerprint, Gift, Home, Search, ShieldCheck, Ticket, User } from 'lucide-react'
import { AppIcon, Logo, Mark } from '@/components/brand/Logo'
import { EventArt } from '@/components/art/EventArt'
import { IPhoneFrame } from '@/components/device/IPhoneFrame'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { CapSlider } from '@/components/ui/CapSlider'
import { ListGroup, Row } from '@/components/ui/List'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { Pill } from '@/components/ui/Pill'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Segmented } from '@/components/ui/Segmented'
import { Sheet } from '@/components/ui/Sheet'
import { Toggle } from '@/components/ui/Toggle'
import { DynamicQR } from '@/components/ticket/DynamicQR'
import { TicketCard } from '@/components/ticket/TicketCard'
import { EVENTS, DISCOVER_ORDER } from '@/data/world'
import { usd } from '@/lib/money'
import { capCents, resaleBreakdown } from '@/lib/rules'
import { Screen } from '@/demo/shell/Screen'
import { TabBar } from '@/demo/shell/TabBar'
import { PhoneStage } from '@/demo/DemoPage'

/** Design-system sheet: every base component on one page (for review). */
export default function Kit() {
  return (
    <main className="min-h-dvh bg-ink px-[max(20px,env(safe-area-inset-left))] py-12">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-14">
        <header className="flex flex-col gap-3">
          <Logo size={22} />
          <h1 className="text-[clamp(40px,6vw,72px)] leading-[0.98] font-bold tracking-[-0.045em]">Design system</h1>
          <p className="max-w-[60ch] text-[17px] text-fg-2">
            Phase 1 · tokens, base components and the iPhone shell. One accent (Follow-Spot Blue), gold only for “I was there” badges.
          </p>
        </header>

        <Section title="Brand">
          <div className="flex flex-wrap items-center gap-6">
            <AppIcon size={88} />
            <AppIcon size={60} />
            <span className="grid h-[88px] w-[88px] place-items-center rounded-[20px] bg-white">
              <Mark size={52} color="#0a0a0d" />
            </span>
            <Logo size={34} />
            <Logo size={20} markClass="text-fg" />
          </div>
        </Section>

        <Section title="Color & type">
          <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
            <div className="flex flex-col gap-3 rounded-[28px] bg-ink-2 p-6 hairline">
              <div className="text-[64px] leading-none font-bold tracking-[-0.045em]">Knows the rules.</div>
              <div className="text-[28px] font-semibold tracking-[-0.025em]">Resell at a fair price</div>
              <div className="text-[17px] text-fg-2">Your seat goes to a verified fan. You get your money back, the artist gets 5%.</div>
              <div className="text-[44px] font-semibold tracking-[-0.03em] tabular">$113.30</div>
              <code className="font-mono text-[13px] text-fg-2">require(price &lt;= faceValue * 110%)</code>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                ['ink', '#0a0a0d'],
                ['ink-3', '#1a1a21'],
                ['fg-2', '#a3a3ae'],
                ['paper', '#f5f5f7'],
                ['accent', '#3e86ff'],
                ['stage', '#5ac8fa'],
                ['stage-2', '#7c6bff'],
                ['gold', '#f2c14e'],
                ['ok', '#30d158'],
                ['err', '#ff453a'],
                ['warn', '#ffd60a'],
                ['deep', '#2563eb'],
              ].map(([n, c]) => (
                <div key={n} className="flex flex-col gap-1.5">
                  <span className="h-14 rounded-[14px] hairline" style={{ background: c }} />
                  <span className="font-mono text-[11px] text-fg-3">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Controls">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg">Pay $113.30</Button>
              <Button size="lg" variant="secondary">Not now</Button>
              <Button variant="light">Try the live demo</Button>
              <Button variant="gold">Claim badge</Button>
              <Button variant="danger">Not the owner</Button>
              <Button variant="ghost">Learn more</Button>
              <Button size="sm">Story mode</Button>
              <Button size="sm" variant="secondary">Reset</Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <SegDemo />
              <ToggleDemo />
              <ProgressRing progress={0.62} />
              <Avatar name="Maya" hue={330} size={40} />
              <Avatar name="Ben" hue={200} size={40} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="accent" icon={<ShieldCheck size={13} />}>Fair Resale Protected</Pill>
              <Pill tone="ok">Verified fan</Pill>
              <Pill tone="gold">I was there</Pill>
              <Pill tone="err">Resale closed</Pill>
              <Pill tone="warn">Offline · validating</Pill>
              <Pill>Priority 2</Pill>
            </div>
          </div>
        </Section>

        <Section title="The cap slider">
          <SliderDemo />
        </Section>

        <Section title="Tickets & codes">
          <div className="grid items-center gap-8 md:grid-cols-[auto_auto] md:justify-start">
            <div className="flex w-full max-w-[400px] flex-col gap-4">
              <TicketCard ticket={{ eventId: 'nova', section: '112', row: 'F', seat: 7, faceCents: 10000, tokenId: 14207 }} tilt />
              <TicketCard ticket={{ eventId: 'velvet', section: 'GA', row: 'Floor', seat: 214, faceCents: 4500, tokenId: 3021 }} tilt />
            </div>
            <div className="flex flex-col items-center gap-3">
              <DynamicQR tokenId={14207} owner="0x2b9d04ae" />
              <div className="text-[13px] font-semibold text-fg-2">Signed by owner · refreshes every 5 s</div>
            </div>
          </div>
        </Section>

        <Section title="Event art">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {DISCOVER_ORDER.map((id) => (
              <div key={id} className="relative aspect-[4/5] overflow-hidden rounded-[22px] hairline">
                <EventArt event={EVENTS[id]} />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-[17px] font-bold tracking-[-0.02em]">{EVENTS[id].artist}</div>
                  <div className="text-[12px] text-white/75">{EVENTS[id].venue}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Shell">
          <div className="flex flex-wrap justify-center gap-10">
            <div className="h-[760px] w-[360px]">
              <PhoneStage>
                <IPhoneFrame clock="6:18">
                  <ShellDemo />
                </IPhoneFrame>
              </PhoneStage>
            </div>
            <div className="h-[760px] w-[360px]">
              <PhoneStage>
                <IPhoneFrame clock="6:18" sideGlow>
                  <SheetDemo />
                </IPhoneFrame>
              </PhoneStage>
            </div>
          </div>
        </Section>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-[13px] font-semibold tracking-[0.1em] text-fg-3 uppercase">{title}</h2>
      {children}
    </section>
  )
}

function SegDemo() {
  const [v, setV] = useState<'fans' | 'artists' | 'organizers'>('fans')
  return (
    <Segmented
      className="w-[320px]"
      value={v}
      onChange={setV}
      options={[
        { value: 'fans', label: 'Fans' },
        { value: 'artists', label: 'Artists' },
        { value: 'organizers', label: 'Organizers' },
      ]}
    />
  )
}
function ToggleDemo() {
  const [a, setA] = useState(true)
  const [b, setB] = useState(false)
  return (
    <div className="flex items-center gap-3">
      <Toggle checked={a} onChange={setA} label="Demo toggle" />
      <Toggle checked={b} onChange={setB} label="Offline mode" tone="warn" />
    </div>
  )
}

function SliderDemo() {
  const [v, setV] = useState(10400)
  const cap = capCents(10000)
  const br = resaleBreakdown(v)
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-5 rounded-[28px] bg-ink-2 p-6 hairline">
        <div className="flex items-end justify-between">
          <div className="text-[52px] leading-none font-bold tracking-[-0.04em] tabular">{usd(v)}</div>
          <div className="text-right text-[12px] text-fg-3">
            Max 110% of $100
            <br />
            set by the artist
          </div>
        </div>
        <CapSlider faceCents={10000} capCents={cap} minCents={8000} maxCents={14000} value={v} onChange={setV} />
        <div className="divide-y divide-white/[0.07] border-t border-white/[0.07]">
          <Line k="You receive" v={<NumberTicker value={br.seller} format={(n) => usd(Math.round(n))} className="text-accent-soft" />} />
          <Line k="Artist royalty · 5%" v={<NumberTicker value={br.royalty} format={(n) => usd(Math.round(n))} />} />
          <Line k="Buyer pays · incl. 3% fee" v={<NumberTicker value={br.buyerTotal} format={(n) => usd(Math.round(n))} />} />
        </div>
      </div>
      <div className="flex flex-col gap-5 rounded-[28px] bg-paper p-6 text-paper-ink">
        <div className="text-[13px] font-semibold tracking-[0.1em] text-paper-mute uppercase">Autoplay · light</div>
        <AutoSlider />
      </div>
    </div>
  )
}
function AutoSlider() {
  const [v, setV] = useState(9500)
  return (
    <>
      <div className="text-[52px] leading-none font-bold tracking-[-0.04em] tabular">{usd(v)}</div>
      <CapSlider tone="light" faceCents={10000} capCents={11000} minCents={8000} maxCents={14000} value={v} onChange={setV} autoDemo />
    </>
  )
}
function Line({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 text-[16px]">
      <span className="text-fg-2">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  )
}

function ShellDemo() {
  const [tab, setTab] = useState('discover')
  return (
    <div className="absolute inset-0">
      <Screen title="Discover" tabBar titleAccessory={<Avatar name="Maya" hue={330} size={34} />}>
        <div className="flex flex-col gap-5 px-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] hairline">
            <EventArt event={EVENTS.nova} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5">
              <Pill tone="glass" icon={<ShieldCheck size={13} />}>
                Fair Resale Protected
              </Pill>
              <div className="mt-3 text-[30px] leading-none font-extrabold tracking-[-0.035em]">Nova Bloom</div>
              <div className="mt-1 text-[14px] text-white/80">The Afterglow Tour · Peachtree Arena</div>
            </div>
          </div>
          <ListGroup header="This week">
            <Row icon={<Bell size={18} className="text-accent" />} title="Presale opens 6:00 PM" subtitle="Verified fans only" chevron onClick={() => {}} />
            <Row icon={<Fingerprint size={18} className="text-ok" />} title="Verified fan" value="Level 3" />
          </ListGroup>
        </div>
      </Screen>
      <TabBar
        value={tab}
        onChange={setTab}
        items={[
          { id: 'discover', label: 'Discover', icon: Home },
          { id: 'search', label: 'Search', icon: Search },
          { id: 'tickets', label: 'My Tickets', icon: Ticket, badge: 1 },
          { id: 'pass', label: 'Fan Pass', icon: User },
        ]}
      />
    </div>
  )
}

function SheetDemo() {
  const [open, setOpen] = useState(true)
  return (
    <div className="absolute inset-0">
      <Screen title="Checkout" large={false}>
        <div className="px-5 pt-6">
          <Button full size="lg" onClick={() => setOpen(true)}>
            Open payment sheet
          </Button>
        </div>
      </Screen>
      <Sheet open={open} onClose={() => setOpen(false)} title={<div className="text-[20px] font-bold tracking-[-0.02em]">Pay FairSeat</div>}>
        <div className="flex flex-col gap-4 px-5 pb-4">
          <ListGroup>
            <Row icon={<CreditCard size={18} className="text-accent" />} title="Card •••• 4242" subtitle="Debit" chevron />
            <Row icon={<Gift size={18} className="text-fg-2" />} title="Nova Bloom · Sec 112" value="$100.00" />
          </ListGroup>
          <div className="flex items-center justify-between px-1 text-[17px]">
            <span className="text-fg-2">Total</span>
            <span className="font-semibold tabular">$100.00</span>
          </div>
          <div className="text-center text-[15px] font-semibold text-accent-soft">Double-click side button to pay</div>
        </div>
      </Sheet>
    </div>
  )
}
