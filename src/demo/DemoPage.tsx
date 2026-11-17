import { motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Play, RotateCcw, ScanLine } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { IPhoneFrame, FRAME_H, FRAME_W } from '@/components/device/IPhoneFrame'
import { Button } from '@/components/ui/Button'
import { RoleBadge } from '@/components/ui/RoleBadge'
import { Segmented } from '@/components/ui/Segmented'
import { moment } from '@/data/world'
import { useIsDesktop } from '@/hooks/useMedia'
import { ROLES, useDemo, type Role } from '@/store/demo'
import { useUI } from '@/store/ui'
import { ROLE_META } from './roles'
import { RoleApp } from './RoleApp'
import { LedgerFeed } from './presenter/LedgerFeed'
import { StoryHud, StoryPanel, useStoryKeys } from './presenter/StoryPanel'
import { exitStory, startStory } from './presenter/story'

export default function DemoPage() {
  const desktop = useIsDesktop()
  useStoryKeys()
  useEffect(() => {
    document.title = 'FairSeat · Live demo'
  }, [])
  return desktop ? <DesktopShell /> : <MobileShell />
}

/* ───────────── Mobile: the app IS the screen ───────────── */
function MobileShell() {
  const story = useDemo((s) => s.story.active)
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-ink" style={{ height: '100dvh' }}>
      <div className="relative min-h-0 flex-1" style={story ? ({ ['--sab' as string]: '0px' } as React.CSSProperties) : undefined}>
        <RoleApp />
      </div>
      <StoryHud />
    </div>
  )
}

/* ───────────── Desktop: phone in the middle, narrative + controls around ───────────── */
function DesktopShell() {
  const role = useDemo((s) => s.role)
  const setRole = useDemo((s) => s.setRole)
  const reset = useDemo((s) => s.reset)
  const m = useDemo((s) => s.moment)
  const offline = useDemo((s) => s.gate.offline)
  const sideGlow = useUI((s) => s.sideGlow)
  const pressSide = useUI((s) => s.pressSide)
  const storyActive = useDemo((s) => s.story.active)

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-ink">
      <StageLight />
      <header className="relative z-10 flex h-16 shrink-0 items-center justify-between gap-6 px-6">
        <Link to="/" className="shrink-0" aria-label="FairSeat home">
          <Logo size={20} />
        </Link>
        <Segmented<Role>
          className="w-full max-w-[640px]"
          size="lg"
          value={role}
          onChange={setRole}
          options={ROLES.map((r) => ({ value: r, label: ROLE_META[r].short, icon: <RoleBadge role={r} size={20} /> }))}
        />
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="secondary" icon={<RotateCcw size={15} />} onClick={reset}>
            Reset
          </Button>
          <Button size="sm" variant={storyActive ? 'secondary' : 'primary'} icon={<Play size={14} fill="currentColor" />} onClick={storyActive ? exitStory : startStory}>
            {storyActive ? 'Exit story' : 'Story mode'}
          </Button>
        </div>
      </header>

      <main
        className={`relative z-10 grid min-h-0 flex-1 gap-6 px-6 pb-6 ${
          role === 'gate' ? 'grid-cols-[minmax(220px,280px)_1fr_minmax(220px,280px)]' : 'grid-cols-[minmax(260px,340px)_1fr_minmax(260px,340px)]'
        }`}
      >
        <aside className="no-scrollbar flex min-h-0 flex-col justify-center overflow-y-auto py-2">
          <StoryPanel role={role} />
        </aside>
        {role === 'gate' ? (
          <GateDuo clock={moment(m).clock} offline={offline} />
        ) : (
          <PhoneStage>
            <IPhoneFrame clock={moment(m).clock} wifiOff={false} sideGlow={sideGlow} onSidePress={pressSide}>
              <RoleApp />
            </IPhoneFrame>
          </PhoneStage>
        )}
        <aside className="flex min-h-0 flex-col justify-center">
          <LedgerFeed />
        </aside>
      </main>
    </div>
  )
}

/** Gate on desktop: Ben's phone and the scanner side by side, one click to scan. */
function GateDuo({ clock, offline }: { clock: string; offline: boolean }) {
  const benTicket = useDemo((s) => s.tickets.find((t) => t.eventId === 'nova' && t.owner === 'ben' && t.status !== 'gone'))
  const setStack = useDemo((s) => s.setStack)
  const setFocus = useUI((s) => s.setFocusTicket)
  const scan = useUI((s) => s.triggerGateScan)
  useEffect(() => {
    if (!benTicket) return
    setStack('ben', 'tickets', [])
    setFocus(benTicket.id)
  }, [benTicket?.id, setStack, setFocus]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="grid min-h-0 min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div className="flex h-full min-h-0 flex-col">
        <div className="pb-2 text-center text-[13px] font-semibold text-fg-3">Ben’s phone</div>
        <div className="min-h-0 flex-1">
          <PhoneStage>
            <IPhoneFrame clock={clock}>
              <RoleApp role="ben" />
            </IPhoneFrame>
          </PhoneStage>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          onClick={scan}
          disabled={!benTicket}
          className="grid h-16 w-16 place-items-center rounded-full bg-accent-fill text-white shadow-[0_10px_30px_-8px_rgba(62,134,255,.9)] disabled:opacity-40"
          aria-label="Scan Ben's ticket"
        >
          <ScanLine size={28} />
        </motion.button>
        <span className="text-[13px] font-semibold text-fg-2">Scan</span>
      </div>
      <div className="flex h-full min-h-0 flex-col">
        <div className="pb-2 text-center text-[13px] font-semibold text-fg-3">Gate scanner</div>
        <div className="min-h-0 flex-1">
          <PhoneStage>
            <IPhoneFrame clock={clock} wifiOff={offline}>
              <RoleApp />
            </IPhoneFrame>
          </PhoneStage>
        </div>
      </div>
    </div>
  )
}

/** Scales the 414×868 frame to fit the available box. */
export function PhoneStage({ children, maxScale = 1 }: { children: ReactNode; maxScale?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.8)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const s = Math.min(maxScale, (el.clientHeight - 8) / FRAME_H, (el.clientWidth - 8) / FRAME_W)
      setScale(Math.max(0.4, s))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [maxScale])
  return (
    <div ref={ref} className="relative grid h-full min-h-0 w-full min-w-0 place-items-center">
      <div style={{ width: FRAME_W * scale, height: FRAME_H * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: FRAME_W, height: FRAME_H }}>{children}</div>
      </div>
    </div>
  )
}

function StageLight() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute -top-[30%] left-1/2 h-[90%] w-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(62,134,255,.22),transparent)]" />
      <div className="absolute -top-[20%] left-[15%] h-[60%] w-[40%] rounded-full bg-[radial-gradient(closest-side,rgba(124,107,255,.12),transparent)]" />
      <div className="absolute -top-[20%] right-[10%] h-[60%] w-[40%] rounded-full bg-[radial-gradient(closest-side,rgba(90,200,250,.10),transparent)]" />
    </div>
  )
}
