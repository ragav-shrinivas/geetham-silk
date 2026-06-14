'use client'
import Image from 'next/image'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { LUXE } from '@/lib/motion'
import type { Collection } from '@/types/database'

/**
 * Campaign hero for a single collection: full-bleed banner with scroll
 * parallax, graded overlays, and a display-scale masked title reveal.
 */
export default function CollectionHero({ collection, productCount }: { collection: Collection; productCount: number }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  const banner = collection.banner_url ?? collection.image_url

  return (
    <section ref={ref} className="relative h-[72svh] min-h-[420px] sm:min-h-[480px] overflow-hidden bg-[var(--brand-charcoal)]">
      <motion.div style={reduced ? undefined : { y: bgY }} className="absolute inset-0 will-change-transform">
        {banner ? (
          <Image
            src={banner}
            alt={collection.name}
            fill
            priority
            sizes="100vw"
            className="object-cover animate-kenburns"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#342a2b] via-[#5a3a41] to-[#714a50]" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />
        <div className="absolute inset-0 mix-blend-soft-light" style={{ background: 'linear-gradient(160deg, rgba(201,116,122,0.3) 0%, transparent 45%, rgba(184,152,106,0.25) 100%)' }} />
      </motion.div>

      <motion.div
        style={reduced ? undefined : { opacity: contentOpacity }}
        className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-16 sm:pb-20"
      >
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: LUXE, delay: 0.2 }}
          className="text-[11px] tracking-[0.45em] uppercase text-[var(--brand-gold)] mb-5"
        >
          The Collection · {productCount} {productCount === 1 ? 'Piece' : 'Pieces'}
        </motion.p>
        <h1 className="text-display text-white">
          <span className="line-mask">
            <motion.span
              initial={reduced ? false : { y: '112%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.15, ease: LUXE, delay: 0.3 }}
              className="block"
            >
              {collection.name}
            </motion.span>
          </span>
        </h1>
      </motion.div>
    </section>
  )
}
