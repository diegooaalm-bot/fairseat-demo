import { Button } from '@/components/ui/Button'
import { usd } from '@/lib/money'
import { novaListing, useDemo } from '@/store/demo'
import { DemoButton } from '../fan/TicketPanel'

/** Ben's footer on the (sold out) event page. */
export function BenEventFooter() {
  const listing = useDemo(novaListing)
  const push = useDemo((s) => s.push)
  const ensure = useDemo((s) => s.ensure)
  const owns = useDemo((s) => s.tickets.some((t) => t.eventId === 'nova' && t.owner === 'ben' && t.status !== 'gone'))
  if (owns)
    return (
      <Button size="lg" full variant="secondary" onClick={() => useDemo.getState().setTab('ben', 'tickets')}>
        You’re going · View ticket
      </Button>
    )
  if (listing)
    return (
      <Button size="lg" full onClick={() => push('ben', { name: 'offer', params: { id: listing.id } })}>
        Buy fair resale · {usd(listing.priceCents)} · Sec {listing.section}
      </Button>
    )
  return (
    <div className="flex flex-col items-center gap-3">
      <Button size="lg" full disabled>
        Sold out · no resale listings yet
      </Button>
      <DemoButton onClick={() => ensure('listed')}>Maya lists her seat</DemoButton>
    </div>
  )
}
