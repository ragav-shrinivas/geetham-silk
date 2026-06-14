'use client'
import Link from 'next/link'
import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import CurtainImage from '@/components/common/CurtainImage'
import LuxButton from '@/components/ui/lux-button'
import { LUXE } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { Collection } from '@/types/database'

interface CampaignRowProps {
  collection: Collection
  index: number
}

/**
 * One collection as a full-width campaign spread: parallax curtain imagery
 * beside an editorial story block with a serif index. Rows alternate sides.
 */
export default function CampaignRow({ collection, index }: CampaignRowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, margin: '-12% 0px' })
  const shown = reduced || inView
  const reversed = index % 2 === 1

  return (
    <div ref={ref} className="group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
      {/* Imagery */}
      <Link
        href={`/collections/${collection.slug}`}
        className={cn('block lg:col-span-7', reversed && 'lg:order-2')}
      >
        {collection.image_url ? (
          <CurtainImage
            src={collection.image_url}
            alt={collection.name}
            from={reversed ? 'right' : 'left'}
            parallax={45}
            hoverZoom
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="aspect-[16/11] w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-charcoal)]/30 via-transparent to-transparent pointer-events-none" />
          </CurtainImage>
        ) : (
          <div className="aspect-[16/11] w-full bg-gradient-to-br from-[#342a2b] via-[#5a3a41] to-[#714a50] flex items-center justify-center">
            <span className="font-serif text-6xl text-white/15 italic">{collection.name.charAt(0)}</span>
          </div>
        )}
      </Link>

      {/* Story block */}
      <div className={cn('lg:col-span-5', reversed && 'lg:order-1 lg:text-right')}>
        <span className="line-mask">
          <motion.span
            initial={false}
            animate={{ y: shown ? 0 : '110%' }}
            transition={{ duration: 0.9, ease: LUXE }}
            className="block font-serif text-5xl lg:text-6xl font-light text-[var(--brand-gold)]/50 tabular-nums mb-4"
          >
            {String(index + 1).padStart(2, '0')}
          </motion.span>
        </span>

        <span className="line-mask">
          <motion.h2
            initial={false}
            animate={{ y: shown ? 0 : '112%' }}
            transition={{ duration: 1, ease: LUXE, delay: 0.12 }}
            className="block font-serif text-4xl lg:text-5xl font-light text-[var(--brand-charcoal)] leading-[1.08]"
          >
            {collection.name}
          </motion.h2>
        </span>

        {collection.description && (
          <motion.p
            initial={false}
            animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 20 }}
            transition={{ duration: 0.9, ease: LUXE, delay: 0.28 }}
            className={cn('mt-5 text-sm sm:text-base text-gray-500 leading-relaxed max-w-md', reversed && 'lg:ml-auto')}
          >
            {collection.description}
          </motion.p>
        )}

        <motion.div
          initial={false}
          animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 18 }}
          transition={{ duration: 0.8, ease: LUXE, delay: 0.42 }}
          className="mt-8"
        >
          <LuxButton href={`/collections/${collection.slug}`} variant="outline-charcoal" arrow>
            Explore Collection
          </LuxButton>
        </motion.div>
      </div>
    </div>
  )
}
