'use client'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { LUXE } from '@/lib/motion'
import type { ProductImage } from '@/types/database'

interface Props {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: Props) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const reduced = useReducedMotion()

  const sorted = [...images].sort((a, b) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return a.display_order - b.display_order
  })

  const count = sorted.length
  const step = useCallback((dir: 1 | -1) => setActive((a) => (a + dir + count) % count), [count])

  useEffect(() => {
    if (!lightbox) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, step])

  if (count === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-[var(--brand-cream)] to-[var(--brand-pink)]/20 flex items-center justify-center">
        <span className="font-serif text-8xl text-[var(--brand-charcoal)]/20">G</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image — hover zoom, click for fullscreen */}
      <button
        onClick={() => setLightbox(true)}
        className="group relative aspect-square overflow-hidden bg-gray-50 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-rose)]"
        aria-label="View image fullscreen"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={reduced ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.5, ease: LUXE }}
            className="absolute inset-0"
          >
            <Image
              src={sorted[active].url}
              alt={sorted[active].alt_text ?? productName}
              fill
              className="object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
              priority={active === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        <span className="absolute bottom-4 right-4 inline-flex items-center justify-center w-9 h-9 bg-white/85 backdrop-blur-sm text-[var(--brand-charcoal)] opacity-0 group-hover:opacity-100 transition-opacity duration-400">
          <Maximize2 size={15} />
        </span>
      </button>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden bg-gray-50 transition-all duration-400 ${
                active === i
                  ? 'ring-1 ring-[var(--brand-rose)] ring-offset-2 ring-offset-[var(--brand-cream)]'
                  : 'opacity-65 hover:opacity-100'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt_text ?? `${productName} ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: LUXE }}
            className="fixed inset-0 z-[80] bg-[var(--brand-darkpink)]/97 backdrop-blur-sm flex flex-col"
            onClick={() => setLightbox(false)}
          >
            <div className="flex items-center justify-between px-6 pt-5 text-white/70">
              <p className="text-[11px] tracking-[0.3em] uppercase tabular-nums">
                {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </p>
              <button onClick={() => setLightbox(false)} aria-label="Close" className="p-2 hover:text-white transition-colors">
                <X size={26} />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 sm:px-16 pb-10 min-h-0">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: LUXE }}
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={sorted[active].url}
                  alt={sorted[active].alt_text ?? productName}
                  width={1200}
                  height={1200}
                  sizes="90vw"
                  className="max-h-[80vh] w-auto object-contain"
                  priority
                />
              </motion.div>
            </div>

            {count > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); step(-1) }}
                  aria-label="Previous image"
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center border border-white/25 text-white/70 hover:text-white hover:border-[var(--brand-gold)] transition-all duration-300"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); step(1) }}
                  aria-label="Next image"
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center border border-white/25 text-white/70 hover:text-white hover:border-[var(--brand-gold)] transition-all duration-300"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
