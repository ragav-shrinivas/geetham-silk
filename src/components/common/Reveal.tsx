'use client'
import { motion, useInView, type Variants } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale'

const LUXE_EASE = [0.16, 1, 0.3, 1] as const

function offsetFor(direction: Direction, distance: number) {
  switch (direction) {
    case 'up': return { y: distance }
    case 'down': return { y: -distance }
    case 'left': return { x: distance }
    case 'right': return { x: -distance }
    case 'scale': return { scale: 0.92 }
    default: return {}
  }
}

interface RevealProps {
  children: ReactNode
  direction?: Direction
  delay?: number
  duration?: number
  distance?: number
  className?: string
  /** re-animate every time it enters the viewport (handles scroll up + down) */
  once?: boolean
  as?: 'div' | 'section' | 'span' | 'li'
}

/**
 * Bidirectional scroll reveal. By default `once={false}`, so the element
 * animates in every time it enters the viewport — whether you scroll DOWN
 * to it or scroll UP back to it. This is the fix for "scroll up animation
 * is missing": Framer's `viewport={{ once: true }}` locks elements visible
 * after the first pass; tying `animate` to a live `useInView` does not.
 */
export default function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.9,
  distance = 48,
  className,
  once = false,
  as = 'div',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin: '-12% 0px -12% 0px' })

  const hidden = { opacity: 0, ...offsetFor(direction, distance) }
  const shown = { opacity: 1, x: 0, y: 0, scale: 1 }

  const variants: Variants = {
    hidden,
    shown: {
      ...shown,
      transition: { duration, delay, ease: LUXE_EASE },
    },
  }

  // Cast to the div motion component so the HTMLDivElement ref type-checks;
  // at runtime motion[as] renders the requested tag.
  const MotionTag = motion[as] as typeof motion.div

  return (
    <MotionTag
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'shown' : 'hidden'}
      className={className}
    >
      {children}
    </MotionTag>
  )
}

/**
 * Stagger container — children using <RevealItem> animate in sequence,
 * also bidirectional.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.12,
  once = false,
}: {
  children: ReactNode
  className?: string
  stagger?: number
  once?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin: '-10% 0px -10% 0px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'shown' : 'hidden'}
      variants={{
        shown: { transition: { staggerChildren: stagger } },
        hidden: {},
      }}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({
  children,
  direction = 'up',
  distance = 40,
  duration = 0.8,
  className,
}: {
  children: ReactNode
  direction?: Direction
  distance?: number
  duration?: number
  className?: string
}) {
  const variants: Variants = {
    hidden: { opacity: 0, ...offsetFor(direction, distance) },
    shown: {
      opacity: 1, x: 0, y: 0, scale: 1,
      transition: { duration, ease: LUXE_EASE },
    },
  }
  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  )
}
