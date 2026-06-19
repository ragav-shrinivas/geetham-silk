'use client'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion, type MotionValue } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { LUXE } from '@/lib/motion'
import type { Gallery } from '@/types/database'

/**
 * Editorial lookbook: columns drift at different scroll speeds, images
 * open into a fullscreen charcoal lightbox with keyboard navigation.
 */
export default function LookbookGrid({ items }: { items: Gallery[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [active, setActive] = useState<number | null>(null)

  // column count follows the viewport so every image renders on mobile
  const [colCount, setColCount] = useState(3)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const apply = () => setColCount(mq.matches ? 3 : 2)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // each column drifts at its own pace — the classic editorial offset
  const y0 = useTransform(scrollYProgress, [0, 1], [0, -56])
  const y1 = useTransform(scrollYProgress, [0, 1], [36, -110])
  const y2 = useTransform(scrollYProgress, [0, 1], [12, -30])
  const drifts = useMemo(() => [y0, y1, y2], [y0, y1, y2])

  // distribute round-robin across the active column count
  const columns = useMemo(() => {
    const cols: { item: Gallery; index: number }[][] = Array.from({ length: colCount }, () => [])
    items.forEach((item, index) => cols[index % colCount].push({ item, index }))
    return cols
  }, [items, colCount])

  const close = useCallback(() => setActive(null), [])
  const step = useCallback(
    (dir: 1 | -1) => setActive((a) => (a === null ? a : (a + dir + items.length) % items.length)),
    [items.length]
  )

  useEffect(() => {
    if (active === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [active, close, step])

  return (
    <>
      <div ref={ref} className={`grid gap-4 lg:gap-6 items-start ${colCount === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {columns.map((col, c) => (
          <motion.div
            key={c}
            style={reduced ? undefined : { y: drifts[c] as MotionValue<number> }}
            className="flex flex-col gap-4 lg:gap-6"
          >
            {col.map(({ item, index }) => (
              <button
                key={item.id}
                onClick={() => setActive(index)}
                className="group relative overflow-hidden bg-gray-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-rose)]"
                aria-label={item.title ?? item.caption ?? `Open look ${index + 1}`}
              >
                <Image
                  src={item.image_url}
                  alt={item.title ?? item.caption ?? 'Geethams Silks lookbook'}
                  width={500}
                  height={700}
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="w-full h-auto object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
                />
                {/* caption choreography */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-charcoal)]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-x-0 bottom-0 p-5 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--brand-gold)] mb-1">
                    Look {String(index + 1).padStart(2, '0')}
                  </p>
                  {(item.title || item.caption) && (
                    <p className="font-serif text-lg text-white font-light leading-snug">{item.title ?? item.caption}</p>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active !== null && items[active] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: LUXE }}
            className="fixed inset-0 z-[80] bg-[var(--brand-darkpink)]/97 backdrop-blur-sm flex flex-col"
            onClick={close}
          >
            <div className="flex items-center justify-between px-6 pt-5 text-white/70">
              <p className="text-[11px] tracking-[0.3em] uppercase tabular-nums">
                {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </p>
              <button onClick={close} aria-label="Close" className="p-2 hover:text-white transition-colors">
                <X size={26} />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 sm:px-16 pb-10 min-h-0">
              <motion.div
                key={items[active].id}
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.55, ease: LUXE }}
                className="relative max-h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={items[active].image_url}
                  alt={items[active].title ?? items[active].caption ?? 'Geethams Silks lookbook'}
                  width={1000}
                  height={1400}
                  sizes="90vw"
                  className="max-h-[78vh] w-auto object-contain"
                  priority
                />
                {(items[active].title || items[active].caption) && (
                  <p className="mt-4 text-center font-serif text-lg sm:text-xl text-white/85 font-light italic">
                    {items[active].title ?? items[active].caption}
                  </p>
                )}
              </motion.div>
            </div>

            {items.length > 1 && (
              <>
                <LightboxArrow side="left" onClick={(e) => { e.stopPropagation(); step(-1) }} />
                <LightboxArrow side="right" onClick={(e) => { e.stopPropagation(); step(1) }} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function LightboxArrow({ side, onClick }: { side: 'left' | 'right'; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous look' : 'Next look'}
      className={`absolute top-1/2 -translate-y-1/2 ${side === 'left' ? 'left-3 sm:left-6' : 'right-3 sm:right-6'} z-10 w-11 h-11 flex items-center justify-center border border-white/25 text-white/70 hover:text-white hover:border-[var(--brand-gold)] transition-all duration-300`}
    >
      {side === 'left' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  )
}
