import { AnimatePresence } from 'motion/react'
import { Compass, Ticket, UserRound } from 'lucide-react'
import { type EventId, type PersonId } from '@/data/world'
import { StackView } from '@/demo/shell/StackView'
import { TabBar } from '@/demo/shell/TabBar'
import { useDemo, type Route } from '@/store/demo'
import { useUI } from '@/store/ui'
import { AtomicSwap } from './AtomicSwap'
import { Celebration } from './Celebration'
import { Discover } from './Discover'
import { EventDetail } from './EventDetail'
import { FanPass } from './FanPass'
import { GiftScreen } from './Gift'
import { Onboarding } from './Onboarding'
import { Queue } from './Queue'
import { Resell } from './Resell'
import { Seats } from './Seats'
import { SideHint } from './SideHint'
import { Wallet } from './Wallet'
import { BenEventFooter, ResaleOffer } from '../ben/BenEvent'

export function FanApp({ person }: { person: PersonId }) {
  const onboarded = useDemo((s) => s[person].onboarded)
  const tab = useDemo((s) => s.nav[person].tab)
  const depth = useDemo((s) => s.nav[person].stack.length)
  const setTab = useDemo((s) => s.setTab)
  const count = useDemo((s) => s.tickets.filter((t) => t.owner === person && t.status !== 'gone' && t.status !== 'used').length)
  const celebration = useDemo((s) => s.celebrations.find((c) => c.person === person))
  const dismiss = useDemo((s) => s.dismissCelebration)
  const swap = useUI((s) => s.swap)

  if (!onboarded) return <Onboarding />

  const root = tab === 'tickets' ? <Wallet person={person} /> : tab === 'pass' ? <FanPass person={person} /> : <Discover person={person} />
  const render = (r: Route) => {
    switch (r.name) {
      case 'event':
        return <EventDetail person={person} id={r.params!.id as EventId} footer={person === 'ben' ? <BenEventFooter /> : undefined} />
      case 'queue':
        return <Queue person={person} />
      case 'seats':
        return <Seats person={person} id={r.params!.id as EventId} />
      case 'resell':
        return <Resell person={person} id={r.params!.id} />
      case 'offer':
        return <ResaleOffer />
      case 'gift':
        return <GiftScreen person={person} id={r.params!.id} />
      default:
        return null
    }
  }

  return (
    <div className="absolute inset-0">
      <StackView role={person} root={root} render={render} />
      <TabBar
        hidden={depth > 0}
        value={tab}
        onChange={(t) => setTab(person, t)}
        items={[
          { id: 'discover', label: 'Discover', icon: Compass },
          { id: 'tickets', label: 'My Tickets', icon: Ticket, badge: tab !== 'tickets' ? count : 0 },
          { id: 'pass', label: 'Fan Pass', icon: UserRound },
        ]}
      />
      <SideHint />
      <AnimatePresence>{swap && swap.viewer === person && <AtomicSwap key={swap.id} viewer={person} />}</AnimatePresence>
      <AnimatePresence>
        {!swap && celebration && <Celebration key={celebration.badge.id} c={celebration} onDone={() => (dismiss(person), setTab(person, 'pass'))} />}
      </AnimatePresence>
    </div>
  )
}
