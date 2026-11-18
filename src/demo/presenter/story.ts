import { novaListing, useDemo, type Role } from '@/store/demo'
import { useUI } from '@/store/ui'

/**
 * Story mode: the class script, step by step. Every step rebuilds the demo
 * from a clean reset, so next/previous always land in the same state.
 */
export type Scene = 'problem' | 'idea' | 'close'

export interface StoryStep {
  chapter: number // 1..7
  chapterTitle: string
  title: string
  say: string
  fact?: string
  role: Role
  scene?: Scene
  apply: () => void
}

const S = () => useDemo.getState()
const U = () => useUI.getState()
const later = (fn: () => void, ms: number) => setTimeout(fn, ms)

function fresh() {
  U().closeSwap()
  U().setFocusTicket(null)
  U().setRoleSheet(false)
  S().reset()
}
function onboarded() {
  S().ensure('mayaOnboarded')
  S().setFlag('giftSeen')
}
function clearCelebrations() {
  useDemo.setState({ celebrations: [] })
}

export const STEPS: StoryStep[] = [
  {
    chapter: 1,
    chapterTitle: 'The problem',
    title: 'Maya lost to bots',
    role: 'maya',
    scene: 'problem',
    say: 'Who here has ever lost a concert ticket to a “sold out” sign? Meet Maya. She waited two hours in a virtual queue. Sold out in minutes. Ten minutes later, her $100 ticket was listed at $400. She didn’t lose to other fans. She lost to bots.',
    fact: '$100 face value · $400 resale · $0 to the artist',
    apply: () => {
      fresh()
      S().setRole('maya')
    },
  },
  {
    chapter: 2,
    chapterTitle: 'The big idea',
    title: 'One seat. One token. One owner.',
    role: 'maya',
    scene: 'idea',
    say: 'Meet Proof of Seat. One seat, one token, one owner. Every ticket is a token on a public ledger, so it can’t sit in two wallets or be sold twice, and its rules travel with it: resale capped at 105%, 2% to the artist, 4 tickets per verified fan.',
    fact: 'Cap 105% · 2% to the artist · 4 per fan',
    apply: () => {
      fresh()
      S().setRole('maya')
    },
  },
  {
    chapter: 3,
    chapterTitle: 'The purchase',
    title: 'The fair queue',
    role: 'maya',
    say: 'Presale day for Faye Webster’s hometown show at the Fox Theatre: a mid-size venue, the kind we’d pilot with. Maya verified her ID once, when she signed up. Watch the bots: they hit the identity check. Only verified people get through, and past fans get priority.',
    fact: 'Bots blocked, live',
    apply: () => {
      fresh()
      onboarded()
      S().setStack('maya', 'discover', [{ name: 'event', params: { id: 'nova' } }, { name: 'queue', params: { id: 'nova' } }])
      S().setRole('maya')
      later(() => U().triggerAttack(), 1100)
    },
  },
  {
    chapter: 3,
    chapterTitle: 'The purchase',
    title: 'Pick a seat and pay',
    role: 'maya',
    say: 'She picks Mezzanine M3, Row 14, Seat 7: $100, all-in, no surprise fees. Up to four per person: try a fifth and the rule pushes back. She pays with her card. The app created her wallet at sign-up and pays the gas, so she never touches crypto.',
    fact: '$100 face value · no fees for the fan',
    apply: () => {
      fresh()
      onboarded()
      S().setFlag('queueDone')
      S().setStack('maya', 'discover', [
        { name: 'event', params: { id: 'nova' } },
        { name: 'queue', params: { id: 'nova' } },
        { name: 'seats', params: { id: 'nova' } },
      ])
      S().setRole('maya')
    },
  },
  {
    chapter: 4,
    chapterTitle: 'The resale',
    title: 'Maya can’t go',
    role: 'maya',
    say: 'A few weeks later Maya can’t go. She taps Sell. Watch the slider: it hits a wall at $105. A sale above the cap isn’t against the rules, it’s impossible: the contract rejects it. Of the $105, Maya gets $102, the artist $2 and Proof of Seat $1.',
    fact: '$102 seller · $2 artist · $1 platform',
    apply: () => {
      fresh()
      S().ensure('mayaBought')
      S().setFlag('giftSeen')
      S().setFlag('queueDone')
      const t = S().tickets.find((x) => x.eventId === 'nova' && x.owner === 'maya')
      S().setStack('maya', 'tickets', t ? [{ name: 'resell', params: { id: t.id } }] : [])
      S().setRole('maya')
    },
  },
  {
    chapter: 4,
    chapterTitle: 'The resale',
    title: 'The fair resale market',
    role: 'ben',
    say: 'Now the show is sold out. This is Proof of Seat’s resale market: every seat comes from a verified fan, and every price is checked against the cap written into the ticket. Never above 105% of face value. Sold-out shows come first, and there is Maya’s seat at $105.',
    fact: 'Every listing ≤ 105% of face value',
    apply: () => {
      fresh()
      S().ensure('listed')
      U().setResaleSide('buy')
      S().setTab('ben', 'resale')
      S().setRole('ben')
    },
  },
  {
    chapter: 4,
    chapterTitle: 'The resale',
    title: 'Ben buys it for $105',
    role: 'ben',
    say: 'Ben, a verified fan, opens Maya’s seat: $105 all-in, not $400 plus fees on a typical resale site. The price check shows face value, listing and cap side by side. He pays, and in one all-or-nothing transaction the ticket and the money move at the same time. If any rule failed, nothing would move.',
    fact: '$105 here · $400+ elsewhere',
    apply: () => {
      fresh()
      S().ensure('listed')
      const l = novaListing(S())
      S().setStack('ben', 'discover', l ? [{ name: 'event', params: { id: 'nova' } }, { name: 'offer', params: { id: l.id } }] : [{ name: 'event', params: { id: 'nova' } }])
      S().setRole('ben')
    },
  },
  {
    chapter: 5,
    chapterTitle: 'Ben gets in',
    title: 'At the door',
    role: 'gate',
    say: 'Show night at the Fox Theatre. Ben’s QR changes every few seconds and is signed by the wallet on his phone. Scan: welcome, Ben. Now try a screenshot, or Maya’s old ticket: rejected. And it keeps working offline.',
    fact: 'Signed QR · works offline',
    apply: () => {
      fresh()
      S().ensure('benBought')
      S().advanceTo('doors')
      clearCelebrations()
      S().setRole('gate')
    },
  },
  {
    chapter: 6,
    chapterTitle: 'The badge',
    title: 'Proof of attendance',
    role: 'ben',
    say: 'After the show, Ben’s token becomes proof of attendance: an “I was there” badge that can’t be sold or transferred. It earns him early access to the next presale. Bots can’t buy history.',
    fact: 'Level up · priority next presale',
    apply: () => {
      fresh()
      S().ensure('benEntered')
      clearCelebrations()
      S().setStack('ben', 'tickets', [])
      S().setRole('ben')
      later(() => {
        S().advanceTo('after')
        useDemo.setState((s) => ({ celebrations: s.celebrations.filter((c) => c.person === 'ben') }))
      }, 900)
    },
  },
  {
    chapter: 7,
    chapterTitle: 'The artist gets paid',
    title: '2% of every resale',
    role: 'artist',
    say: 'And the artist? Every resale pays the artist 2% of face value, automatically. There’s Maya’s $2 going to Faye Webster’s team. With traditional resale, the artist gets $0.',
    fact: '+$2 per resale · $0 elsewhere',
    apply: () => {
      fresh()
      S().ensure('after')
      clearCelebrations()
      S().setTab('artist', 'royalties')
      S().setRole('artist')
    },
  },
  {
    chapter: 7,
    chapterTitle: 'The artist gets paid',
    title: 'Anyone can check',
    role: 'proof',
    say: 'Anyone can verify it: fans, venues, artists, other marketplaces. Every resale is public and every rule is code. Ticketmaster could cap prices in its own database; here nobody has to trust a company to keep doing it, not even us.',
    fact: 'Every require ✓',
    apply: () => {
      fresh()
      S().ensure('after')
      clearCelebrations()
      S().setFlag('hood')
      S().setRole('proof')
    },
  },
  {
    chapter: 7,
    chapterTitle: 'The artist gets paid',
    title: 'Back to Maya',
    role: 'maya',
    scene: 'close',
    say: 'So, back to Maya. Next time, she doesn’t lose to a bot, the resale price is capped and the artist gets paid. Proof of Seat: one seat, one token, one owner.',
    apply: () => {
      fresh()
      S().ensure('after')
      clearCelebrations()
      S().setRole('maya')
    },
  },
]

export const CHAPTERS = [1, 2, 3, 4, 5, 6, 7].map((c) => STEPS.find((s) => s.chapter === c)!.chapterTitle)

export function goToStep(i: number) {
  const n = Math.max(0, Math.min(STEPS.length - 1, i))
  STEPS[n].apply()
  S().setStory({ active: true, chapter: n })
}
export const nextStep = () => goToStep(S().story.chapter + 1)
export const prevStep = () => goToStep(S().story.chapter - 1)
export const exitStory = () => S().setStory({ active: false })
export const startStory = () => goToStep(0)
export const currentScene = (): Scene | undefined => {
  const s = S().story
  return s.active ? STEPS[s.chapter]?.scene : undefined
}
