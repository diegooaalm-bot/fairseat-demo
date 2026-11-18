import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { BadgeCheck, ChevronLeft, CreditCard, Lock, Mail, ScanFace } from 'lucide-react'
import { AppIcon } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { FaceID } from '@/components/ui/FaceID'
import { haptic } from '@/lib/haptics'
import { spring } from '@/lib/motion'
import { useDemo } from '@/store/demo'
import { RoleButton } from '@/demo/shell/RoleButton'

type Step = 'welcome' | 'email' | 'passkey' | 'intro' | 'doc' | 'selfie' | 'verified'

const fade = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
}

export function Onboarding() {
  const [step, setStep] = useState<Step>('welcome')
  const complete = useDemo((s) => s.completeOnboarding)
  const back: Partial<Record<Step, Step>> = { email: 'welcome', intro: 'welcome' }
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      <Glow step={step} />
      {back[step] && (
        <button
          onClick={() => setStep(back[step]!)}
          className="absolute left-2 z-20 flex h-11 items-center pr-3 text-[17px] text-accent-soft"
          style={{ top: 'var(--sat)' }}
        >
          <ChevronLeft size={28} strokeWidth={2.4} /> Back
        </button>
      )}
      <div className="absolute right-2 z-20" style={{ top: 'var(--sat)' }}>
        <RoleButton />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} {...fade} className="absolute inset-0 flex flex-col px-6" style={{ paddingTop: 'calc(var(--sat) + 44px)', paddingBottom: 'calc(var(--sab) + 16px)' }}>
          {step === 'welcome' && <Welcome onPasskey={() => setStep('passkey')} onEmail={() => setStep('email')} />}
          {step === 'email' && <Email onNext={() => setStep('passkey')} />}
          {step === 'passkey' && <Passkey onDone={() => setStep('intro')} />}
          {step === 'intro' && <Intro onStart={() => setStep('doc')} />}
          {step === 'doc' && <DocScan onDone={() => setStep('selfie')} />}
          {step === 'selfie' && <Selfie onDone={() => setStep('verified')} />}
          {step === 'verified' && <Verified onDone={() => complete('maya')} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Glow({ step }: { step: Step }) {
  const ok = step === 'verified'
  return (
    <motion.div
      className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full"
      animate={{ background: ok ? 'radial-gradient(closest-side, rgba(48,209,88,.28), transparent)' : 'radial-gradient(closest-side, rgba(62,134,255,.32), transparent)' }}
      transition={{ duration: 0.8 }}
    />
  )
}

/* ───────── Welcome ───────── */
function Welcome({ onPasskey, onEmail }: { onPasskey: () => void; onEmail: () => void }) {
  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0, rotate: -8 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ ...spring.gentle, delay: 0.05 }}>
          <AppIcon size={92} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 text-[40px] leading-[1.02] font-bold tracking-[-0.04em]"
        >
          The ticket that
          <br />
          <span className="text-gradient-accent">knows the rules.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 max-w-[30ch] text-[17px] leading-snug text-fg-2">
          Fair tickets for real fans. Resale that can never be a rip-off.
        </motion.p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ...spring.gentle }} className="flex flex-col gap-3">
        <Button size="lg" full onClick={onPasskey} icon={<ScanFace size={20} />}>
          Continue with Passkey
        </Button>
        <Button size="lg" full variant="secondary" onClick={onEmail} icon={<Mail size={19} />}>
          Continue with email
        </Button>
        <p className="pt-1 text-center text-[13px] text-fg-3">No passwords. If you can use a card, you can use Proof of Seat.</p>
      </motion.div>
    </>
  )
}

function Email({ onNext }: { onNext: () => void }) {
  return (
    <>
      <div className="flex flex-1 flex-col pt-6">
        <h1 className="text-[32px] leading-tight font-bold tracking-[-0.03em]">What’s your email?</h1>
        <p className="mt-2 text-[16px] text-fg-2">We’ll use it for receipts and to recover your account.</p>
        <label className="mt-8 flex h-14 items-center gap-3 rounded-[16px] bg-ink-3 px-4 hairline">
          <Mail size={19} className="text-fg-3" />
          <input readOnly value="maya@fanmail.com" className="w-full bg-transparent text-[17px] outline-none" aria-label="Email" />
        </label>
      </div>
      <Button size="lg" full onClick={onNext}>
        Continue
      </Button>
    </>
  )
}

/* ───────── Passkey / Face ID ───────── */
function Passkey({ onDone }: { onDone: () => void }) {
  const [state, setState] = useState<'scan' | 'success'>('scan')
  useEffect(() => {
    const a = setTimeout(() => {
      setState('success')
      haptic('success')
    }, 1500)
    const b = setTimeout(onDone, 2500)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [onDone])
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <motion.div
        className="grid h-[164px] w-[164px] place-items-center rounded-[40px] bg-ink-3/80 hairline"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring.snappy}
      >
        <FaceID state={state} size={92} />
      </motion.div>
      <div className="mt-7 text-[22px] font-semibold tracking-[-0.02em]">{state === 'scan' ? 'Face ID' : 'Passkey created'}</div>
      <div className="mt-1 text-[15px] text-fg-3">{state === 'scan' ? 'Creating a passkey for Proof of Seat' : 'Signed in as Maya'}</div>
    </div>
  )
}

