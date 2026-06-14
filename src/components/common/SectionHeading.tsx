'use client'
import { useRef, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { LUXE } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  /** plain title text; wrap a word in *asterisks* for italic serif accent */
  title: string
  copy?: string
  /** oversized low-opacity serif word behind the heading */
  backdropWord?: string
  variant?: 'centered' | 'split'
  /** right-aligned slot in split variant (e.g. "View All" link) */
  aside?: ReactNode
  dark?: boolean
  className?: string
}

/** Render *accented* words as italic — "Signature *Collections*" */
function renderAccents(title: string) {
  const parts = title.split(/\*([^*]+)\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className="italic font-normal text-[var(--brand-rose)]">{part}</em>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

/**
 * The three section-heading treatments rotated across the site so the
 * "eyebrow + serif + hairline" template rhythm never repeats verbatim.
 * Lines reveal through overflow masks, staggered.
 */
export default function SectionHeading({
  eyebrow,
  title,
  copy,
  backdropWord,
  variant = 'centered',
  aside,
  dark = false,
  className,
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, margin: '-10% 0px -10% 0px' })
  const shown = reduced || inView

  const titleColor = dark ? 'text-white' : 'text-[var(--brand-charcoal)]'
  const copyColor = dark ? 'text-white/60' : 'text-gray-500'

  const rise = (delay: number) => ({
    initial: false as const,
    animate: { y: shown ? 0 : '110%' },
    transition: { duration: 1, ease: LUXE, delay },
  })
  const fade = (delay: number) => ({
    initial: false as const,
    animate: { opacity: shown ? 1 : 0, y: shown ? 0 : 18 },
    transition: { duration: 0.9, ease: LUXE, delay },
  })

  if (variant === 'split') {
    return (
      <div ref={ref} className={cn('relative flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-14', className)}>
        {backdropWord && (
          <span aria-hidden className={cn('backdrop-word -top-10 text-left', dark && 'backdrop-word--light')}>{backdropWord}</span>
        )}
        <div className="relative">
          {eyebrow && (
            <span className="line-mask">
              <motion.span {...rise(0)} className={cn('block text-xs tracking-[0.35em] uppercase mb-3', dark ? 'text-[var(--brand-pink)]' : 'text-[var(--brand-rose)]')}>
                {eyebrow}
              </motion.span>
            </span>
          )}
          <span className="line-mask">
            <motion.h2 {...rise(0.12)} className={cn('block font-serif text-4xl lg:text-6xl font-light leading-[1.05]', titleColor)}>
              {renderAccents(title)}
            </motion.h2>
          </span>
          {copy && (
            <motion.p {...fade(0.3)} className={cn('mt-4 text-sm sm:text-base leading-relaxed max-w-xl', copyColor)}>
              {copy}
            </motion.p>
          )}
        </div>
        {aside && <motion.div {...fade(0.35)} className="shrink-0">{aside}</motion.div>}
      </div>
    )
  }

  return (
    <div ref={ref} className={cn('relative text-center max-w-2xl mx-auto mb-14 lg:mb-16', className)}>
      {backdropWord && (
        <span aria-hidden className={cn('backdrop-word -top-12', dark && 'backdrop-word--light')}>{backdropWord}</span>
      )}
      {eyebrow && (
        <span className="line-mask">
          <motion.span {...rise(0)} className={cn('block text-xs tracking-[0.35em] uppercase mb-4', dark ? 'text-[var(--brand-pink)]' : 'text-[var(--brand-rose)]')}>
            {eyebrow}
          </motion.span>
        </span>
      )}
      <span className="line-mask">
        <motion.h2 {...rise(0.12)} className={cn('block font-serif text-4xl lg:text-6xl font-light leading-[1.08]', titleColor)}>
          {renderAccents(title)}
        </motion.h2>
      </span>
      <motion.div
        initial={false}
        animate={{ scaleX: shown ? 1 : 0 }}
        transition={{ duration: 1.1, ease: LUXE, delay: 0.35 }}
        className="hairline w-24 mx-auto my-6 origin-center"
      />
      {copy && (
        <motion.p {...fade(0.4)} className={cn('text-sm sm:text-base leading-relaxed', copyColor)}>
          {copy}
        </motion.p>
      )}
    </div>
  )
}
