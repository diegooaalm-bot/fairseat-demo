import { useDemo, type Role } from '@/store/demo'
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
    fact: '3.5B requests · $3.7B in fees · up to 6×',
    apply: () => {
      fresh()
      S().setRole('maya')
    },
  },
  {
    chapter: 2,
    chapterTitle: 'The big idea',
    title: 'What if the ticket knew the rules?',
    role: 'maya',
    scene: 'idea',
    say: 'So we asked one simple question: what if the ticket itself knew the rules? Meet FairSeat. Every ticket is unique, with its rules written inside: a 110% cap, 5% to the artist, verified fans only.',
    fact: 'Cap 110% · 5% royalty · 4 per fan',
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
    say: 'Presale day for Bad Bunny at Mercedes-Benz Stadium. Maya verified her identity once, when she signed up, like opening a bank account. Watch the bots: they hit the identity shield. Only verified humans get through, and priority goes to fans with real history.',
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
    say: 'She picks Section 312, Row 14, Seat 7: $100, all-in, no surprise fees. Up to four per person: try a fifth and the rule pushes back. She pays with her card, double-click, done. The ticket can’t be copied or faked.',
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
    say: 'A few weeks later Maya can’t go. She lists it. Watch the slider: it hits a wall at $110. This ticket knows the rules. She gets $104.50, the artist $5.50, and the buyer pays $113.30.',
    fact: '104.50 + 5.50 · buyer pays 113.30',
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
    title: 'Ben buys it for $110',
    role: 'ben',
    say: 'The show is sold out. Ben, a verified fan, finds Maya’s seat at $110, not $400 on a typical resale site. He pays, and in one all-or-nothing transaction the ticket and the money move at the same time. If any rule failed, nothing would move.',
    fact: '$110 here · $400 elsewhere',
    apply: () => {
      fresh()
      S().ensure('listed')
      S().setStack('ben', 'discover', [{ name: 'event', params: { id: 'nova' } }, { name: 'offer' }])
      S().setRole('ben')
    },
  },
  {
    chapter: 5,
    chapterTitle: 'Ben gets in',
    title: 'At the door',
    role: 'gate',
    say: 'Show night at Mercedes-Benz Stadium. Ben’s code changes every five seconds and is signed by his phone. Scan: welcome, Ben. Now try a screenshot, or Maya’s old ticket: rejected. And it keeps working offline.',
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
    title: 'I was there',
    role: 'ben',
    say: 'After the show, Ben gets an “I was there” badge. It can’t be sold or transferred. More shows means earlier presales. Bots can’t buy history.',
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
    title: '5% of every resale',
    role: 'artist',
    say: 'And the artist? Every resale pays the artist 5%, instantly. There’s Maya’s $5.50 going to Bad Bunny’s team. With traditional resale, the artist gets nothing.',
    fact: '+$5.50 per resale · $0 elsewhere',
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
    say: 'Anyone can audit it: every resale is public and every rule is code. We don’t use blockchain to sell tickets. We use it so that nobody, not even us, can break the rules.',
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
    say: 'So, back to Maya. Next time, she doesn’t lose to a bot. She gets in for $110, not $400. And the artist gets paid twice. FairSeat: the ticket that knows the rules.',
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
