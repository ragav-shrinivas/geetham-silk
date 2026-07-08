'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, PenLine } from 'lucide-react'
import SectionHeading from '@/components/common/SectionHeading'
import { SITE } from '@/lib/constants'
import { LUXE } from '@/lib/motion'
import type { Testimonial } from '@/types/database'

interface Props { testimonials: Testimonial[] }

const ROTATE_MS = 6500

const PLACEHOLDER: Testimonial[] = [
  { id: '1', customer_name: 'Priya Ramesh', location: 'Anna Nagar, Chennai', rating: 5, review: 'Absolutely stunning collection! The silk sarees are of premium quality. Highly recommend Geethams Silks for any occasion.', created_at: '', updated_at: '', is_active: true, display_order: 0, avatar_url: null, product_id: null },
  { id: '2', customer_name: 'Divya Krishnan', location: 'Velachery, Chennai', rating: 5, review: "Perfect for my daughter's school function. The kids wear collection is adorable and the fabric quality is excellent.", created_at: '', updated_at: '', is_active: true, display_order: 0, avatar_url: null, product_id: null },
  { id: '3', customer_name: 'Meena Subramanian', location: 'Adyar, Chennai', rating: 5, review: 'Found my dream saree here! The WhatsApp ordering experience was so smooth. Will definitely shop again.', created_at: '', updated_at: '', is_active: true, display_order: 0, avatar_url: null, product_id: null },
]

/**
 * One voice at a time: an oversized serif quote that crossfades on a slow
 * rotation — an editorial moment, not a card grid.
 */
export default function TestimonialsSection({ testimonials }: Props) {
  const items = testimonials.length > 0 ? testimonials : PLACEHOLDER
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const count = items.length

  const go = useCallback((i: number) => setIndex((i + count) % count), [count])

  useEffect(() => {
    if (count <= 1 || reduced) return
    const id = setTimeout(() => go(index + 1), ROTATE_MS)
    return () => clearTimeout(id)
  }, [index, count, go, reduced])

  const t = items[index]

  return (
    <section className="py-24 lg:py-32 bg-[var(--brand-cream)] relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-[var(--brand-pink)]/15 blur-3xl pointer-events-none" />
      <span aria-hidden className="backdrop-word top-16">Adored</span>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Reviews" title="Loved by Our *Customers*" className="mb-12" />

        <div className="relative min-h-[300px] sm:min-h-[260px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.figure
              key={t.id}
              initial={reduced ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -22 }}
              transition={{ duration: 0.8, ease: LUXE }}
              className="text-center"
            >
              <div className="flex justify-center gap-1.5 mb-7">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={15} className="fill-[var(--brand-gold)] text-[var(--brand-gold)]" />
                ))}
              </div>
              <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light leading-[1.35] text-[var(--brand-charcoal)] mb-8">
                &ldquo;{t.review}&rdquo;
              </blockquote>
              <figcaption>
                <p className="font-serif text-xl font-medium text-[var(--brand-charcoal)]">{t.customer_name}</p>
                {t.location && (
                  <p className="text-[11px] text-[var(--brand-rose)] tracking-[0.25em] uppercase mt-1.5">{t.location}</p>
                )}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {/* navigation */}
        {count > 1 && (
          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous review"
              className="w-10 h-10 inline-flex items-center justify-center border border-[var(--brand-charcoal)]/15 text-[var(--brand-charcoal)]/80 hover:border-[var(--brand-rose)] hover:text-[var(--brand-rose)] transition-colors duration-300"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2.5">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => go(i)}
                  aria-label={`Review ${i + 1}`}
                  className={`h-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    i === index ? 'w-8 bg-[var(--brand-rose)]' : 'w-3 bg-[var(--brand-darkpink)]/20 hover:bg-[var(--brand-darkpink)]/40'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => go(index + 1)}
              aria-label="Next review"
              className="w-10 h-10 inline-flex items-center justify-center border border-[var(--brand-charcoal)]/15 text-[var(--brand-charcoal)]/80 hover:border-[var(--brand-rose)] hover:text-[var(--brand-rose)] transition-colors duration-300"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* feedback + Google reviews */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          <Link
            href="/contact#feedback"
            className="link-underline inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[var(--brand-charcoal)] hover:text-[var(--brand-rose)] transition-colors"
          >
            <PenLine size={13} className="text-[var(--brand-rose)]" />
            Share your experience
          </Link>
          <a
            href={SITE.googleReviews}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[var(--brand-charcoal)] hover:text-[var(--brand-rose)] transition-colors"
          >
            <Star size={13} className="fill-[var(--brand-gold)] text-[var(--brand-gold)]" />
            Review us on Google
          </a>
        </div>
      </div>
    </section>
  )
}
