'use client'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

interface ParallaxProps {
  children: ReactNode
  /** positive = moves up as you scroll down; higher = stronger */
  speed?: number
  className?: string
}

/** Smooth scroll-linked vertical parallax for any element. */
export default function Parallax({ children, speed = 60, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const yRaw = useTransform(scrollYProgress, [0, 1], [speed, -speed])
  const y = useSpring(yRaw, { stiffness: 120, damping: 30, mass: 0.4 })

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}
