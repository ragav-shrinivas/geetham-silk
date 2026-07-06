'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  motion, AnimatePresence, useScroll, useTransform,
  useMotionValue, useSpring, useReducedMotion,
} from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight, ArrowUpRight, MessageCircle, MapPin } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { LUXE } from '@/lib/motion'
import type { HeroSlide } from '@/types/database'
import HeroSliderMobile from './HeroSliderMobile'

// Luxury pacing — campaigns breathe. Admin-controllable via the page builder.
const DEFAULT_DURATION = 7000

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #2b2320 0%, #5e3b41 45%, #b8986a 100%)',
  'linear-gradient(135deg, #241f1d 0%, #7a4a52 50%, #c9747a 100%)',
  'linear-gradient(140deg, #2c2c2c 0%, #4a3a3f 42%, #b8986a 100%)',
]

// Exact hero image sequence (also seeded in the hero_slides CMS table).
const HERO_IMAGES = [
  '/startheroimage.jpeg',
  '/heroimage1.jpeg',
  '/secondheroimage.jpeg',
  '/heroimage2.jpeg',
  '/heroimage3.jpeg',
  '/heroimage4.jpeg',
  '/heroimage5.jpeg',
]

const DEFAULT_SLIDES: HeroSlide[] = HERO_IMAGES.map((src, i) => ({
  id: `hero-${i}`,
  title: 'Elegance Woven Into Every Thread',
  subtitle: 'Discover timeless silk collections crafted for weddings, celebrations, and every cherished occasion.',
  media_type: 'image', media_url: src, poster_url: null,
  cta_primary_label: 'Explore Collections', cta_primary_link: '/collections',
  cta_secondary_label: 'Enquire on WhatsApp', cta_secondary_link: '',
  overlay_opacity: 0.45, is_active: true, display_order: i, focal_x: 50, focal_y: 50, created_at: '', updated_at: '',
}))

function waHref() {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hi Geethams Silks, I would like to enquire about your collection.')}`
}

