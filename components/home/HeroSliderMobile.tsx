'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight, MessageCircle, MapPin, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { LUXE } from '@/lib/motion'
import type { HeroSlide } from '@/types/database'

function waHref() {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hi Geetham Silks, I would like to enquire about your collection.')}`
}

/**
 * Mobile-only hero carousel (< md).
 *
 * Layer separation (this is deliberate — see ISSUE 1):
 *   1. Background media  — a horizontal scroll-snap track of IMAGE-ONLY cards
 *      that slide/peek. This is the only layer that moves horizontally.
 *   2. Overlay           — a fixed gradient for text legibility (no movement).
 *   3. Content           — a fixed, centered layer (eyebrow / title / subtitle /
 *      buttons) anchored to the section, NOT inside the scroll track, so the
 *      buttons never drift with the image. It's pointer-events-none so swipes
 *      pass through to the track; only the buttons themselves are interactive.
 *
 * Source images are landscape (~16:9); each card shows the FULL image
 * (object-contain over a blurred backdrop) so nothing is cropped off the sides.
 * Desktop (md+) renders the original <section> instead.
 */
export default function HeroSliderMobile({ slides, duration }: { slides: HeroSlide[]; duration: number }) {
  const count = slides.length
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const reduced = useReducedMotion()

  const interacting = useRef(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollToIndex = useCallback((i: number, smooth = true) => {
    const track = trackRef.current
    if (!track) return
    const idx = ((i % count) + count) % count
    const child = track.children[idx] as HTMLElement | undefined
    if (!child) return
    track.scrollTo({ left: child.offsetLeft, behavior: smooth && !reduced ? 'smooth' : 'auto' })
  }, [count, reduced])

  // Derive the active slide from scroll position (drives content + dots).
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const children = Array.from(track.children) as HTMLElement[]
        const center = track.scrollLeft + track.clientWidth / 2
        let best = 0
        let bestDist = Infinity
        children.forEach((c, i) => {
          const cc = c.offsetLeft + c.clientWidth / 2
          const dist = Math.abs(cc - center)
          if (dist < bestDist) { bestDist = dist; best = i }
        })
        setCurrent(best)
      })
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => { track.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])

  // Autoplay — re-arms when the active slide settles; skips while interacting.
  useEffect(() => {
    if (count <= 1) return
    const id = setTimeout(() => {
      if (!interacting.current) scrollToIndex(current + 1)
    }, duration)
    return () => clearTimeout(id)
  }, [current, count, duration, scrollToIndex])

  const pause = () => {
    interacting.current = true
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }
  const resume = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => { interacting.current = false }, 1400)
  }

  const active = slides[current] ?? slides[0]

  return (
    <section className="relative md:hidden w-full h-[68vh] min-h-[440px] max-h-[720px] overflow-hidden bg-[var(--brand-charcoal)]">
      {/* ───────── LAYER 1 · Background media (the only thing that slides) ───────── */}
      <div
        ref={trackRef}
        onPointerDown={pause}
        onPointerUp={resume}
        onPointerCancel={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
        className="no-scrollbar absolute inset-0 z-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain gap-3 px-[7vw]"
        style={{ scrollPaddingInline: '7vw' }}
      >
        {slides.map((slide, i) => (
          <div key={slide.id} className="snap-center shrink-0 w-[86vw] h-full py-4">
            <div
              className={`relative h-full w-full overflow-hidden rounded-[1.75rem] ring-1 ring-white/10 shadow-2xl transition-opacity duration-700 ${
                i === current ? 'opacity-100' : 'opacity-60'
              }`}
            >
              {slide.media_url && (
                <>
                  {/* blurred cinematic fill so the frame is never empty */}
                  <Image
                    src={slide.media_url}
                    alt=""
                    aria-hidden
                    fill
                    sizes="90vw"
                    className="object-cover scale-125 blur-2xl opacity-50"
                  />
                  {/* full, uncropped composition */}
                  <Image
                    src={slide.media_url}
                    alt={slide.title ?? 'Geetham Silks'}
                    fill
                    priority={i === 0}
                    sizes="90vw"
                    className={`object-contain object-top ${i === current && !reduced ? 'animate-kenburns' : ''}`}
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ───────── LAYER 2 · Overlay grading (fixed, non-interactive) ───────── */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        <div
          className="absolute inset-0 mix-blend-soft-light"
          style={{ background: 'linear-gradient(160deg, rgba(201,116,122,0.20) 0%, transparent 45%, rgba(184,152,106,0.16) 100%)' }}
        />
      </div>

      {/* ───────── LAYER 3 · Content (fixed/anchored — never drifts) ───────── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-16 pt-4">
        <div className="w-[86vw] max-w-[440px] px-2 text-center text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.55, ease: LUXE }}
            >
              <div className="mb-3 flex items-center justify-center gap-3">
                <span className="h-px w-7 bg-gradient-to-r from-transparent to-[var(--brand-gold)]" />
                <span className="text-[10px] tracking-[0.4em] uppercase text-[var(--brand-gold)] font-medium">Geetham Silks</span>
                <span className="h-px w-7 bg-gradient-to-l from-transparent to-[var(--brand-gold)]" />
              </div>

              <h1 className="font-serif font-light leading-[1.08] tracking-tight text-[clamp(1.9rem,7.5vw,2.5rem)]">
                {active.title}
              </h1>

              <div className="pointer-events-auto mt-5 flex flex-col gap-2.5">
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

      {/* ───────── Controls (fixed, interactive) ───────── */}
      {count > 1 && (
        <>
          <EdgeArrow side="left" onClick={() => { pause(); scrollToIndex(current - 1); resume() }} />
          <EdgeArrow side="right" onClick={() => { pause(); scrollToIndex(current + 1); resume() }} />
        </>
      )}

      {count > 1 && (
        <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { pause(); scrollToIndex(i); resume() }}
              aria-label={`Go to slide ${i + 1}`}
              className={`relative h-[3px] overflow-hidden rounded-full bg-white/30 transition-all duration-500 ${
                i === current ? 'w-7' : 'w-2.5'
              }`}
            >
              {i === current && (
                <motion.span
                  key={`p-${current}`}
                  className="absolute inset-y-0 left-0 bg-[var(--brand-gold)]"
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
        className="absolute bottom-4 left-5 z-30 flex items-center gap-2 text-white/80"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 backdrop-blur-sm">
          <MapPin size={12} className="text-[var(--brand-gold)]" />
        </span>
        <span className="flex items-center gap-1 text-[10px] tracking-[0.18em] uppercase">
          Palavakkam
          <ArrowUpRight size={10} className="text-[var(--brand-gold)]" />
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
    ? 'group inline-flex w-full items-center justify-center gap-2.5 bg-white text-[var(--brand-charcoal)] text-[11px] tracking-[0.2em] uppercase px-7 py-3.5 rounded-full shadow-xl active:scale-[0.98] transition-transform'
    : 'group inline-flex w-full items-center justify-center gap-2.5 border border-white/45 text-white text-[11px] tracking-[0.2em] uppercase px-7 py-3.5 rounded-full backdrop-blur-sm active:scale-[0.98] transition-transform'

  const inner = (
    <>
      {isWhatsApp && <MessageCircle size={13} />}
      {label}
      {!isWhatsApp && <ArrowRight size={13} className="transition-transform duration-300 group-active:translate-x-1" />}
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
