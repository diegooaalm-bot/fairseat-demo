import { AnimatePresence, motion } from 'motion/react'
import { createContext } from 'react'
import { Toast } from '@/components/ui/Toast'
import { useDemo, type Role } from '@/store/demo'
import { RoleSheet } from './shell/RoleSheet'
import { StoryScene } from './presenter/StoryScene'
import { FanApp } from './roles/fan/FanApp'
import { OrganizerApp } from './roles/organizer/OrganizerApp'
import { ArtistApp } from './roles/artist/ArtistApp'
import { GateApp } from './roles/gate/GateApp'
import { ProofApp } from './roles/proof/ProofApp'

/** true when this app is rendered as a secondary device (e.g. Ben's phone next to the gate) */
export const ForcedRole = createContext(false)

function App({ role }: { role: Role }) {
  switch (role) {
    case 'maya':
      return <FanApp person="maya" />
    case 'ben':
      return <FanApp person="ben" />
    case 'organizer':
      return <OrganizerApp />
    case 'artist':
      return <ArtistApp />
    case 'gate':
      return <GateApp />
    case 'proof':
      return <ProofApp />
  }
}

/** Renders the current role's app inside whatever screen it is given (frame or real phone). */
export function RoleApp({ role: forced }: { role?: Role }) {
  const current = useDemo((s) => s.role)
  const role = forced ?? current
  return (
    <div className="app-root absolute inset-0 overflow-hidden bg-ink">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={role}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.985, filter: 'blur(6px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.01, filter: 'blur(6px)' }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <ForcedRole.Provider value={!!forced}>
            <App role={role} />
          </ForcedRole.Provider>
        </motion.div>
      </AnimatePresence>
      {!forced && <StoryScene />}
      {!forced && <RoleSheet />}
      {!forced && <Toast />}
    </div>
  )
}
