'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { LUXE } from '@/lib/motion'

interface SilkFilmProps {
  src?: string
  heading?: string
  caption?: string
}

const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?|$)/i

/**
 * The homepage cinema moment: a frame that swells from letterboxed to
 * full-bleed as you scroll. Renders an image by default (a portrait video
 * would be cropped here); pass a landscape video URL to play film instead.
 */
export default function SilkFilm({
  src = '/heroimage1.jpeg',
  heading = 'Six yards of poetry',
  caption = 'Every drape tells a story',
}: SilkFilmProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  // phones get a gentler letterbox so the frame never feels tiny
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const apply = () => setMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0.05, 0.5], [mobile ? 0.9 : 0.72, 1])
  const radius = useTransform(scrollYProgress, [0.05, 0.5], [24, 0])
  const textY = useTransform(scrollYProgress, [0.2, 0.6], [60, -20])
  const textOpacity = useTransform(scrollYProgress, [0.25, 0.45, 0.8, 0.95], [0, 1, 1, 0])

  return (
    <section ref={ref} className="relative bg-[var(--brand-charcoal)] py-20 lg:py-28 overflow-hidden">
      {/* ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[var(--brand-rose)]/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.9, ease: LUXE }}
          className="text-center mb-10 px-6"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-[var(--brand-gold)] mb-3">The Film</p>
          <h2 className="font-serif text-4xl lg:text-6xl font-light text-white leading-tight">
            Elegance, <em className="italic text-[var(--brand-pink)]">in motion</em>
          </h2>
        </motion.div>

        {/* scroll-swelling frame */}
        <motion.div
          style={reduced ? undefined : { scale, borderRadius: radius }}
          className="relative w-full max-w-[1400px] overflow-hidden will-change-transform"
        >
          {VIDEO_RE.test(src) ? (
            <video
              src={src}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full aspect-video sm:aspect-[21/9] object-cover"
            />
          ) : (
            <div className="relative w-full aspect-video sm:aspect-[21/9] overflow-hidden">
              <Image
                src={src}
                alt={heading}
                fill
                sizes="100vw"
                className="object-cover animate-kenburns"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15 pointer-events-none" />

          {/* floating serif line over the film */}
          <motion.div
            style={reduced ? undefined : { y: textY, opacity: textOpacity }}
            className="absolute inset-x-0 bottom-0 p-8 sm:p-14 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
          >
            <div>
              <p className="text-[11px] tracking-[0.35em] uppercase text-[var(--brand-gold)] mb-3">{caption}</p>
              <p className="font-serif text-3xl sm:text-5xl font-light text-white leading-[1.1] max-w-lg">{heading}</p>
            </div>
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-3 text-xs tracking-[0.25em] uppercase text-white/80 hover:text-white transition-colors shrink-0 pb-1"
            >
              Watch the lookbook
              <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
