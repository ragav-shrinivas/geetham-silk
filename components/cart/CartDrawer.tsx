'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useLenis } from 'lenis/react'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { useStore } from '@/lib/store/StoreProvider'
import { formatPrice } from '@/lib/utils'
import { LUXE } from '@/lib/motion'

export default function CartDrawer() {
  const { cart, cartOpen, closeCart, cartTotal, cartCount, setQty, removeFromCart } = useStore()
  const lenis = useLenis()
  const router = useRouter()

  // lock background scroll while the drawer is open (Lenis-aware)
  useEffect(() => {
    if (cartOpen) { lenis?.stop(); document.body.style.overflow = 'hidden' }
    else { lenis?.start(); document.body.style.overflow = '' }
    return () => { lenis?.start(); document.body.style.overflow = '' }
  }, [cartOpen, lenis])

  function goCheckout() {
    closeCart()
    router.push('/checkout')
  }

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
          />

          {/* panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.42, ease: LUXE }}
            className="fixed top-0 right-0 z-[120] h-[100dvh] w-full sm:w-[420px] bg-[var(--brand-cream)] flex flex-col shadow-2xl"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            aria-label="Shopping cart"
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--brand-pink)]/30 shrink-0">
              <h2 className="font-serif text-xl font-light text-[var(--brand-charcoal)]">
                Your Bag {cartCount > 0 && <span className="text-sm text-[var(--brand-rose)]">({cartCount})</span>}
              </h2>
              <button onClick={closeCart} aria-label="Close cart" className="p-2 -mr-2 text-[var(--brand-charcoal)] active:scale-90 transition-transform">
                <X size={24} />
              </button>
            </div>

            {/* items */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
                <ShoppingBag size={40} className="text-[var(--brand-charcoal)]/20" strokeWidth={1} />
                <p className="font-serif text-2xl font-light text-[var(--brand-charcoal)]/70">Your bag is empty</p>
                <Link href="/shop" onClick={closeCart} className="mt-2 text-[11px] tracking-[0.22em] uppercase border-b border-[var(--brand-charcoal)]/30 pb-1 hover:text-[var(--brand-rose)] hover:border-[var(--brand-rose)] transition-colors">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4">
                {cart.map((it) => (
                  <div key={`${it.id}-${it.size ?? ''}`} className="flex gap-3">
                    <Link href={`/products/${it.slug}`} onClick={closeCart} className="relative w-20 h-24 shrink-0 bg-[var(--brand-cream-deep)] overflow-hidden">
                      {it.image ? (
                        <Image src={it.image} alt={it.name} fill sizes="80px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-serif text-2xl text-[var(--brand-charcoal)]/25">G</div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <Link href={`/products/${it.slug}`} onClick={closeCart} className="font-serif text-sm text-[var(--brand-charcoal)] leading-snug line-clamp-2 hover:text-[var(--brand-rose)] transition-colors">
                        {it.name}
                      </Link>
                      {it.size && <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--brand-charcoal)]/75 mt-0.5">Size: {it.size}</span>}
                      <span className="font-serif text-sm font-semibold text-[var(--brand-charcoal)] mt-1">{formatPrice(it.price)}</span>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center border border-[var(--brand-charcoal)]/15">
                          <button onClick={() => setQty(it.id, it.size, it.qty - 1)} aria-label="Decrease quantity" className="w-8 h-8 flex items-center justify-center text-[var(--brand-charcoal)] hover:bg-[var(--brand-pink)]/15 active:scale-90 transition">
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">{it.qty}</span>
                          <button onClick={() => setQty(it.id, it.size, it.qty + 1)} aria-label="Increase quantity" className="w-8 h-8 flex items-center justify-center text-[var(--brand-charcoal)] hover:bg-[var(--brand-pink)]/15 active:scale-90 transition">
                            <Plus size={13} />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(it.id, it.size)} aria-label="Remove item" className="p-2 text-[var(--brand-charcoal)]/75 hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* footer */}
            {cart.length > 0 && (
              <div className="border-t border-[var(--brand-pink)]/30 px-5 py-4 space-y-3 shrink-0 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--brand-charcoal)]/85">Subtotal</span>
                  <span className="font-serif text-xl font-semibold text-[var(--brand-charcoal)]">{formatPrice(cartTotal)}</span>
                </div>
                <p className="text-[10px] text-[var(--brand-charcoal)]/75">Shipping & taxes calculated at checkout.</p>
                <button
                  onClick={goCheckout}
                  className="w-full min-h-[52px] bg-[var(--brand-darkpink)] text-white text-xs tracking-[0.2em] uppercase hover:bg-[var(--brand-rose)] transition-colors active:scale-[0.99]"
                >
                  Proceed to Checkout
                </button>
                <Link href="/cart" onClick={closeCart} className="block text-center text-[11px] tracking-[0.2em] uppercase text-[var(--brand-charcoal)]/80 hover:text-[var(--brand-rose)] transition-colors">
                  View Full Bag
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