/* ───────── Verify once: intro ───────── */
function Intro({ onStart }: { onStart: () => void }) {
  return (
    <>
      <div className="flex flex-1 flex-col pt-4">
        <div className="text-[13px] font-semibold tracking-[0.1em] text-accent-soft uppercase">One person, one account</div>
        <h1 className="mt-2 text-[40px] leading-[1.02] font-bold tracking-[-0.04em]">Verify once.</h1>
        <p className="mt-3 text-[17px] leading-snug text-fg-2">About 30 seconds, like opening a bank account. Then it works for every show, forever.</p>
        <div className="mt-8 flex flex-col gap-3">
          {[
            { icon: CreditCard, t: 'Scan your ID', s: 'Driver’s license or passport' },
            { icon: ScanFace, t: 'Take a quick selfie', s: 'Proves you’re a real person, live' },
          ].map((it, i) => (
            <motion.div
              key={it.t}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, ...spring.gentle }}
              className="flex items-center gap-4 rounded-[20px] bg-ink-3 p-4 hairline"
            >
              <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-accent/15 text-accent-soft">
                <it.icon size={24} />
              </span>
              <span>
                <span className="block text-[17px] font-semibold tracking-[-0.01em]">{it.t}</span>
                <span className="block text-[14px] text-fg-3">{it.s}</span>
              </span>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 flex items-start gap-3 px-1 text-[13px] leading-snug text-fg-3">
          <Lock size={15} className="mt-0.5 shrink-0" />
          Your documents are encrypted and never shown to sellers, buyers or venues. Bots can’t pass this step, and one person can’t open a hundred accounts.
        </div>
      </div>
      <Button size="lg" full onClick={onStart}>
        Start
      </Button>
    </>
  )
}

/* ───────── Document scan ───────── */
function DocScan({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0)
  useEffect(() => {
    const t = [setTimeout(() => setPhase(1), 500), setTimeout(() => setPhase(2), 2100), setTimeout(() => (setPhase(3), haptic('success')), 2900), setTimeout(onDone, 3900)]
    return () => t.forEach(clearTimeout)
  }, [onDone])
  const fields = [
    ['Name', 'Maya R.'],
    ['Date of birth', 'Verified · 21+'],
    ['Document', 'Valid · not expired'],
  ]
  return (
    <div className="flex flex-1 flex-col items-center pt-4">
      <div className="text-[22px] font-semibold tracking-[-0.02em]">Scan your ID</div>
      <div className="mt-1 text-[15px] text-fg-3">{phase < 3 ? 'Hold steady inside the frame' : 'ID verified'}</div>
      <div className="relative mt-8 grid aspect-[1.586] w-full place-items-center overflow-hidden rounded-[22px] bg-[radial-gradient(120%_100%_at_50%_0%,#1c2333,#0b0d12)]">
        <Corners ok={phase === 3} />
        <motion.div
          initial={{ y: 40, opacity: 0, rotate: -6, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          transition={{ ...spring.gentle, delay: 0.1 }}
          className="relative aspect-[1.586] w-[78%] overflow-hidden rounded-[14px] bg-[linear-gradient(135deg,#e9eef8,#cbd5e6)] p-3 text-paper-ink shadow-[0_20px_40px_rgba(0,0,0,.5)]"
        >
          <div className="flex h-full gap-3">
            <div className="grid aspect-[3/4] h-full place-items-center rounded-[8px] bg-[linear-gradient(160deg,#9db4dc,#6f86b8)]">
              <ScanFace size={30} className="text-white/80" />
            </div>
            <div className="flex flex-1 flex-col gap-1.5 pt-1">
              <div className="h-2 w-2/3 rounded bg-black/25" />
              <div className="h-2 w-1/2 rounded bg-black/15" />
              <div className="mt-2 h-2 w-3/4 rounded bg-black/15" />
              <div className="h-2 w-2/5 rounded bg-black/15" />
              <div className="mt-auto h-3 w-full rounded bg-[repeating-linear-gradient(90deg,rgba(0,0,0,.35)_0_2px,transparent_2px_4px)]" />
            </div>
          </div>
          {phase >= 1 && phase < 3 && (
            <motion.div
              className="absolute inset-x-0 h-12 bg-[linear-gradient(180deg,transparent,rgba(62,134,255,.45),transparent)]"
              initial={{ top: '-20%' }}
              animate={{ top: ['-20%', '100%', '-20%'] }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
            />
          )}
        </motion.div>
      </div>
      <div className="mt-6 flex w-full flex-col gap-2">
        {fields.map(([k, v], i) => (
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 8 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ delay: i * 0.12, ...spring.snappy }}
            className="flex items-center justify-between rounded-[14px] bg-ink-3 px-4 py-3 hairline"
          >
            <span className="text-[15px] text-fg-3">{k}</span>
            <span className="flex items-center gap-2 text-[15px] font-semibold">
              {v}
              <BadgeCheck size={17} className="text-ok" />
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function Corners({ ok }: { ok: boolean }) {
  const c = ok ? 'var(--color-ok)' : 'rgba(255,255,255,.8)'
  const s = 'absolute h-7 w-7 border-[3px] transition-colors duration-300'
  return (
    <>
      <span className={`${s} top-3 left-3 rounded-tl-[12px] border-r-0 border-b-0`} style={{ borderColor: c }} />
      <span className={`${s} top-3 right-3 rounded-tr-[12px] border-b-0 border-l-0`} style={{ borderColor: c }} />
      <span className={`${s} bottom-3 left-3 rounded-bl-[12px] border-t-0 border-r-0`} style={{ borderColor: c }} />
      <span className={`${s} right-3 bottom-3 rounded-br-[12px] border-t-0 border-l-0`} style={{ borderColor: c }} />
    </>
  )
}

/* ───────── Selfie with liveness ───────── */
const TICKS = 64
function Selfie({ onDone }: { onDone: () => void }) {
  const [lit, setLit] = useState(0)
  const done = lit >= TICKS
  useEffect(() => {
    if (done) {
      haptic('success')
      const t = setTimeout(onDone, 1100)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setLit((l) => Math.min(TICKS, l + 2)), lit === 0 ? 500 : 38)
    return () => clearTimeout(t)
  }, [lit, done, onDone])
  const angle = (lit / TICKS) * 360
  const hint = done ? 'Liveness confirmed' : lit < 20 ? 'Look straight at the camera' : lit < 44 ? 'Move your head slowly in a circle' : 'Almost there'
  return (
    <div className="flex flex-1 flex-col items-center pt-4">
      <div className="text-[22px] font-semibold tracking-[-0.02em]">Quick selfie</div>
      <div className="mt-1 h-5 text-[15px] text-fg-3">{hint}</div>
      <div className="relative mt-10 grid h-[260px] w-[260px] place-items-center">
        <svg width={260} height={260} className="absolute inset-0" aria-hidden="true">
          {Array.from({ length: TICKS }, (_, i) => {
            const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2
            const on = i < lit
            return (
              <line
                key={i}
                x1={130 + Math.cos(a) * 112}
                y1={130 + Math.sin(a) * 112}
                x2={130 + Math.cos(a) * (on ? 126 : 120)}
                y2={130 + Math.sin(a) * (on ? 126 : 120)}
                stroke={on ? (done ? 'var(--color-ok)' : 'var(--color-accent)') : 'rgba(255,255,255,.18)'}
                strokeWidth={3}
                strokeLinecap="round"
                style={{ transition: 'all .2s' }}
              />
            )
          })}
        </svg>
        <motion.div
          className="relative grid h-[200px] w-[200px] place-items-center overflow-hidden rounded-full bg-[radial-gradient(80%_80%_at_50%_30%,#2a3550,#0d1018)]"
          animate={done ? { scale: [1, 0.96, 1] } : { rotate: 0 }}
        >
          <motion.div animate={done ? {} : { x: [0, 8, 0, -8, 0], y: [0, -4, 6, -4, 0] }} transition={{ duration: 2.2, repeat: done ? 0 : Infinity, ease: 'easeInOut' }}>
            <ScanFace size={96} strokeWidth={1.2} className={done ? 'text-ok' : 'text-white/70'} />
          </motion.div>
          {!done && (
            <motion.div
              className="absolute inset-0"
              style={{ background: `conic-gradient(from 0deg, rgba(62,134,255,.25) 0deg, transparent ${angle}deg)` }}
            />
          )}
        </motion.div>
      </div>
      <div className="mt-10 flex items-center gap-2 text-[13px] text-fg-3">
        <Lock size={14} /> Checked on your phone and encrypted. Never public.
      </div>
    </div>
  )
}

/* ───────── Verified ───────── */
function Verified({ onDone }: { onDone: () => void }) {
  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="relative grid h-[180px] w-[180px] place-items-center">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border-2 border-ok/50"
              initial={{ scale: 0.6, opacity: 0.9 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.6, delay: 0.2 + i * 0.35, repeat: Infinity, repeatDelay: 0.6, ease: 'easeOut' }}
            />
          ))}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            className="grid h-[132px] w-[132px] place-items-center rounded-full bg-[radial-gradient(70%_70%_at_35%_25%,#5fe38a,#1f9e48)] shadow-[0_20px_60px_-10px_rgba(48,209,88,.6),inset_0_2px_0_rgba(255,255,255,.35)]"
          >
            <BadgeCheck size={70} strokeWidth={1.8} className="text-white" />
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, ...spring.gentle }}>
          <div className="mt-8 text-[13px] font-semibold tracking-[0.1em] text-ok uppercase">Verified fan</div>
          <h1 className="mt-2 text-[34px] leading-tight font-bold tracking-[-0.035em]">You’re in, Maya.</h1>
          <p className="mx-auto mt-2 max-w-[30ch] text-[16px] text-fg-2">Verified once, for every show. Now you compete with people, not bots.</p>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <Button size="lg" full onClick={onDone}>
          Start exploring
        </Button>
      </motion.div>
    </>
  )
}
