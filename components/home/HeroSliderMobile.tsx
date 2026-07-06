'use client'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight, MessageCircle, MapPin, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { LUXE } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { HeroSlide } from '@/types/database'

function waHref() {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hi Geethams Silks, I would like to enquire about your collection.')}`
}

/**
 * Mobile-only hero (< md) — CROSSFADE slider (no horizontal swiping).
 *
 * The previous version was a horizontal scroll-snap track that required a
 * sideways swipe to browse; per the storefront's "no side-swipe" rule that is
 * gone. Slides are now absolutely stacked and crossfade in place. Navigation is
 * via auto-advance, edge arrows and dots only — the container never scrolls
 * horizontally, so there is no swipe gesture on the hero.
 *
 * Portrait-friendly: the container is a tall panel and images use object-cover
 * so uploaded portrait creatives (4:5 / 3:4) fill it cleanly without letterbox.
 * Desktop (md+) renders the original <section> instead.
 */
export default function HeroSliderMobile({ slides, duration }: { slides: HeroSlide[]; duration: number }) {
  const count = slides.length
  const [current, setCurrent] = useState(0)
  const reduced = useReducedMotion()

  const go = useCallback((i: number) => {
    setCurrent(((i % count) + count) % count)
  }, [count])

  // Auto-advance — pauses on hidden tab, disabled for reduced-motion / single slide.
  useEffect(() => {
    if (reduced || count <= 1) return
    let timer: ReturnType<typeof setInterval> | null = null
    const start = () => { if (!timer) timer = setInterval(() => setCurrent((c) => (c + 1) % count), duration) }
    const stop = () => { if (timer) { clearInterval(timer); timer = null } }
    const onVis = () => (document.hidden ? stop() : start())
    start()
    document.addEventListener('visibilitychange', onVis)
    return () => { stop(); document.removeEventListener('visibilitychange', onVis) }
  }, [count, duration, reduced])

  const active = slides[current] ?? slides[0]

  return (
    <section className="relative md:hidden w-full h-[50vh] min-h-[360px] max-h-[560px] overflow-hidden bg-[var(--brand-darkpink)]">
      {/* ───────── Slides (stacked · crossfade · no horizontal scroll) ───────── */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== current}
          className={cn(
            'absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          {slide.media_url && (
            <Image
              src={slide.media_url}
              alt={slide.title ?? 'Geethams Silks'}
              fill
              priority={i === 0}
              sizes="100vw"
              className={`object-cover object-center ${i === current && !reduced ? 'animate-kenburns' : ''}`}
            />
          )}
        </div>
      ))}

      {/* ───────── Overlay grading (fixed, non-interactive) ───────── */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        <div
          className="absolute inset-0 mix-blend-soft-light"
          style={{ background: 'linear-gradient(160deg, rgba(122,36,64,0.22) 0%, transparent 45%, rgba(176,134,63,0.16) 100%)' }}
        />
      </div>

      {/* ───────── Content (anchored — crossfades with the active slide) ───────── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-10 pt-3">
        <div className="w-[86vw] max-w-[440px] px-2 text-center text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.55, ease: LUXE }}
            >
              <div className="mb-2 flex items-center justify-center gap-2.5">
                <span className="h-px w-5 bg-gradient-to-r from-transparent to-[var(--brand-gold-light)]" />
                <span className="text-[9px] tracking-[0.35em] uppercase text-[var(--brand-gold-light)] font-medium">Geethams Silks</span>
                <span className="h-px w-5 bg-gradient-to-l from-transparent to-[var(--brand-gold-light)]" />
              </div>

              <h1 className="font-serif font-light leading-[1.12] tracking-tight text-[clamp(1.4rem,5.8vw,1.9rem)]">
                {active.title}
              </h1>

              <div className="pointer-events-auto mt-3.5 flex flex-row gap-2 justify-center">
                {active.cta_primary_label && (
                  <Cta href={active.cta_primary_link} label={active.cta_primary_label} primary />
                )}
                {active.cta_secondary_label && (
                  <Cta href={active.cta_secondary_link} label={active.cta_secondary_label} />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ───────── Controls (arrows + dots — no swipe needed) ───────── */}
      {count > 1 && (
        <>
          <EdgeArrow side="left" onClick={() => go(current - 1)} />
          <EdgeArrow side="right" onClick={() => go(current + 1)} />
        </>
      )}

      {count > 1 && (
        <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`relative h-[3px] overflow-hidden rounded-full bg-white/30 transition-all duration-500 ${
                i === current ? 'w-7' : 'w-2.5'
              }`}
            >
              {i === current && !reduced && (
                <motion.span
                  key={`p-${current}`}
                  className="absolute inset-y-0 left-0 bg-[var(--brand-gold-light)]"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: duration / 1000, ease: 'linear' }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <a
        href={SITE.maps}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open the boutique location in Google Maps"
        className="absolute bottom-4 left-5 z-30 flex items-center gap-2 text-white/85"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 backdrop-blur-sm">
          <MapPin size={12} className="text-[var(--brand-gold-light)]" />
        </span>
        <span className="flex items-center gap-1 text-[10px] tracking-[0.18em] uppercase">
          Palavakkam
          <ArrowUpRight size={10} className="text-[var(--brand-gold-light)]" />
        </span>
      </a>
    </section>
  )
}

function Cta({ href, label, primary = false }: { href: string | null; label: string; primary?: boolean }) {
  const isWhatsApp = !href || href.trim() === '' || href === 'whatsapp'
  const target = isWhatsApp ? waHref() : href
  const external = isWhatsApp || /^https?:\/\//.test(target)

  const cls = primary
    ? 'group inline-flex items-center justify-center gap-1.5 bg-white text-[var(--brand-darkpink-deep)] text-[10px] tracking-[0.18em] uppercase px-4 py-2.5 rounded-full shadow-lg active:scale-[0.97] transition-transform font-medium'
    : 'group inline-flex items-center justify-center gap-1.5 border border-white/55 text-white text-[10px] tracking-[0.18em] uppercase px-4 py-2.5 rounded-full backdrop-blur-sm active:scale-[0.97] transition-transform'

  const inner = (
    <>
      {isWhatsApp && <MessageCircle size={12} />}
      {label}
      {!isWhatsApp && <ArrowRight size={12} className="transition-transform duration-300 group-active:translate-x-1" />}
    </>
  )

  if (external) {
    return <a href={target} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
  }
  return <Link href={target} className={cls}>{inner}</Link>
}

function EdgeArrow({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous slide' : 'Next slide'}
      className={`absolute top-1/2 z-30 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white/85 backdrop-blur-sm active:scale-95 transition-transform ${
        side === 'left' ? 'left-2' : 'right-2'
      }`}
    >
      {side === 'left' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </button>
  )
}
