'use client'
import Link from 'next/link'
import { ShieldCheck, MessageCircle } from 'lucide-react'
import { useStore } from '@/lib/store/StoreProvider'
import { formatPrice } from '@/lib/utils'
import { SITE } from '@/lib/constants'
import PageNav from '@/components/common/PageNav'

/**
 * Interim checkout. Online payments (Razorpay/Cashfree) + GST invoicing land in
 * the next phase once merchant keys & GSTIN are available. Until then, this page
 * compiles the bag into a WhatsApp order so customers can complete a purchase.
 */
export default function CheckoutPage() {
  const { cart, ready, cartTotal, cartCount } = useStore()

  function orderViaWhatsApp() {
    const lines = cart.map((it, i) =>
      `${i + 1}. ${it.name}${it.size ? ` (Size: ${it.size})` : ''} × ${it.qty} — ${formatPrice(it.price * it.qty)}`
    ).join('\n')
    const msg =
      `Hi Geetham Silks, I'd like to place an order:\n\n${lines}\n\nTotal: ${formatPrice(cartTotal)}\n\nPlease confirm availability and share payment details.`
    window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
  }

  return (
    <div className="pt-24 min-h-screen bg-[var(--brand-cream)] pb-24 lg:pb-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageNav fallback="/cart" backLabel="Bag" crumbs={[{ label: 'Shopping Bag', href: '/cart' }, { label: 'Checkout' }]} className="mb-8" />

        <h1 className="font-serif text-4xl lg:text-5xl font-light text-[var(--brand-charcoal)] mb-8">Checkout</h1>

        {!ready ? null : cartCount === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-[var(--brand-charcoal)]/60 mb-6">Your bag is empty</p>
            <Link href="/shop" className="inline-flex bg-[var(--brand-charcoal)] text-white text-[11px] tracking-[0.22em] uppercase px-8 py-4 hover:bg-[var(--brand-rose)] transition-colors">Start Shopping</Link>
          </div>
        ) : (
          <>
            {/* order summary */}
            <div className="bg-white border border-[var(--brand-pink)]/30 p-6 mb-6">
              <h2 className="font-serif text-xl font-light text-[var(--brand-charcoal)] mb-4">Your Order</h2>
              <div className="divide-y divide-[var(--brand-pink)]/20">
                {cart.map((it) => (
                  <div key={`${it.id}-${it.size ?? ''}`} className="flex justify-between items-start py-3 text-sm">
                    <span className="text-[var(--brand-charcoal)] pr-4">
                      {it.name}{it.size ? ` · ${it.size}` : ''} <span className="text-gray-400">× {it.qty}</span>
                    </span>
                    <span className="font-medium tabular-nums shrink-0">{formatPrice(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--brand-pink)]/30 mt-3 pt-4 flex justify-between items-baseline">
                <span className="text-[11px] tracking-[0.2em] uppercase text-gray-500">Total</span>
                <span className="font-serif text-2xl font-semibold text-[var(--brand-charcoal)] tabular-nums">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            {/* interim notice + WhatsApp order */}
            <div className="bg-[var(--brand-pink)]/10 border border-[var(--brand-pink)]/40 p-6 text-center">
              <ShieldCheck size={28} strokeWidth={1.3} className="mx-auto text-[var(--brand-rose)] mb-3" />
              <p className="font-serif text-xl font-light text-[var(--brand-charcoal)] mb-1">Secure online payments arriving soon</p>
              <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
                Card / UPI / Net-banking checkout is being set up. To complete your order now, send it to us on WhatsApp and we’ll confirm availability and share payment details.
              </p>
              <button onClick={orderViaWhatsApp} className="inline-flex items-center gap-2 bg-[#25D366] text-white text-xs tracking-[0.2em] uppercase px-8 py-4 hover:bg-[#128C7E] transition-colors active:scale-[0.99]">
                <MessageCircle size={16} /> Place Order on WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
