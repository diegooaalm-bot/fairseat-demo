import { motion } from 'motion/react'
import { Check, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { startStory } from '../presenter/story'
import { Sheet } from '@/components/ui/Sheet'
import { RoleBadge } from '@/components/ui/RoleBadge'
import { ROLE_META } from '@/demo/roles'
import { haptic } from '@/lib/haptics'
import { ROLES, useDemo } from '@/store/demo'
import { useUI } from '@/store/ui'

export function RoleSheet() {
  const open = useUI((s) => s.roleSheet)
  const setOpen = useUI((s) => s.setRoleSheet)
  const role = useDemo((s) => s.role)
  const setRole = useDemo((s) => s.setRole)
  return (
    <Sheet
      open={open}
      onClose={() => setOpen(false)}
      title={
        <div>
          <div className="text-[22px] font-bold tracking-[-0.025em]">View as</div>
          <div className="text-[14px] text-fg-3">Same event, six points of view. Everything is shared.</div>
        </div>
      }
    >
      <div className="grid grid-cols-3 gap-2.5 px-4 pb-3">
        {ROLES.map((r) => {
          const m = ROLE_META[r]
          const active = r === role
          return (
            <motion.button
              key={r}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                haptic('medium')
                setRole(r)
                setOpen(false)
              }}
              className={`relative flex flex-col items-center gap-2 rounded-[20px] px-2 pt-4 pb-3 text-center transition-colors ${
                active ? 'bg-accent/15 ring-1 ring-accent/60' : 'bg-white/[0.05] hairline'
              }`}
            >
              <RoleBadge role={r} size={44} />
              <span className="text-[15px] leading-tight font-semibold tracking-[-0.01em]">{m.name}</span>
              <span className="text-[11px] leading-tight text-fg-3">{m.sub}</span>
              {active && (
                <span className="absolute top-2 right-2 grid h-5 w-5 place-items-center rounded-full bg-accent-fill text-white">
                  <Check size={13} strokeWidth={3} />
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
      <div className="grid grid-cols-2 gap-2.5 px-4 pt-1 pb-3">
        <Button size="lg" icon={<Play size={16} fill="currentColor" />} onClick={() => (setOpen(false), startStory())}>
          Story mode
        </Button>
        <Button size="lg" variant="secondary" icon={<RotateCcw size={16} />} onClick={() => (setOpen(false), useDemo.getState().reset())}>
          Reset demo
        </Button>
      </div>
    </Sheet>
  )
}
