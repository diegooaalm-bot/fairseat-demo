import { motion } from 'motion/react'
import { BadgeCheck, Lock, Sparkles } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Pill } from '@/components/ui/Pill'
import { fanLevel, type PersonId } from '@/data/world'
import { spring } from '@/lib/motion'
import { Screen } from '@/demo/shell/Screen'
import { useDemo } from '@/store/demo'
import { levelPct, Medal } from './Celebration'

export function FanPass({ person }: { person: PersonId }) {
  const p = useDemo((s) => s[person])
  const lvl = fanLevel(p.badges.length)
  const name = person === 'maya' ? 'Maya' : 'Ben'
  const hue = person === 'maya' ? 330 : 200
  return (
    <Screen title="Fan Pass" tabBar roleButton>
      <div className="flex flex-col gap-5 px-5">
        <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(150deg,#1b2440,#0e1220_60%)] p-5 hairline">
          <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(242,193,78,.25),transparent)]" />
          <div className="flex items-center gap-3">
            <Avatar name={name} hue={hue} size={52} />
            <div>
              <div className="text-[22px] font-bold tracking-[-0.025em]">{name}</div>
              {p.verified ? (
                <Pill tone="ok" icon={<BadgeCheck size={13} />}>
                  Verified fan
                </Pill>
              ) : (
                <Pill>Not verified yet</Pill>
              )}
            </div>
          </div>
          <div className="mt-6 flex items-end justify-between">
            <div>
              <div className="text-[13px] text-fg-3">Fan level</div>
              <div className="text-[30px] leading-none font-bold tracking-[-0.03em]">
                {lvl.level} <span className="text-[18px] font-semibold text-fg-2">· {lvl.name}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[13px] text-fg-3">Presale access</div>
              <div className="text-[17px] font-semibold text-gold">{lvl.priority === 'General' ? 'Fair draw' : lvl.priority}</div>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <motion.div className="h-full rounded-full bg-[linear-gradient(90deg,#c9962a,#f2c14e)]" initial={{ width: 0 }} animate={{ width: `${Math.max(4, levelPct(p.badges.length))}%` }} transition={spring.gentle} />
          </div>
          <div className="mt-2 text-[12px] text-fg-3">
            {lvl.next ? `${lvl.next - p.badges.length} more show${lvl.next - p.badges.length === 1 ? '' : 's'} to Level ${lvl.level + 1}` : 'Top level. First in every presale.'}
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-baseline justify-between px-1">
            <h2 className="text-[22px] font-bold tracking-[-0.025em]">I was there</h2>
            <span className="text-[13px] text-fg-3">{p.badges.length} show{p.badges.length === 1 ? '' : 's'}</span>
          </div>
          {p.badges.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-white/15 p-6 text-center">
              <Sparkles size={24} className="mx-auto text-gold" />
              <div className="mt-2 text-[16px] font-semibold">Your first badge is one show away</div>
              <div className="mt-1 text-[13px] text-fg-3">Attend a show and get an “I was there” badge. More badges, earlier presales.</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {p.badges.map((b, i) => (
                <motion.div key={b.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring.gentle, delay: i * 0.05 }} className="flex flex-col items-center text-center">
                  <Medal badge={b} size={92} />
                  <div className="mt-2 w-full truncate text-[13px] font-semibold">{b.artist}</div>
                  <div className="text-[11px] text-fg-3">{b.date}</div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <div className="flex items-start gap-3 rounded-[20px] bg-ink-3 p-4 text-[13px] leading-snug text-fg-3 hairline">
          <Lock size={16} className="mt-0.5 shrink-0" />
          Your name, ID and selfie stay encrypted with Proof of Seat. Badges prove you were there without revealing who you are.
        </div>
      </div>
    </Screen>
  )
}
