'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { LUXE } from '@/lib/motion'
import type { Banner } from '@/lib/queries'

/** Promotional banner strip — auto-rotating, full-width, schedule-aware (filtered server-side). */
export default function PromoBanners({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0)
  const reduced = useReducedMotion()
  const count = banners.length

  useEffect(() => {
    if (count <= 1) return
    const id = setInterval(() => setI((p) => (p + 1) % count), 5500)
    return () => clearInterval(id)
  }, [count])

  if (count === 0) return null
  const b = banners[i]

  const inner = (
    <div className="relative w-full aspect-[16/7] sm:aspect-[16/5] overflow-hidden bg-[var(--brand-darkpink)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={b.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.8, ease: LUXE }}
          className="absolute inset-0"
        >
          <Image src={b.image_url} alt={b.title ?? 'Promotion'} fill sizes="100vw" className="object-cover" priority={i === 0} />
          {(b.title || b.subtitle || b.cta_label) && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent flex items-center">
              <div className="px-6 sm:px-12 lg:px-20 max-w-2xl">
                {b.subtitle && <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[var(--brand-gold)] mb-2 sm:mb-3">{b.subtitle}</p>}
                {b.title && <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">{b.title}</h2>}
                {b.cta_label && (
                  <span className="mt-4 sm:mt-6 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-white border-b border-white/40 pb-1 group-hover:border-[var(--brand-gold)] transition-colors">
                    {b.cta_label} <ArrowRight size={13} />
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((bn, idx) => (
            <button
              key={bn.id}
              onClick={(e) => { e.preventDefault(); setI(idx) }}
              aria-label={`Banner ${idx + 1}`}
              className={`h-[3px] rounded-full transition-all duration-500 ${idx === i ? 'w-7 bg-[var(--brand-gold)]' : 'w-2.5 bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <section className="bg-[var(--brand-cream)]">
      <div className="group">
        {b.link_url ? <Link href={b.link_url}>{inner}</Link> : inner}
      </div>
    </section>
  )
}
