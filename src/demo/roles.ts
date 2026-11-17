import { LayoutDashboard, Music2, ScanLine, ShieldCheck, type LucideIcon } from 'lucide-react'
import type { Role } from '@/store/demo'

export interface RoleMeta {
  id: Role
  name: string
  short: string
  sub: string
  hue: number
  icon?: LucideIcon
  person?: boolean
}

export const ROLE_META: Record<Role, RoleMeta> = {
  maya: { id: 'maya', name: 'Maya', short: 'Maya', sub: 'Fan · can’t make it', hue: 330, person: true },
  ben: { id: 'ben', name: 'Ben', short: 'Ben', sub: 'Fan · looking for a seat', hue: 200, person: true },
  organizer: { id: 'organizer', name: 'Organizer', short: 'Organizer', sub: 'Peachtree Live', hue: 220, icon: LayoutDashboard },
  artist: { id: 'artist', name: 'Artist', short: 'Artist', sub: 'Nova Bloom', hue: 265, icon: Music2 },
  gate: { id: 'gate', name: 'Gate', short: 'Gate', sub: 'Scanner · Gate B', hue: 150, icon: ScanLine },
  proof: { id: 'proof', name: 'Proof', short: 'Proof', sub: 'Public audit', hue: 40, icon: ShieldCheck },
}
