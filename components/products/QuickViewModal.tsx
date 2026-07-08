'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useLenis } from 'lenis/react'
import { X, ArrowRight } from 'lucide-react'
import { useStore } from '@/lib/store/StoreProvider'
import { formatPrice } from '@/lib/utils'
import { LUXE } from '@/lib/motion'
import ProductActions from '@/components/products/ProductActions'

/** Lightweight product preview without leaving the listing. */
export default function QuickViewModal() {
  const { quickView: p, closeQuickView } = useStore()
  const lenis = useLenis()

  useEffect(() => {
    if (p) { lenis?.stop(); document.body.style.overflow = 'hidden' }
    else { lenis?.start(); document.body.style.overflow = '' }
    return () => { lenis?.start(); document.body.style.overflow = '' }
  }, [p, lenis])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeQuickView() }
    if (p) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [p, closeQuickView])

  return (
    <AnimatePresence>
      {p && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeQuickView}
            className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.42, ease: LUXE }}
            className="fixed inset-x-3 top-1/2 -translate-y-1/2 z-[120] mx-auto max-w-3xl max-h-[88dvh] overflow-y-auto overscroll-contain bg-[var(--brand-cream)] shadow-2xl"
            role="dialog" aria-modal="true" aria-label={`Quick view: ${p.name}`}
          >
            <button onClick={closeQuickView} aria-label="Close quick view" className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-[var(--brand-charcoal)] hover:text-[var(--brand-rose)] active:scale-90 transition">
              <X size={18} />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="relative aspect-[3/4] bg-[var(--brand-cream-deep)]">
                {p.product_images?.[0] ? (
                  <Image src={(p.product_images.find((i) => i.is_primary) ?? p.product_images[0]).url} alt={p.name} fill sizes="(max-width:640px) 100vw, 384px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-serif text-6xl text-[var(--brand-charcoal)]/20">G</div>
                )}
              </div>
              <div className="p-6 sm:p-8 flex flex-col">
                {p.categories && <span className="text-[10px] tracking-[0.22em] uppercase text-[var(--brand-rose)] mb-1.5 font-medium">{p.categories.name}</span>}
                <h2 className="font-serif text-2xl lg:text-3xl font-light text-[var(--brand-charcoal)] leading-tight mb-2">{p.name}</h2>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="font-serif text-2xl font-semibold text-[var(--brand-charcoal)]">{formatPrice(p.price)}</span>
                  {p.original_price && p.original_price > p.price && <span className="text-sm text-[var(--brand-charcoal)]/75 line-through">{formatPrice(p.original_price)}</span>}
                </div>
                <ProductActions product={p} />
                <Link href={`/products/${p.slug}`} onClick={closeQuickView} className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-[var(--brand-charcoal)] border-b border-[var(--brand-charcoal)]/20 hover:border-[var(--brand-rose)] hover:text-[var(--brand-rose)] pb-1 w-fit transition-colors">
                  View Full Details <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
