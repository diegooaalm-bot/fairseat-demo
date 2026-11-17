import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { StatusBar } from './StatusBar'

export const SCREEN_W = 390
export const SCREEN_H = 844
const BEZEL = 12
export const FRAME_W = SCREEN_W + BEZEL * 2
export const FRAME_H = SCREEN_H + BEZEL * 2

/** A clean, modern iPhone frame. Content renders at real 390×844 logical px. */
export function IPhoneFrame({
  children,
  clock = '9:41',
  wifiOff = false,
  sideGlow = false,
  className = '',
  style,
  statusTone = 'light',
  onSidePress,
}: {
  children: ReactNode
  clock?: string
  wifiOff?: boolean
  sideGlow?: boolean
  className?: string
  style?: CSSProperties
  statusTone?: 'light' | 'dark'
  onSidePress?: () => void
}) {
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: FRAME_W, height: FRAME_H, ...style }}>
      {/* side buttons */}
      <span className="absolute top-[118px] -left-[3px] h-8 w-[4px] rounded-l-[2px] bg-[#2b2b31]" />
      <span className="absolute top-[176px] -left-[3px] h-[62px] w-[4px] rounded-l-[2px] bg-[#2b2b31]" />
      <span className="absolute top-[250px] -left-[3px] h-[62px] w-[4px] rounded-l-[2px] bg-[#2b2b31]" />
      <motion.button
        type="button"
        aria-label="Side button"
        onClick={onSidePress}
        className="absolute top-[210px] -right-[3px] h-[100px] w-[4px] cursor-pointer rounded-r-[2px] after:absolute after:-inset-x-3 after:inset-y-0 after:content-['']"
        animate={
          sideGlow
            ? { backgroundColor: ['#2b2b31', '#3e86ff', '#2b2b31'], boxShadow: ['0 0 0 rgba(62,134,255,0)', '0 0 18px rgba(62,134,255,.9)', '0 0 0 rgba(62,134,255,0)'] }
            : { backgroundColor: '#2b2b31', boxShadow: '0 0 0 rgba(0,0,0,0)' }
        }
        transition={sideGlow ? { duration: 1.2, repeat: Infinity } : { duration: 0.2 }}
      />
      {/* body */}
      <div
        className="absolute inset-0 rounded-[66px]"
        style={{
          background: 'linear-gradient(145deg,#3a3a42 0%,#1b1b20 40%,#26262c 100%)',
          boxShadow:
            '0 60px 120px -30px rgba(0,0,0,.9), 0 30px 60px -30px rgba(62,134,255,.18), inset 0 0 0 1.5px rgba(255,255,255,.14), inset 0 0 0 5px #0c0c0f',
        }}
      />
      {/* screen */}
      <div
        className="phone-screen absolute overflow-hidden rounded-[54px] bg-ink"
        style={{ left: BEZEL, top: BEZEL, width: SCREEN_W, height: SCREEN_H, ['--sat' as string]: '54px', ['--sab' as string]: '30px', ['--sal' as string]: '0px', ['--sar' as string]: '0px' }}
      >
        {children}
        <StatusBar clock={clock} wifiOff={wifiOff} tone={statusTone} />
        {/* dynamic island */}
        <div className="pointer-events-none absolute top-[11px] left-1/2 z-[100] h-[36px] w-[124px] -translate-x-1/2 rounded-full bg-black" />
        {/* home indicator */}
        <div className={`pointer-events-none absolute bottom-[8px] left-1/2 z-[100] h-[5px] w-[134px] -translate-x-1/2 rounded-full ${statusTone === 'dark' ? 'bg-black/80' : 'bg-white/80'}`} />
      </div>
    </div>
  )
}
