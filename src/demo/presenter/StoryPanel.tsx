import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, MessageSquareQuote, Play, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { RoleBadge } from '@/components/ui/RoleBadge'
import { Sheet } from '@/components/ui/Sheet'
import { haptic } from '@/lib/haptics'
import { useDemo, type Role } from '@/store/demo'
import { ROLE_META } from '../roles'
import { CHAPTERS, STEPS, exitStory, nextStep, prevStep, startStory } from './story'

/** Arrow keys (and presentation clickers: PageUp/PageDown) drive story mode. */
export function useStoryKeys() {
  const active = useDemo((s) => s.story.active)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.getAttribute('role') === 'slider')) return
      if (!active) {
        if (e.key === 's' && (e.metaKey || e.ctrlKey) === false && e.shiftKey) startStory()
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        nextStep()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        prevStep()
      } else if (e.key === 'Escape') exitStory()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])
}

function Progress({ chapter, compact = false }: { chapter: number; compact?: boolean }) {
  return (
    <div className={`flex ${compact ? 'gap-1' : 'gap-1.5'}`}>
      {CHAPTERS.map((c, i) => (
        <span
          key={c}
          className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i + 1 < chapter ? 'bg-accent/70' : i + 1 === chapter ? 'bg-accent' : 'bg-white/[0.12]'}`}
        />
      ))}
    </div>
  )
}

/* ───────────── Desktop left panel ───────────── */
export function StoryPanel({ role }: { role: Role }) {
  const story = useDemo((s) => s.story)
  if (!story.active) return <RoleIntro role={role} />
  const step = STEPS[story.chapter]
  const inChapter = STEPS.filter((s) => s.chapter === step.chapter)
  const idx = inChapter.indexOf(step)
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold tracking-[0.1em] text-accent-soft uppercase">
          Chapter {step.chapter} of 7
        </span>
        <button onClick={exitStory} className="flex items-center gap-1 text-[13px] text-fg-3 hover:text-fg" aria-label="Exit story mode">
          <X size={14} /> Exit
        </button>
      </div>
      <Progress chapter={step.chapter} />
      <AnimatePresence mode="wait">
        <motion.div
          key={story.chapter}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-4"
        >
          <div>
            <div className="text-[15px] font-semibold text-fg-3">{step.chapterTitle}</div>
            <h2 className="mt-1 text-[30px] leading-[1.05] font-bold tracking-[-0.035em]">{step.title}</h2>
            {inChapter.length > 1 && (
              <div className="mt-2 flex gap-1.5">
                {inChapter.map((s, i) => (
                  <span key={s.title} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-fg' : 'w-1.5 bg-white/25'}`} />
                ))}
              </div>
            )}
          </div>
          <div className="rounded-[20px] bg-white/[0.04] p-4 hairline">
            <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.06em] text-fg-3 uppercase">
              <MessageSquareQuote size={14} /> Say
            </div>
            <p className="text-[16px] leading-[1.55] text-fg">{step.say}</p>
          </div>
          {step.fact && <div className="self-start rounded-full bg-accent/15 px-3 py-1.5 text-[13px] font-semibold text-accent-soft">{step.fact}</div>}
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={prevStep} disabled={story.chapter === 0} icon={<ChevronLeft size={18} />} aria-label="Previous step">
          Back
        </Button>
        <Button full onClick={nextStep} disabled={story.chapter === STEPS.length - 1} trailing={<ChevronRight size={18} />}>
          {story.chapter === STEPS.length - 1 ? 'The end' : 'Next'}
        </Button>
      </div>
      <div className="text-[12px] text-fg-3">
        Step {story.chapter + 1} of {STEPS.length} · ← → or a clicker · Esc to exit
      </div>
    </div>
  )
}

