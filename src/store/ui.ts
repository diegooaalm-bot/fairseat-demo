import { create } from 'zustand'
import type { PersonId } from '@/data/world'

/** Transient UI state (not persisted). */
interface UIState {
  roleSheet: boolean
  setRoleSheet: (v: boolean) => void
  sideGlow: boolean
  setSideGlow: (v: boolean) => void
  /** increments when the (simulated) side button is pressed */
  sidePress: number
  pressSide: () => void
  toast: { id: number; text: string; tone?: 'ok' | 'err' | 'accent' } | null
  showToast: (text: string, tone?: 'ok' | 'err' | 'accent') => void
  /** open this ticket expanded in My Tickets */
  focusTicket: string | null
  setFocusTicket: (id: string | null) => void
  /** play the atomic swap for this person */
  swap: { viewer: PersonId; id: number } | null
  playSwap: (viewer: PersonId) => void
  closeSwap: () => void
  /** bump to trigger a bot attack from outside (story mode) */
  attack: number
  triggerAttack: () => void
  gateScan: number
  triggerGateScan: () => void
}

export const useUI = create<UIState>((set) => ({
  roleSheet: false,
  setRoleSheet: (v) => set({ roleSheet: v }),
  sideGlow: false,
  setSideGlow: (v) => set({ sideGlow: v }),
  sidePress: 0,
  pressSide: () => set((s) => ({ sidePress: s.sidePress + 1 })),
  toast: null,
  showToast: (text, tone = 'accent') => {
    const id = Date.now()
    set({ toast: { id, text, tone } })
    setTimeout(() => set((s) => (s.toast?.id === id ? { toast: null } : s)), 2600)
  },
  focusTicket: null,
  setFocusTicket: (id) => set({ focusTicket: id }),
  swap: null,
  playSwap: (viewer) => set({ swap: { viewer, id: Date.now() } }),
  closeSwap: () => set({ swap: null }),
  attack: 0,
  triggerAttack: () => set((s) => ({ attack: s.attack + 1 })),
  gateScan: 0,
  triggerGateScan: () => set((s) => ({ gateScan: s.gateScan + 1 })),
}))
