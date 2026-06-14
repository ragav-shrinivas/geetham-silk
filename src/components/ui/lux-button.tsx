'use client'
import Link from 'next/link'
import { useRef, useState, type ReactNode, type MouseEvent } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant =
  | 'solid-charcoal'
  | 'solid-white'
  | 'outline-white'
  | 'outline-charcoal'
  | 'gold'
  | 'whatsapp'

interface LuxButtonProps {
  href?: string
  onClick?: () => void
  children: ReactNode
  variant?: Variant
  /** show trailing arrow with hover micro-motion */
  arrow?: boolean
  /** show leading WhatsApp icon */
  whatsappIcon?: boolean
  className?: string
  size?: 'md' | 'lg'
}

const BASE =
  'lux-btn group relative inline-flex items-center justify-center gap-3 overflow-hidden ' +
  'text-xs tracking-[0.22em] uppercase font-medium select-none ' +
  'transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-[var(--brand-rose)] focus-visible:ring-offset-2'

const SIZES = { md: 'px-9 py-4', lg: 'px-11 py-5 text-sm' }

/** [resting classes, fill bg, hover text color] per variant */
const STYLES: Record<Variant, { rest: string; fill: string; hoverText: string }> = {
  'solid-charcoal': { rest: 'bg-[var(--brand-charcoal)] text-white', fill: 'bg-[var(--brand-rose)]', hoverText: 'group-hover:text-white' },
  'solid-white':    { rest: 'bg-white text-[var(--brand-charcoal)] shadow-xl', fill: 'bg-[var(--brand-gold)]', hoverText: 'group-hover:text-white' },
  'outline-white':  { rest: 'border border-white/50 text-white backdrop-blur-sm', fill: 'bg-white', hoverText: 'group-hover:text-[var(--brand-charcoal)]' },
  'outline-charcoal': { rest: 'border border-[var(--brand-charcoal)]/40 text-[var(--brand-charcoal)]', fill: 'bg-[var(--brand-charcoal)]', hoverText: 'group-hover:text-white' },
  gold:             { rest: 'bg-[var(--brand-gold)] text-white', fill: 'bg-[var(--brand-charcoal)]', hoverText: 'group-hover:text-white' },
  whatsapp:         { rest: 'bg-[#25D366] text-white shadow-lg', fill: 'bg-[#128C7E]', hoverText: 'group-hover:text-white' },
}

/**
 * The one button. Magnetic pull toward the cursor, vertical fill sweep on
 * hover, arrow micro-motion. Renders <Link>, <a>, or <button> from props.
 */
export default function LuxButton({
  href,
  onClick,
  children,
  variant = 'solid-charcoal',
  arrow = false,
  whatsappIcon = false,
  className,
  size = 'md',
}: LuxButtonProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 180, damping: 16, mass: 0.3 })
  const y = useSpring(my, { stiffness: 180, damping: 16, mass: 0.3 })

  function onMove(e: MouseEvent) {
    if (reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.22)
    my.set((e.clientY - (r.top + r.height / 2)) * 0.3)
  }
  function onLeave() {
    setHovered(false)
    mx.set(0)
    my.set(0)
  }

  const s = STYLES[variant]
  const cls = cn(BASE, SIZES[size], s.rest, className)

  const inner = (
    <>
      {/* fill sweep */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 origin-bottom transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          s.fill,
          hovered ? 'scale-y-100' : 'scale-y-0'
        )}
      />
      <span className={cn('relative z-10 inline-flex items-center gap-3 transition-colors duration-500', s.hoverText)}>
        {whatsappIcon && <MessageCircle size={size === 'lg' ? 16 : 14} />}
        {children}
        {arrow && (
          <ArrowRight
            size={size === 'lg' ? 16 : 14}
            className="transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5"
          />
        )}
      </span>
    </>
  )

  const isExternal = href ? /^(https?:|tel:|mailto:)/.test(href) : false

  return (
    <motion.div
      ref={ref}
      style={reduced ? undefined : { x, y }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="inline-block"
    >
      {href && isExternal ? (
        <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className={cls} onClick={onClick}>
          {inner}
        </a>
      ) : href ? (
        <Link href={href} className={cls} onClick={onClick}>
          {inner}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={cls}>
          {inner}
        </button>
      )}
    </motion.div>
  )
}
