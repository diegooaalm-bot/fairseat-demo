import { ROLE_META } from '@/demo/roles'
import type { Role } from '@/store/demo'
import { Avatar } from './Avatar'

export function RoleBadge({ role, size = 32 }: { role: Role; size?: number }) {
  const m = ROLE_META[role]
  if (m.person) return <Avatar name={m.name} hue={m.hue} size={size} />
  const Icon = m.icon!
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full text-white"
      style={{ width: size, height: size, background: `linear-gradient(140deg, hsl(${m.hue} 70% 52%), hsl(${(m.hue + 30) % 360} 70% 34%))` }}
      aria-hidden="true"
    >
      <Icon size={size * 0.5} strokeWidth={2.2} />
    </span>
  )
}
