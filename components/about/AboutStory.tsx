'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView, useReducedMotion, animate } from 'framer-motion'
import CurtainImage from '@/components/common/CurtainImage'
import LuxButton from '@/components/ui/lux-button'
import { LUXE } from '@/lib/motion'
import { SITE } from '@/lib/constants'

/* ---------------- Hero ---------------- */

const HERO_LINES = ['Where tradition', 'meets elegance']

export function AboutHero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 90])

  return (
    <section ref={ref} className="relative pt-36 lg:pt-44 pb-20 lg:pb-28 overflow-hidden bg-[var(--brand-cream)]">
      <span aria-hidden className="backdrop-word top-24">Geetham</span>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: LUXE, delay: 0.1 }}
            className="text-xs tracking-[0.4em] uppercase text-[var(--brand-rose)] mb-7"
          >
            Our Story
          </motion.p>
          <h1 className="text-display text-[var(--brand-charcoal)]">
            {HERO_LINES.map((line, i) => (
              <span key={line} className="line-mask">
                <motion.span
                  initial={reduced ? false : { y: '112%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, ease: LUXE, delay: 0.2 + i * 0.14 }}
                  className={`block ${i === 1 ? 'italic text-[var(--brand-rose)]' : ''}`}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: LUXE, delay: 0.6 }}
            className="mt-8 text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl"
          >
            Geethams Silks is a premium boutique in Palavakkam, Chennai — dedicated to the finest
            sarees, kurtas, and ethnic wear for women and children. Clothing, to us, is an expression
            of culture, grace, and identity.
          </motion.p>
        </div>

        <motion.div
          style={reduced ? undefined : { y: imgY }}
          className="lg:col-span-5 relative"
        >
          <CurtainImage
            src="/heroimage4.jpeg"
            alt="Geethams Silks — the boutique"
            from="right"
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="aspect-[3/4] w-full max-w-md mx-auto"
          />
          <div className="absolute -bottom-5 -left-5 w-36 h-36 border border-[var(--brand-gold)]/50 hidden lg:block" />
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- Journey timeline ---------------- */

const MILESTONES = [
  {
    title: 'The Beginning',
    copy: 'Born from a love of South Indian textiles — the weaves, the borders, the stories carried in every thread.',
  },
  {
    title: 'The Craft',
    copy: 'Curating Kanchipuram silks, soft silks, and designer ethnic wear with an uncompromising eye for quality.',
  },
  {
    title: 'The Boutique',
    copy: 'Our home at 388 Periyar Salai, Palavakkam — where Chennai comes to drape, celebrate, and belong.',
  },
  {
    title: 'Today',
    copy: 'The boutique in your pocket: browse online, enquire on WhatsApp, and let us style your next occasion.',
  },
]

export function JourneyTimeline() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })

  return (
    <section className="py-24 lg:py-32 bg-[var(--brand-darkpink)] text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[380px] rounded-full bg-[var(--brand-rose)]/10 blur-3xl pointer-events-none" />
      <span aria-hidden className="backdrop-word backdrop-word--light top-12">Journey</span>

      <div className="relative max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.4em] uppercase text-[var(--brand-gold)] mb-4">The Journey</p>
          <h2 className="font-serif text-4xl lg:text-5xl font-light">
            A thread, <em className="italic text-[var(--brand-pink)]">unbroken</em>
          </h2>
        </div>

        <div ref={ref} className="relative pl-10 sm:pl-14">
          {/* the gold thread draws itself down the page */}
          <div className="absolute left-[7px] sm:left-[9px] top-1 bottom-1 w-px bg-white/10" />
          <motion.div
            style={{ scaleY: reduced ? 1 : scrollYProgress }}
            className="absolute left-[7px] sm:left-[9px] top-1 bottom-1 w-px origin-top bg-gradient-to-b from-[var(--brand-gold)] via-[var(--brand-rose)] to-[var(--brand-gold)]"
          />

          <div className="space-y-16">
            {MILESTONES.map((m, i) => (
              <Milestone key={m.title} {...m} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Milestone({ title, copy, index }: { title: string; copy: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, margin: '-18% 0px' })
  const shown = reduced || inView

  return (
    <div ref={ref} className="relative">
      {/* node on the thread */}
      <motion.span
        initial={false}
        animate={{ scale: shown ? 1 : 0 }}
        transition={{ duration: 0.6, ease: LUXE, delay: 0.1 }}
        className="absolute -left-10 sm:-left-14 top-1.5 w-[15px] h-[15px] sm:w-[19px] sm:h-[19px] rounded-full border border-[var(--brand-gold)] bg-[var(--brand-darkpink)] flex items-center justify-center"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-gold)]" />
      </motion.span>

      <span className="line-mask">
        <motion.span
          initial={false}
          animate={{ y: shown ? 0 : '110%' }}
          transition={{ duration: 0.9, ease: LUXE }}
          className="block font-serif text-sm text-[var(--brand-gold)] tracking-[0.3em] uppercase mb-2 tabular-nums"
        >
          {String(index + 1).padStart(2, '0')}
        </motion.span>
      </span>
      <span className="line-mask">
        <motion.h3
          initial={false}
          animate={{ y: shown ? 0 : '112%' }}
          transition={{ duration: 0.95, ease: LUXE, delay: 0.08 }}
          className="block font-serif text-2xl sm:text-3xl font-light"
        >
          {title}
        </motion.h3>
      </span>
      <motion.p
        initial={false}
        animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 16 }}
        transition={{ duration: 0.8, ease: LUXE, delay: 0.22 }}
        className="mt-3 text-gray-400 leading-relaxed max-w-lg"
      >
        {copy}
      </motion.p>
    </div>
  )
}

