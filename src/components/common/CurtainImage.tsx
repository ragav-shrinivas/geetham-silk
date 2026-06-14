'use client'
import Image from 'next/image'
import { useRef, type ReactNode } from 'react'
import { motion, useInView, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { LUXE } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface CurtainImageProps {
  src: string
  alt: string
  className?: string
  /** image sizing hint for next/image */
  sizes?: string
  priority?: boolean
  /** direction the curtain opens from */
  from?: 'bottom' | 'left' | 'right'
  /** scroll-linked vertical drift inside the mask (px) — 0 disables */
  parallax?: number
  /** slow zoom on hover (wrap in a group) */
  hoverZoom?: boolean
  children?: ReactNode
}

const CLIP_HIDDEN = {
  bottom: 'inset(100% 0% 0% 0%)',
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
}
const CLIP_SHOWN = 'inset(0% 0% 0% 0%)'

/**
 * Editorial image reveal: clip-path curtain wipe + scale-settle from 1.15,
 * with optional scroll parallax inside the mask. Images never just "appear".
 */
export default function CurtainImage({
  src,
  alt,
  className,
  sizes = '100vw',
  priority = false,
  from = 'bottom',
  parallax = 0,
  hoverZoom = false,
  children,
}: CurtainImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, margin: '-12% 0px -12% 0px' })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const drift = useTransform(scrollYProgress, [0, 1], [parallax, -parallax])

  const showClip = reduced ? CLIP_SHOWN : inView ? CLIP_SHOWN : CLIP_HIDDEN[from]

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={{ clipPath: showClip }}
      transition={{ duration: 1.2, ease: LUXE }}
      className={cn('relative overflow-hidden', className)}
    >
      <motion.div
        initial={false}
        animate={{ scale: reduced || inView ? 1 : 1.15 }}
        transition={{ duration: 1.5, ease: LUXE }}
        style={parallax && !reduced ? { y: drift } : undefined}
        className={cn(
          'absolute',
          // overscan so parallax drift never exposes mask edges
          parallax ? '-inset-y-[12%] inset-x-0' : 'inset-0',
          hoverZoom && 'transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]'
        )}
      >
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      </motion.div>
      {children}
    </motion.div>
  )
}
