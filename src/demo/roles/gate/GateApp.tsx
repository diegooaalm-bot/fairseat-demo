import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { AlertTriangle, BadgeCheck, CloudOff, FastForward, ImageOff, RefreshCcw, ScanLine, UserX, Wifi, XOctagon } from 'lucide-react'
import { QRMark, payloadFor } from '@/components/ticket/DynamicQR'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { ADDR, GATE_NAME } from '@/data/world'
import { haptic } from '@/lib/haptics'
import { int } from '@/lib/money'
import { spring } from '@/lib/motion'
import { RoleButton } from '@/demo/shell/RoleButton'
import { isAtOrAfter, useDemo, type ScanMode, type ScanResult } from '@/store/demo'
import { useUI } from '@/store/ui'
import { DemoButton } from '../fan/TicketPanel'

export function GateApp() {
  const offline = useDemo((s) => s.gate.offline)
  const setOffline = useDemo((s) => s.setOffline)
  const pending = useDemo((s) => s.gate.pendingSync)
  const entries = useDemo((s) => s.gate.entries)
  const m = useDemo((s) => s.moment)
  const scan = useDemo((s) => s.scan)
  const advanceTo = useDemo((s) => s.advanceTo)
  const ensure = useDemo((s) => s.ensure)
  const benTicket = useDemo((s) => s.tickets.find((t) => t.eventId === 'nova' && t.owner === 'ben' && t.status !== 'gone'))
  const mayaSold = useDemo((s) => s.tickets.some((t) => t.eventId === 'nova' && t.prevOwner === 'maya'))
  const toast = useUI((s) => s.showToast)
  const [flying, setFlying] = useState<ScanMode | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const doors = isAtOrAfter(m, 'doors')

  const run = (mode: ScanMode) => {
    if (flying) return
    haptic('light')
    setResult(null)
    setFlying(mode)
    setTimeout(() => {
      const r = scan(mode)
      setFlying(null)
      setResult(r)
      haptic(r.ok ? 'success' : 'error')
    }, 1150)
  }
  useEffect(() => {
    if (!result) return
    const t = setTimeout(() => setResult(null), 3200)
    return () => clearTimeout(t)
  }, [result])
  // story mode / desktop side-by-side can trigger a scan of Ben's phone
  const gateScan = useUI((s) => s.gateScan)
  useEffect(() => {
    if (gateScan && doors && benTicket) run('live')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateScan])

  const qrText =
    flying === 'notOwner'
      ? payloadFor(benTicket?.tokenId ?? 1, ADDR.maya, 3).text
      : flying === 'screenshot'
        ? payloadFor(benTicket?.tokenId ?? 1, ADDR.ben, 1).text
        : payloadFor(benTicket?.tokenId ?? 1, ADDR.ben, Math.floor(Date.now() / 5000)).text

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* simulated camera */}
      <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_35%,#1d2433_0%,#07080b_70%)]" />
      <Bokeh />
      <div className="grain absolute inset-0" />

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-20 px-4" style={{ paddingTop: 'calc(var(--sat) + 4px)' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[17px] font-semibold tracking-[-0.02em]">{GATE_NAME}</div>
            <div className="text-[12px] text-white/60">Mercedes-Benz Stadium · Bad Bunny</div>
          </div>
          <RoleButton />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-[16px] bg-black/45 px-3.5 py-2.5 backdrop-blur-xl hairline">
          <div className="flex min-w-0 items-center gap-2.5">
            {offline ? <CloudOff size={18} className="shrink-0 text-warn" /> : <Wifi size={18} className="shrink-0 text-ok" />}
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold">{offline ? 'Offline mode' : 'Online · live sync'}</div>
              <div className="truncate text-[12px] text-white/60">
                {offline ? `Validating against 20,000 tickets saved at 6:55 PM${pending ? ` · ${pending} to sync` : ''}` : 'Valid-ticket list refreshed 7:41 PM'}
              </div>
            </div>
          </div>
          <Toggle
            checked={offline}
            onChange={(v) => {
              if (!v && pending) toast(`Back online · synced ${pending} check-in${pending > 1 ? 's' : ''}`, 'ok')
              setOffline(v)
            }}
            label="Offline mode"
            tone="warn"
          />
        </div>
      </div>

      {/* viewfinder */}
      <div className="absolute left-1/2 z-10 h-[236px] w-[236px] -translate-x-1/2" style={{ top: 'calc(var(--sat) + 150px)' }}>
        <Brackets color={result ? (result.ok ? 'var(--color-ok)' : result.code === 'used' ? 'var(--color-warn)' : 'var(--color-err)') : '#fff'} />
        {!result && (
          <motion.div
            className="absolute inset-x-4 h-[2px] rounded-full bg-accent shadow-[0_0_14px_3px_rgba(62,134,255,.7)]"
            animate={{ top: ['10%', '90%', '10%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <AnimatePresence>
          {flying && (
            <motion.div
              key={flying}
              className="absolute inset-6 grid place-items-center rounded-[18px] bg-white p-2"
              initial={{ y: 420, scale: 0.7, rotate: -10, opacity: 0 }}
              animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 140, damping: 18 }}
            >
              <QRMark text={qrText} size={168} />
              {flying === 'screenshot' && <span className="absolute -top-3 rounded-full bg-black px-2 py-0.5 text-[11px] font-semibold text-white">Screenshot · 7:12 PM</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* controls */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-4" style={{ paddingBottom: 'calc(var(--sab) + 12px)' }}>
        <div className="rounded-[26px] bg-ink-2/90 p-4 backdrop-blur-xl hairline">
          {!doors ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <div className="text-[18px] font-semibold tracking-[-0.02em]">Doors open Sat, Jun 26 · 6:30 PM</div>
              <div className="text-[13px] text-fg-3">The scanner downloads the list of valid tickets before doors open.</div>
              <DemoButton icon={<FastForward size={14} />} onClick={() => advanceTo('doors')}>
                Jump to show night
              </DemoButton>
            </div>
          ) : !benTicket ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <div className="text-[18px] font-semibold tracking-[-0.02em]">Waiting for Ben</div>
              <div className="text-[13px] text-fg-3">Ben doesn’t have a ticket yet. Run the resale from Maya to Ben first.</div>
              <DemoButton onClick={() => ensure('benBought')}>Maya resells to Ben</DemoButton>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between text-[13px]">
                <span className="text-fg-3">Checked in tonight</span>
                <span className="font-semibold tabular">
                  {int(14_212 + entries)} · avg 2.4 s
                </span>
              </div>
              <Button size="lg" full icon={<ScanLine size={20} />} onClick={() => run('live')} disabled={!!flying}>
                {benTicket.status === 'used' ? 'Scan Ben’s phone again' : 'Scan Ben’s phone'}
              </Button>
              <div className="mt-3 text-[12px] font-semibold tracking-[0.04em] text-fg-3 uppercase">Try to cheat</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Cheat icon={<ImageOff size={16} />} label="Screenshot" onClick={() => run('screenshot')} />
                <Cheat icon={<UserX size={16} />} label="Maya’s old ticket" onClick={() => run('notOwner')} disabled={!mayaSold} />
              </div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>{result && <Result r={result} onClose={() => setResult(null)} />}</AnimatePresence>
    </div>
  )
}

function Cheat({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className="flex h-11 items-center justify-center gap-2 rounded-[14px] bg-err/12 text-[14px] font-semibold text-[#ff8a80] disabled:opacity-35"
    >
      {icon}
      {label}
    </motion.button>
  )
}

function Result({ r, onClose }: { r: ScanResult; onClose: () => void }) {
  const ok = r.ok
  const used = r.code === 'used'
  const bg = ok ? 'bg-[#0f5f2b]' : used ? 'bg-[#6b5300]' : 'bg-[#6e1410]'
  const Icon = ok ? BadgeCheck : used ? RefreshCcw : r.code === 'notOwner' ? UserX : r.code === 'expired' ? AlertTriangle : XOctagon
  return (
    <motion.button
      onClick={onClose}
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center px-8 text-center ${bg}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.span initial={{ scale: 0.4, rotate: ok ? -20 : 0 }} animate={{ scale: 1, rotate: 0, x: ok ? 0 : [0, -10, 10, -6, 6, 0] }} transition={ok ? spring.wall : { duration: 0.5 }}>
        <Icon size={96} strokeWidth={1.6} />
      </motion.span>
      <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mt-5 text-[40px] leading-none font-bold tracking-[-0.04em]">
        {r.title}
      </motion.div>
      <div className="mt-3 max-w-[28ch] text-[17px] text-white/85">{r.detail}</div>
      {r.offline && (
        <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 text-[13px] font-semibold">
          <CloudOff size={14} /> Validated offline · signature checked on device
        </span>
      )}
      {!r.offline && ok && <span className="mt-6 rounded-full bg-black/25 px-3 py-1.5 text-[13px] font-semibold">Owner signature ✓ · not used before ✓</span>}
    </motion.button>
  )
}

function Brackets({ color }: { color: string }) {
  const s = 'absolute h-10 w-10 border-[4px] transition-colors duration-300'
  return (
    <>
      <span className={`${s} top-0 left-0 rounded-tl-[22px] border-r-0 border-b-0`} style={{ borderColor: color }} />
      <span className={`${s} top-0 right-0 rounded-tr-[22px] border-b-0 border-l-0`} style={{ borderColor: color }} />
      <span className={`${s} bottom-0 left-0 rounded-bl-[22px] border-t-0 border-r-0`} style={{ borderColor: color }} />
      <span className={`${s} right-0 bottom-0 rounded-br-[22px] border-t-0 border-l-0`} style={{ borderColor: color }} />
    </>
  )
}

function Bokeh() {
  const dots = [
    [12, 22, 70, '#3e86ff'],
    [78, 18, 90, '#7c6bff'],
    [64, 58, 60, '#5ac8fa'],
    [22, 66, 110, '#ff5d8f'],
    [88, 74, 70, '#f2c14e'],
    [40, 40, 50, '#3e86ff'],
  ] as const
  return (
    <div className="absolute inset-0 opacity-50 blur-2xl">
      {dots.map(([x, y, r, c], i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ left: `${x}%`, top: `${y}%`, width: r, height: r, background: c, opacity: 0.35 }}
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 3 + i, repeat: Infinity }}
        />
      ))}
    </div>
  )
}