export default function HeroSlider({ slides, durationMs }: { slides: HeroSlide[]; durationMs?: number }) {
  const data = slides.length > 0 ? slides : DEFAULT_SLIDES
  const count = data.length
  const duration = durationMs && durationMs >= 2000 ? durationMs : DEFAULT_DURATION

  const [current, setCurrent] = useState(0)
  const [lowData, setLowData] = useState(false)
  const reduced = useReducedMotion()

  const sectionRef = useRef<HTMLElement>(null)

  // Detect low-data / slow connection → prefer poster image over video
  useEffect(() => {
    const c = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    const slow = !!c && (Boolean(c.saveData) || /(^|-)(2g|slow-2g)$/.test(c.effectiveType ?? ''))
    // one-time client capability check
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (slow) setLowData(true)
  }, [])

  const go = useCallback((i: number) => setCurrent((i + count) % count), [count])

  // Autoplay — always running (continues after manual navigation)
  useEffect(() => {
    if (count <= 1) return
    const id = setTimeout(() => go(current + 1), duration)
    return () => clearTimeout(id)
  }, [current, count, go, duration])

  // Scroll parallax — background drifts slower than the foreground content
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  // Mouse drift — the campaign image leans gently toward the cursor
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const driftX = useSpring(mx, { stiffness: 40, damping: 20, mass: 0.8 })
  const driftY = useSpring(my, { stiffness: 40, damping: 20, mass: 0.8 })

  function onMouseMove(e: React.MouseEvent) {
    if (reduced) return
    const r = sectionRef.current?.getBoundingClientRect()
    if (!r) return
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 14)
    my.set(((e.clientY - r.top) / r.height - 0.5) * 10)
  }

  const slide = data[current]

  return (
    <>
      {/* Mobile (< md): premium peek carousel — preserves the landscape composition. */}
      <HeroSliderMobile slides={data} duration={duration} />

      {/* Desktop (md+): original cinematic full-bleed hero — unchanged. */}
      <section
        ref={sectionRef}
        onMouseMove={onMouseMove}
        className="relative hidden md:block h-[100svh] min-h-[560px] sm:min-h-[640px] w-full overflow-hidden bg-[var(--brand-darkpink)]"
      >
      {/* Background layer (scroll parallax + mouse drift) */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 will-change-transform">
        <motion.div style={{ x: driftX, y: driftY, scale: 1.03 }} className="absolute inset-0">
          <AnimatePresence>
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.12 }}
              transition={{ duration: 1.7, ease: LUXE }}
              className="absolute inset-0 will-change-transform"
            >
              {slide.media_url && slide.media_type === 'video' && !lowData ? (
                <video
                  key={`v-${slide.id}`}
                  src={slide.media_url}
                  poster={slide.poster_url ?? undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover animate-kenburns"
                />
              ) : slide.media_url && slide.media_type === 'video' && lowData && slide.poster_url ? (
                <Image src={slide.poster_url} alt={slide.title ?? ''} fill priority className="object-cover animate-kenburns" />
              ) : slide.media_url ? (
                <Image
                  src={slide.media_url}
                  alt={slide.title ?? 'Geethams Silks'}
                  fill
                  priority={current === 0}
                  sizes="100vw"
                  style={{ objectPosition: `${slide.focal_x ?? 50}% ${slide.focal_y ?? 50}%` }}
                  className="object-cover animate-kenburns"
                />
              ) : (
                <div className="w-full h-full animate-kenburns" style={{ background: FALLBACK_GRADIENTS[current % FALLBACK_GRADIENTS.length] }} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Visual grading: dark overlay + gradient + vignette + rose-gold breath */}
        <div className="absolute inset-0 bg-black" style={{ opacity: slide.overlay_opacity ?? 0.45 }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.45) 100%)' }} />
        <div className="absolute inset-0 mix-blend-soft-light" style={{ background: 'linear-gradient(160deg, rgba(201,116,122,0.25) 0%, transparent 40%, rgba(184,152,106,0.2) 100%)' }} />
      </motion.div>

      {/* Foreground content — re-reveals only when the slide copy actually changes */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-20 h-full flex items-center justify-center px-6"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${slide.title}·${slide.subtitle}·${slide.cta_primary_label}·${slide.cta_secondary_label}`}
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -18, transition: { duration: 0.5, ease: LUXE } }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl text-center text-white"
          >
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: LUXE, delay: 0.15 }}
              className="mb-4 sm:mb-6 flex items-center justify-center gap-3 sm:gap-4"
            >
              <span className="h-px w-8 sm:w-10 bg-gradient-to-r from-transparent to-[var(--brand-gold)]" />
              <span className="text-[10px] sm:text-[11px] tracking-[0.4em] sm:tracking-[0.45em] uppercase text-[var(--brand-gold)] font-medium">Geethams Silks</span>
              <span className="h-px w-8 sm:w-10 bg-gradient-to-l from-transparent to-[var(--brand-gold)]" />
            </motion.div>

            <h1 className="font-serif font-light leading-[1.08] sm:leading-[1.05] tracking-tight text-[2rem] sm:text-6xl lg:text-7xl">
              <span className="line-mask">
                <motion.span
                  initial={reduced ? false : { y: '115%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, ease: LUXE, delay: 0.25 }}
                  className="block"
                >
                  {slide.title}
                </motion.span>
              </span>
            </h1>

            {slide.subtitle && (
              <motion.p
                initial={reduced ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: LUXE, delay: 0.5 }}
                className="mt-3.5 sm:mt-7 text-[13px] sm:text-lg text-white/75 sm:text-white/80 max-w-xs sm:max-w-xl mx-auto leading-relaxed tracking-wide"
              >
                {slide.subtitle}
              </motion.p>
            )}

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: LUXE, delay: 0.65 }}
              className="mt-7 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
            >
              {slide.cta_primary_label && (
                <Cta href={slide.cta_primary_link} label={slide.cta_primary_label} primary />
              )}
              {slide.cta_secondary_label && (
                <Cta href={slide.cta_secondary_link} label={slide.cta_secondary_label} />
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Navigation arrows */}
      {count > 1 && (
        <>
          <Arrow side="left" onClick={() => go(current - 1)} />
          <Arrow side="right" onClick={() => go(current + 1)} />
        </>
      )}

      {/* Luxury indicators — counter + progress bars */}
      {count > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
          <span className="text-[11px] tracking-[0.25em] text-white/75 tabular-nums">
            {String(current + 1).padStart(2, '0')}
            <span className="text-white/40"> / {String(count).padStart(2, '0')}</span>
          </span>
          <div className="flex items-center gap-2">
            {data.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="group relative h-[3px] w-8 sm:w-12 bg-white/25 overflow-hidden"
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
                {i < current && <span className="absolute inset-0 bg-white/60" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Location chip — compact, mirrors the scroll cue */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="absolute bottom-[4.7rem] sm:bottom-7 left-4 sm:left-10 z-30"
      >
        <motion.a
          href={SITE.maps}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open the boutique location in Google Maps"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.9, ease: LUXE }}
          className="group flex items-center gap-3"
        >
          <span className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 border border-white/25 backdrop-blur-sm transition-colors duration-500 group-hover:border-[var(--brand-gold)] group-hover:bg-white/5">
            <MapPin size={13} className="text-[var(--brand-gold)]" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="line-mask">
              <motion.span
                initial={{ y: '115%' }}
                animate={{ y: 0 }}
                transition={{ delay: 1.55, duration: 0.8, ease: LUXE }}
                className="block text-[9px] tracking-[0.32em] uppercase text-white/55 mb-1.5"
              >
                Geethams Silks
              </motion.span>
            </span>
            <span className="line-mask">
              <motion.span
                initial={{ y: '115%' }}
                animate={{ y: 0 }}
                transition={{ delay: 1.65, duration: 0.8, ease: LUXE }}
                className="flex items-center gap-1.5 text-[11px] tracking-[0.22em] uppercase text-white/85 transition-colors duration-300 group-hover:text-white"
              >
                Palavakkam · Chennai
                <ArrowUpRight size={11} className="text-[var(--brand-gold)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </motion.span>
            </span>
          </span>
        </motion.a>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        style={{ opacity: contentOpacity }}
        className="absolute bottom-7 right-6 sm:right-10 z-30 hidden sm:flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase text-white/50">Scroll</span>
        <div className="w-px h-9 overflow-hidden bg-white/20">
          <motion.div animate={{ y: [-36, 36] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }} className="w-px h-9 bg-gradient-to-b from-transparent via-[var(--brand-gold)] to-transparent" />
        </div>
      </motion.div>
      </section>
    </>
  )
}

function Cta({ href, label, primary = false }: { href: string | null; label: string; primary?: boolean }) {
  const isWhatsApp = !href || href.trim() === '' || href === 'whatsapp'
  const target = isWhatsApp ? waHref() : href
  const external = isWhatsApp || /^https?:\/\//.test(target)

  const cls = primary
    ? 'group inline-flex items-center gap-3 bg-white text-[var(--brand-charcoal)] text-[11px] sm:text-xs tracking-[0.2em] uppercase px-7 sm:px-9 py-3.5 sm:py-4 hover:bg-[var(--brand-gold)] hover:text-white transition-all duration-500 shadow-xl'
    : 'group inline-flex items-center gap-3 border border-white/50 text-white text-[11px] sm:text-xs tracking-[0.2em] uppercase px-7 sm:px-9 py-3.5 sm:py-4 hover:bg-white hover:text-[var(--brand-charcoal)] transition-all duration-500 backdrop-blur-sm'

  const inner = (
    <>
      {isWhatsApp && <MessageCircle size={14} />}
      {label}
      {!isWhatsApp && <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />}
    </>
  )

  if (external) {
    return <a href={target} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
  }
  return <Link href={target} className={cls}>{inner}</Link>
}

function Arrow({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous slide' : 'Next slide'}
      className={`group absolute top-1/2 -translate-y-1/2 z-30 ${side === 'left' ? 'left-4 sm:left-8' : 'right-4 sm:right-8'} hidden md:flex items-center justify-center w-12 h-12 border border-white/30 text-white/80 hover:text-white hover:border-[var(--brand-gold)] hover:bg-white/5 transition-all duration-500`}
    >
      {side === 'left'
        ? <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        : <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />}
    </button>
  )
}
