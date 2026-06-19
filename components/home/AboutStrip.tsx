'use client'
import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Sparkles, MapPin, MessageCircle } from 'lucide-react'
import CurtainImage from '@/components/common/CurtainImage'
import LuxButton from '@/components/ui/lux-button'
import { LUXE } from '@/lib/motion'

const VALUES = [
  { icon: Sparkles, title: 'Premium Quality', desc: 'Curated for craftsmanship and timeless elegance.' },
  { icon: MapPin, title: 'Visit Our Store', desc: '388, Periyar Salai, Palavakkam, Chennai.' },
  { icon: MessageCircle, title: 'WhatsApp Commerce', desc: 'The boutique, brought to your phone.' },
]

const QUOTE_LINES = ['Clothing is more than fabric —', 'it is culture, grace,', 'and identity, woven.']

/**
 * Image-led brand story strip: parallax curtain image beside an oversized
 * serif pull-quote, values condensed beneath. Replaces the icon-column block.
 */
export default function AboutStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const shown = reduced || inView

  return (
    <section className="relative bg-[var(--brand-darkpink)] text-white overflow-hidden">
      {/* ambient glow */}
      <div className="absolute -top-24 right-0 w-[700px] h-[400px] rounded-full bg-[var(--brand-rose)]/10 blur-3xl pointer-events-none" />
      {/* Decorative watermark. On mobile the image stacks on top, so anchor the
          word low (behind the text column) where it reads cleanly; on desktop
          the two-column layout leaves the top clear, so keep it up top. */}
      <span aria-hidden className="backdrop-word backdrop-word--light top-[62%] lg:top-10">Heritage</span>

      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Imagery — curtain reveal with parallax drift */}
          <div className="relative">
            <CurtainImage
              src="/secondheroimage.jpeg"
              alt="Geethams Silks boutique collection"
              from="left"
              parallax={40}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="aspect-[4/5] max-h-[620px] w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </CurtainImage>
            {/* floating frame accent */}
            <div className="absolute -bottom-5 -right-5 w-40 h-40 border border-[var(--brand-gold)]/40 hidden lg:block" />
          </div>

          {/* Pull-quote + values */}
          <div>
            <span className="line-mask">
              <motion.span
                initial={false}
                animate={{ y: shown ? 0 : '110%' }}
                transition={{ duration: 0.9, ease: LUXE }}
                className="block text-xs tracking-[0.4em] uppercase text-[var(--brand-gold)] mb-7"
              >
                The House of Geetham
              </motion.span>
            </span>

            <blockquote className="font-serif font-light text-3xl sm:text-4xl lg:text-[2.9rem] leading-[1.18] mb-10">
              {QUOTE_LINES.map((line, i) => (
                <span key={line} className="line-mask">
                  <motion.span
                    initial={false}
                    animate={{ y: shown ? 0 : '115%' }}
                    transition={{ duration: 1, ease: LUXE, delay: 0.15 + i * 0.12 }}
                    className={`block ${i === QUOTE_LINES.length - 1 ? 'italic text-[var(--brand-pink)]' : ''}`}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </blockquote>

            <div className="space-y-5 mb-10">
              {VALUES.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={false}
                  animate={{ opacity: shown ? 1 : 0, x: shown ? 0 : 28 }}
                  transition={{ duration: 0.8, ease: LUXE, delay: 0.5 + i * 0.12 }}
                  className="flex items-start gap-4"
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--brand-pink)]/30 shrink-0">
                    <Icon className="text-[var(--brand-pink)]" size={17} />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-medium tracking-wide leading-tight">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={false}
              animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 18 }}
              transition={{ duration: 0.8, ease: LUXE, delay: 0.9 }}
            >
              <LuxButton href="/about" variant="outline-white" arrow>
                Our Story
              </LuxButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
