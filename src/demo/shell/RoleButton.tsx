import { motion } from 'motion/react'
import { useContext } from 'react'
import { ForcedRole } from '../RoleApp'
import { RoleBadge } from '@/components/ui/RoleBadge'
import { haptic } from '@/lib/haptics'
import { useDemo } from '@/store/demo'
import { useUI } from '@/store/ui'

/** The avatar in the nav bar that opens the role switcher (mobile). */
export function RoleButton() {
  const role = useDemo((s) => s.role)
  const open = useUI((s) => s.setRoleSheet)
  const forced = useContext(ForcedRole)
  if (forced) return <span className="h-11 w-11" />
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        haptic('light')
        open(true)
      }}
      aria-label="Switch role"
      className="relative grid h-11 w-11 place-items-center"
    >
      <RoleBadge role={role} size={34} />
    </motion.button>
  )
}
