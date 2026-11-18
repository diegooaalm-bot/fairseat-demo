import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { BadgeCheck, Check, Gift as GiftIcon, Info } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { TicketCard } from '@/components/ticket/TicketCard'
import { ADDR, CONTACTS, type PersonId } from '@/data/world'
import { haptic } from '@/lib/haptics'
import { spring } from '@/lib/motion'
import { Screen } from '@/demo/shell/Screen'
import { useDemo } from '@/store/demo'

export function GiftScreen({ person, id }: { person: PersonId; id: string }) {
  const ticket = useDemo((s) => s.tickets.find((t) => t.id === id))
  const pop = useDemo((s) => s.pop)
  const popToRoot = useDemo((s) => s.popToRoot)
  const gift = useDemo((s) => s.gift)
  const [to, setTo] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const contacts = CONTACTS.filter((c) => c.id !== (ticket?.prevOwner ?? ''))
  if (!ticket) return null
  const left = ticket.transfersLeft
  const target = contacts.find((c) => c.id === to)

  return (
    <Screen
      title="Send as a gift"
      large={false}
      onBack={() => pop(person)}
      footer={
        !sent && (
          <Button
            size="lg"
            full
            disabled={!target || left <= 0}
            icon={<GiftIcon size={18} />}
            onClick={() => {
              if (!target) return
              haptic('success')
              setSent(true)
              setTimeout(() => {
                gift(ticket.id, target.id, (ADDR as Record<string, string>)[target.id] ?? ADDR.lucia)
                popToRoot(person)
              }, 1700)
            }}
          >
            {target ? `Send to ${target.name}` : 'Choose a verified friend'}
          </Button>
        )
      }
    >
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div key="sent" className="flex flex-col items-center px-6 pt-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="w-[78%]" animate={{ y: [0, 10, -420], rotate: [0, -2, 8], scale: [1, 1, 0.6] }} transition={{ duration: 1.3, times: [0, 0.25, 1], ease: 'easeIn' }}>
              <TicketCard ticket={ticket} compact />
            </motion.div>
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring.wall, delay: 0.9 }} className="mt-[-120px] grid h-14 w-14 place-items-center rounded-full bg-ok text-white">
              <Check size={30} strokeWidth={3} />
            </motion.span>
            <div className="mt-4 text-[24px] font-bold tracking-[-0.02em]">Sent to {target?.name}</div>
            <div className="text-[15px] text-fg-3">Free, instant, and only between verified fans.</div>
          </motion.div>
        ) : (
          <motion.div key="pick" className="flex flex-col gap-5 px-5 pt-2" exit={{ opacity: 0 }}>
            <div className="flex items-center gap-4 rounded-[22px] bg-ink-3 p-4 hairline">
              <div className="relative grid place-items-center">
                <ProgressRing progress={left / 2} size={56} stroke={5} />
                <span className="absolute text-[18px] font-bold tabular">{left}</span>
              </div>
              <div className="min-w-0">
                <div className="text-[17px] font-semibold tracking-[-0.015em]">{left} of 2 transfers left</div>
                <div className="text-[13px] leading-snug text-fg-3">Gifts are free and limited, so a “gift” can’t hide a resale.</div>
              </div>
            </div>
            <div>
              <div className="mb-2 px-1 text-[13px] font-semibold tracking-[0.04em] text-fg-3 uppercase">Friends on Proof of Seat</div>
              <div className="overflow-hidden rounded-[20px] bg-ink-3 hairline">
                {contacts.map((c) => {
                  const sel = to === c.id
                  return (
                    <motion.button
                      key={c.id}
                      disabled={!c.verified}
                      whileTap={c.verified ? { backgroundColor: 'rgba(255,255,255,.05)' } : undefined}
                      onClick={() => {
                        haptic('light')
                        setTo(c.id)
                      }}
                      className="relative flex w-full items-center gap-3 px-4 py-3 text-left after:absolute after:right-0 after:bottom-0 after:left-[64px] after:h-px after:bg-white/[0.07] last:after:hidden disabled:opacity-45"
                    >
                      <Avatar name={c.name} hue={c.hue} size={38} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[16px] font-semibold">{c.name}</span>
                        <span className={`flex items-center gap-1 text-[13px] ${c.verified ? 'text-ok' : 'text-fg-3'}`}>
                          {c.verified ? (
                            <>
                              <BadgeCheck size={14} /> Verified fan
                            </>
                          ) : (
                            'Not verified · can’t receive tickets'
                          )}
                        </span>
                      </span>
                      <span className={`grid h-6 w-6 place-items-center rounded-full border-2 ${sel ? 'border-accent bg-accent' : 'border-white/20'}`}>
                        {sel && <Check size={14} strokeWidth={3} className="text-white" />}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
            <div className="flex items-start gap-2 px-1 text-[13px] leading-snug text-fg-3">
              <Info size={15} className="mt-0.5 shrink-0" /> The ticket moves to your friend’s phone with a new code that only works for them.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  )
}