/* ---------------- Craftsmanship spread ---------------- */

export function Craftsmanship() {
  return (
    <section className="py-24 lg:py-32 bg-[var(--brand-sandal-light)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="relative order-2 lg:order-1 grid grid-cols-2 gap-4">
          <CurtainImage
            src="/heroimage2.jpeg"
            alt="Silk drape detail"
            from="left"
            parallax={34}
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="aspect-[3/4] mt-10"
          />
          <CurtainImage
            src="/heroimage3.jpeg"
            alt="Ethnic wear collection"
            from="bottom"
            parallax={56}
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="aspect-[3/4]"
          />
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-xs tracking-[0.4em] uppercase text-[var(--brand-rose)] mb-6">Craftsmanship</p>
          <h2 className="font-serif text-4xl lg:text-5xl font-light text-[var(--brand-charcoal)] leading-[1.12] mb-7">
            Selected with love, <em className="italic text-[var(--brand-rose)]">and an eye for quality</em>
          </h2>
          <div className="space-y-5 text-gray-500 leading-relaxed">
            <p>
              Our collection celebrates the rich textile heritage of South India while embracing
              contemporary tastes. From bridal silks to everyday kurtas, each piece earns its
              place on our racks.
            </p>
            <p>
              Shop from the comfort of your home — browse the collection online and enquire
              directly on WhatsApp. We bring the boutique experience to your fingertips.
            </p>
          </div>
          <div className="mt-9 flex flex-wrap gap-4">
            <LuxButton href="/shop" variant="solid-charcoal" arrow>
              Browse the Collection
            </LuxButton>
            <LuxButton
              href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hi Geethams Silks, I would like to know more about your boutique.')}`}
              variant="whatsapp"
              whatsappIcon
            >
              Say Hello
            </LuxButton>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Stats ---------------- */

const STATS = [
  { value: 1000, suffix: '+', label: 'Drapes curated' },
  { value: 500, suffix: '+', label: 'Families styled' },
  { value: 6, suffix: '', label: 'Yards of poetry, every saree' },
]

export function StatsStrip() {
  return (
    <section className="py-20 bg-[var(--brand-cream-deep)] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
        {STATS.map((s, i) => (
          <Stat key={s.label} {...s} delay={i * 0.12} />
        ))}
      </div>
    </section>
  )
}

function Stat({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const [display, setDisplay] = useState(reduced ? value : 0)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value)
      return
    }
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      delay,
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, value, delay, reduced])

  return (
    <div ref={ref}>
      <p className="font-serif text-5xl lg:text-6xl font-light text-[var(--brand-charcoal)] tabular-nums">
        {display}
        <span className="text-[var(--brand-rose)]">{suffix}</span>
      </p>
      <div className="hairline w-14 mx-auto my-4" />
      <p className="text-xs tracking-[0.25em] uppercase text-gray-500">{label}</p>
    </div>
  )
}
