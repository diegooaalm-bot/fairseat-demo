import { motion, type HTMLMotionProps } from 'motion/react'
import { forwardRef, type ReactNode } from 'react'
import { haptic } from '@/lib/haptics'
import { spring } from '@/lib/motion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'light' | 'gold'
type Size = 'lg' | 'md' | 'sm'

const variants: Record<Variant, string> = {
  primary: 'bg-accent-fill text-white shadow-[0_8px_24px_-10px_rgba(62,134,255,.8),inset_0_1px_0_rgba(255,255,255,.18)]',
  secondary: 'bg-white/[0.09] text-fg hairline',
  ghost: 'bg-transparent text-accent-soft',
  danger: 'bg-err/15 text-err',
  light: 'bg-white text-paper-ink',
  gold: 'bg-gold text-[#1a1306]',
}
const sizes: Record<Size, string> = {
  lg: 'h-[54px] px-6 text-[17px] rounded-[16px] font-semibold',
  md: 'h-11 px-5 text-[15px] rounded-[14px] font-semibold',
  sm: 'h-[34px] px-3.5 text-[14px] rounded-full font-semibold',
}

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  full?: boolean
  icon?: ReactNode
  trailing?: ReactNode
  children?: ReactNode
  hapticKind?: Parameters<typeof haptic>[0] | false
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', full, icon, trailing, children, className = '', hapticKind = 'light', onClick, disabled, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      whileTap={disabled ? undefined : { scale: 0.965 }}
      transition={spring.snappy}
      disabled={disabled}
      onClick={(e) => {
        if (hapticKind) haptic(hapticKind)
        onClick?.(e)
      }}
      className={`relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap tracking-[-0.01em] transition-[background-color,opacity,color] duration-200 disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon}
      {children}
      {trailing}
    </motion.button>
  )
})
