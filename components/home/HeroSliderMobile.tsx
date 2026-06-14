'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, MessageCircle, MapPin, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { LUXE } from '@/lib/motion'
import type { HeroSlide } from '@/types/database'

function waHref() {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hi Geethams Silks, I would like to enquire about your collection.')}`
}

/**
 * Mobile-only hero carousel.
 *
 * Why a separate component: the hero source images are all landscape (~16:9).
 * The desktop hero crops them into a full-screen portrait frame with object-cover,
 * which on a phone slices the models/composition off the sides. Here we instead
 * present each slide as a premium app-style banner card — a blurred cinematic
 * backdrop fills the frame while the *full* sharp image stays visible (no aggressive
 * crop) — and reveal a sliver of the next slide so swiping is obvious.
 *
 * Desktop (md+) never renders this; the original <section> handles those breakpoints.
 */
export default function HeroSliderMobile({ slides, duration }: { slides: HeroSlide[]; duration: number }) {
  const count = slides.length
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const reduced = useReducedMotion()

  // Pause autoplay briefly while the user is touching / dragging the track.
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

  // Derive the active slide from the scroll position (drives dots + dimming).
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

  // Autoplay — re-arms whenever the active slide settles; skips while interacting.
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

  return (
    <section className="relative md:hidden w-full bg-[var(--brand-charcoal)] overflow-hidden">
      <div
        ref={trackRef}
        onPointerDown={pause}
        onPointerUp={resume}
        onPointerCancel={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain gap-3 px-[7vw] py-4"
        style={{ scrollPaddingInline: '7vw' }}
      >
        {slides.map((slide, i) => {
          const active = i === current
          return (
            <div
              key={slide.id}
              className="snap-center shrink-0 w-[86vw] h-[72vh] min-h-[470px] max-h-[760px]"
            >
              <article
                className={`relative h-full w-full overflow-hidden rounded-[1.75rem] ring-1 ring-white/10 shadow-2xl transition-[opacity,transform] duration-700 ease-out ${
                  active ? 'opacity-100 scale-100' : 'opacity-65 scale-[0.965]'
                }`}
              >
                {/* Cinematic backdrop — blurred fill so the frame is never empty */}
                {slide.media_url && (
                  <Image
                    src={slide.media_url}
                    alt=""
                    aria-hidden
                    fill
                    sizes="90vw"
                    className="object-cover scale-125 blur-2xl opacity-50"
                  />
                )}

                {/* Sharp image — full composition preserved, anchored toward the top */}
                {slide.media_url ? (
                  <Image
                    src={slide.media_url}
                    alt={slide.title ?? 'Geethams Silks'}
                    fill
                    priority={i === 0}
                    sizes="90vw"
                    className={`object-contain object-top ${active && !reduced ? 'animate-kenburns' : ''}`}
                  />
                ) : (
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #2b2320 0%, #5e3b41 45%, #b8986a 100%)' }} />
                )}

                {/* Grading + readability gradient anchored to the lower copy zone */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-black/15" />
                <div
                  className="absolute inset-0 mix-blend-soft-light"
                  style={{ background: 'linear-gradient(160deg, rgba(201,116,122,0.22) 0%, transparent 42%, rgba(184,152,106,0.18) 100%)' }}
                />

                {/* Copy */}
                <div className="absolute inset-x-0 bottom-0 px-6 pb-12 pt-10 text-center text-white">
                  <motion.div
                    initial={false}
                    animate={active ? { opacity: 1, y: 0 } : { opacity: 0.85, y: 6 }}
                    transition={{ duration: 0.6, ease: LUXE }}
                  >
                    <div className="mb-4 flex items-center justify-center gap-3">
                      <span className="h-px w-7 bg-gradient-to-r from-transparent to-[var(--brand-gold)]" />
                      <span className="text-[10px] tracking-[0.4em] uppercase text-[var(--brand-gold)] font-medium">Geethams Silks</span>
                      <span className="h-px w-7 bg-gradient-to-l from-transparent to-[var(--brand-gold)]" />
                    </div>

                    <h1 className="font-serif font-light leading-[1.08] tracking-tight text-[clamp(1.85rem,8vw,2.6rem)]">
                      {slide.title}
                    </h1>

                    {slide.subtitle && (
                      <p className="mx-auto mt-3.5 max-w-[34ch] text-[13px] leading-relaxed tracking-wide text-white/80">
                        {slide.subtitle}
                      </p>
                    )}

                    <div className="mt-6 flex flex-col gap-2.5">
                      {slide.cta_primary_label && (
                        <Cta href={slide.cta_primary_link} label={slide.cta_primary_label} primary />
                      )}
                      {slide.cta_secondary_label && (
                        <Cta href={slide.cta_secondary_link} label={slide.cta_secondary_label} />
                      )}
                    </div>
                  </motion.div>
                </div>
              </article>
            </div>
          )
        })}
      </div>

      {/* Edge tap controls (arrow navigation alongside swipe/autoplay) */}
      {count > 1 && (
        <>
          <EdgeArrow side="left" onClick={() => { pause(); scrollToIndex(current - 1); resume() }} />
          <EdgeArrow side="right" onClick={() => { pause(); scrollToIndex(current + 1); resume() }} />
        </>
      )}

      {/* Luxury progress indicators */}
      {count > 1 && (
        <div className="pointer-events-auto absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { pause(); scrollToIndex(i); resume() }}
              aria-label={`Go to slide ${i + 1}`}
              className={`relative h-[3px] overflow-hidden rounded-full transition-all duration-500 ${
                i === current ? 'w-7 bg-white/30' : 'w-2.5 bg-white/30'
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

      {/* Compact boutique chip */}
      <a
        href={SITE.maps}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open the boutique location in Google Maps"
        className="absolute bottom-3 left-5 z-30 flex items-center gap-2 text-white/80"
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
      className={`absolute top-1/2 z-30 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white/85 backdrop-blur-sm active:scale-95 transition-transform ${
        side === 'left' ? 'left-2' : 'right-2'
      }`}
    >
      {side === 'left' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </button>
  )
}
