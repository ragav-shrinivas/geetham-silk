'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn } from 'lucide-react'
import { LUXE } from '@/lib/motion'
import type { ProductImage } from '@/types/database'

interface Props {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: Props) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 })
  const [showLens, setShowLens] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const sorted = [...images].sort((a, b) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return a.display_order - b.display_order
  })

  const count = sorted.length
  const step = useCallback((dir: 1 | -1) => {
    setIsZoomed(false)
    setActive((a) => (a + dir + count) % count)
  }, [count])

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

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setLensPos({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) })
  }

  function onSwipeTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onSwipeTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || isZoomed) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 50 || count < 2) return
    step(dx < 0 ? 1 : -1)
  }

  if (count === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-[var(--brand-cream)] to-[var(--brand-pink)]/20 flex items-center justify-center">
        <span className="font-serif text-8xl text-[var(--brand-charcoal)]/20">G</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image — desktop hover magnifier, click for fullscreen */}
      <button
        onClick={() => setLightbox(true)}
        onMouseEnter={() => setShowLens(true)}
        onMouseLeave={() => setShowLens(false)}
        onMouseMove={handleMouseMove}
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
              className="object-cover"
              priority={active === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Magnifier lens — desktop only */}
        {showLens && (
          <div
            className="hidden lg:block absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${sorted[active].url})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: '230%',
              backgroundPosition: `${lensPos.x}% ${lensPos.y}%`,
            }}
          />
        )}

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

      {/* Fullscreen zoom viewer — portaled to body so it escapes any ancestor stacking context (e.g. page-transition wrappers) and always sits above the fixed navbar */}
      {mounted && createPortal(
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: LUXE }}
            className="fixed inset-0 z-[80] bg-[var(--brand-darkpink)]/97 backdrop-blur-sm flex flex-col"
          >
            <div className="flex items-center justify-between px-6 pt-5 text-white/70 shrink-0">
              <p className="text-[11px] tracking-[0.3em] uppercase tabular-nums">
                {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </p>
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-white/50">
                  <ZoomIn size={13} /> Pinch / Double-tap to zoom
                </span>
                <button onClick={() => setLightbox(false)} aria-label="Close" className="p-2 hover:text-white transition-colors">
                  <X size={26} />
                </button>
              </div>
            </div>

            <div
              className="flex-1 min-h-0 relative"
              onTouchStart={onSwipeTouchStart}
              onTouchEnd={onSwipeTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: LUXE }}
                  className="absolute inset-0"
                >
                  <TransformWrapper
                    initialScale={1}
                    minScale={1}
                    maxScale={4}
                    doubleClick={{ mode: 'toggle', step: 2.5 }}
                    pinch={{ step: 5 }}
                    wheel={{ step: 0.2 }}
                    panning={{ disabled: false }}
                    onZoomStart={() => setIsZoomed(true)}
                    onTransform={(ref: ReactZoomPanPinchRef) => setIsZoomed(ref.state.scale > 1.02)}
                  >
                    <TransformComponent
                      wrapperClass="!w-full !h-full"
                      contentClass="!w-full !h-full !flex !items-center !justify-center"
                    >
                      <Image
                        src={sorted[active].url}
                        alt={sorted[active].alt_text ?? productName}
                        width={1400}
                        height={1400}
                        sizes="100vw"
                        className="max-h-[78vh] sm:max-h-[82vh] w-auto object-contain select-none"
                        priority
                        draggable={false}
                      />
                    </TransformComponent>
                  </TransformWrapper>
                </motion.div>
              </AnimatePresence>

              {count > 1 && (
                <>
                  <button
                    onClick={() => step(-1)}
                    aria-label="Previous image"
                    className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center border border-white/25 text-white/70 hover:text-white hover:border-[var(--brand-gold)] transition-all duration-300"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => step(1)}
                    aria-label="Next image"
                    className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center border border-white/25 text-white/70 hover:text-white hover:border-[var(--brand-gold)] transition-all duration-300"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {count > 1 && (
              <div className="flex sm:hidden items-center justify-center gap-2 pb-6 pt-2 shrink-0">
                {sorted.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === active ? 'w-5 bg-white' : 'w-1.5 bg-white/35'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  )
}