const INTRO: Record<Role, string> = {
  maya: 'The fan. She verifies once, buys at face value and, if she can’t go, resells fairly. She never sees the word crypto.',
  ben: 'The buyer. He finds Maya’s seat at $110 instead of $400 elsewhere, and walks in with a code that can’t be copied.',
  organizer: 'Real demand by zone, bots blocked, every resale within the cap, and rules chosen per jurisdiction.',
  artist: '5% of every resale, paid instantly. Plus the festival model: $123,000 for FairSeat, $80,000 for the artist.',
  gate: 'A QR signed by the owner that changes every 5 seconds. Screenshots and resold tickets fail. Works offline.',
  proof: 'Every resale is public and every rule is code. Nobody, not even FairSeat, can break the rules.',
}

function RoleIntro({ role }: { role: Role }) {
  const m = ROLE_META[role]
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={role}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-5"
      >
        <div className="flex items-center gap-3">
          <RoleBadge role={role} size={44} />
          <div>
            <div className="text-[13px] font-semibold tracking-[0.08em] text-fg-3 uppercase">Viewing as</div>
            <div className="text-[24px] font-bold tracking-[-0.025em]">{m.name}</div>
          </div>
        </div>
        <p className="text-[17px] leading-relaxed text-fg-2">{INTRO[role]}</p>
        <div className="rounded-[20px] bg-white/[0.04] p-4 hairline">
          <div className="text-[15px] font-semibold">Presenting?</div>
          <div className="mt-1 text-[13px] leading-snug text-fg-3">Story mode walks the class script in 7 chapters. Use ← → or a clicker.</div>
          <Button className="mt-3" size="sm" icon={<Play size={13} fill="currentColor" />} onClick={startStory}>
            Start story mode
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ───────────── Mobile bottom bar ───────────── */
export const HUD_H = 68

export function StoryHud() {
  const story = useDemo((s) => s.story)
  const [sheet, setSheet] = useState(false)
  if (!story.active) return null
  const step = STEPS[story.chapter]
  const tap = (fn: () => void) => () => {
    haptic('medium')
    fn()
  }
  return (
    <>
      <div className="relative z-[120] border-t border-white/[0.08] bg-ink-2 px-3" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center gap-2" style={{ height: HUD_H }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={tap(prevStep)} disabled={story.chapter === 0} aria-label="Previous step" className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[16px] bg-white/[0.08] disabled:opacity-30">
            <ChevronLeft size={26} />
          </motion.button>
          <button onClick={() => setSheet(true)} className="min-w-0 flex-1 px-1 text-left" aria-label="Show presenter notes">
            <Progress chapter={step.chapter} compact />
            <div className="mt-1.5 truncate text-[12px] font-semibold text-fg-3">
              {step.chapter}/7 · {step.chapterTitle}
            </div>
            <div className="truncate text-[15px] font-semibold tracking-[-0.01em]">{step.title}</div>
          </button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={tap(nextStep)}
            disabled={story.chapter === STEPS.length - 1}
            aria-label="Next step"
            className="grid h-[52px] w-[64px] shrink-0 place-items-center rounded-[16px] bg-accent-fill text-white disabled:opacity-30"
          >
            <ChevronRight size={28} />
          </motion.button>
        </div>
      </div>
      <div className={`fixed inset-0 z-[130] ${sheet ? '' : 'pointer-events-none'}`}>
      <Sheet
        open={sheet}
        onClose={() => setSheet(false)}
        title={
          <div>
            <div className="text-[13px] font-semibold text-accent-soft">
              Chapter {step.chapter} of 7 · {step.chapterTitle}
            </div>
            <div className="text-[22px] font-bold tracking-[-0.025em]">{step.title}</div>
          </div>
        }
      >
        <div className="flex flex-col gap-4 px-5 pb-3">
          <p className="text-[17px] leading-[1.5]">{step.say}</p>
          {step.fact && <div className="self-start rounded-full bg-accent/15 px-3 py-1.5 text-[13px] font-semibold text-accent-soft">{step.fact}</div>}
          <Button variant="secondary" full onClick={() => (setSheet(false), exitStory())} icon={<X size={16} />}>
            Exit story mode
          </Button>
        </div>
      </Sheet>
      </div>
    </>
  )
}
