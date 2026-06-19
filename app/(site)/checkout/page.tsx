'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, MessageCircle, Check, Loader2 } from 'lucide-react'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { useStore } from '@/lib/store/StoreProvider'
import { formatPrice } from '@/lib/utils'
import { SITE } from '@/lib/constants'
import PageNav from '@/components/common/PageNav'

/**
 * Checkout. Online card/UPI payment (Razorpay/Cashfree) plugs in at the marked
 * step once merchant keys + GSTIN are available — see PAYMENT INTEGRATION POINT.
 * Until then, placing an order records it in Supabase (status: pending) and
 * confirms via WhatsApp.
 */
export default function CheckoutPage() {
  const { cart, ready, cartTotal, cartCount, clearCart } = useStore()
  const [placing, setPlacing] = useState(false)
  const [done, setDone] = useState<{ number: string } | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', email: '', line1: '', line2: '', city: '', state: '', pincode: '' })

  function set(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })) }

  function validate() {
    if (!form.name.trim()) return 'Please enter your name'
    if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) return 'Please enter a valid phone number'
    if (!form.line1.trim() || !form.city.trim() || !form.pincode.trim()) return 'Please complete the shipping address'
    return ''
  }

  async function placeOrder() {
    const v = validate()
    if (v) { setError(v); return }
    setError(''); setPlacing(true)

    const items = cart.map((it) => ({
      product_id: it.id, product_name: it.name, product_slug: it.slug,
      size: it.size ?? '', unit_price: it.price, quantity: it.qty,
    }))
    const address = { line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: form.pincode }

    const supabase = createClient()
    const { data, error: rpcErr } = await supabase.rpc('place_order', {
      p_customer_name: form.name, p_customer_phone: form.phone, p_customer_email: form.email || null,
      p_items: items, p_shipping_address: address, p_notes: null,
      p_shipping: 0, p_tax: 0, p_discount: 0,
    })

    if (rpcErr) { setError('Could not place the order. Please try again or order on WhatsApp.'); setPlacing(false); return }

    /* ── PAYMENT INTEGRATION POINT ──────────────────────────────────────────
       With a gateway configured, here we'd create a Razorpay/Cashfree order for
       `data.total`, open its checkout, and on success update the order's
       payment_status to 'paid'. For now we confirm over WhatsApp.            */

    const orderNo = (data as { order_number: string }).order_number
    const lines = cart.map((it, i) => `${i + 1}. ${it.name}${it.size ? ` (${it.size})` : ''} × ${it.qty} — ${formatPrice(it.price * it.qty)}`).join('\n')
    const msg = `Hi Geethams Silks, I've placed order ${orderNo}:\n\n${lines}\n\nTotal: ${formatPrice(cartTotal)}\n\nShip to: ${form.name}, ${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city} ${address.pincode}\nPhone: ${form.phone}\n\nPlease confirm and share payment details.`
    window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')

    clearCart()
    setDone({ number: orderNo })
    setPlacing(false)
  }

  const field = 'w-full border border-[var(--brand-pink)] bg-white px-3 py-2.5 text-sm text-[var(--brand-charcoal)] focus:outline-none focus:border-[var(--brand-rose)] rounded-none'

  return (
    <div className="pt-24 min-h-screen bg-[var(--brand-cream)] pb-24 lg:pb-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageNav fallback="/cart" backLabel="Bag" crumbs={[{ label: 'Shopping Bag', href: '/cart' }, { label: 'Checkout' }]} className="mb-8" />
        <h1 className="font-serif text-4xl lg:text-5xl font-light text-[var(--brand-charcoal)] mb-8">Checkout</h1>

        {done ? (
          <div className="bg-white border border-[var(--brand-pink)]/30 p-10 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4"><Check size={28} /></div>
            <h2 className="font-serif text-2xl font-light text-[var(--brand-charcoal)] mb-2">Order placed</h2>
            <p className="text-sm text-gray-500 mb-1">Your order reference is</p>
            <p className="font-mono text-lg font-semibold text-[var(--brand-rose)] mb-5">{done.number}</p>
            <p className="text-sm text-gray-500 mb-6">We’ve opened WhatsApp so you can confirm with us. We’ll verify availability and share payment details shortly.</p>
            <Link href="/shop" className="inline-flex bg-[var(--brand-darkpink)] text-white text-[11px] tracking-[0.22em] uppercase px-8 py-4 hover:bg-[var(--brand-rose)] transition-colors">Continue Shopping</Link>
          </div>
        ) : !ready ? null : cartCount === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-[var(--brand-charcoal)]/60 mb-6">Your bag is empty</p>
            <Link href="/shop" className="inline-flex bg-[var(--brand-darkpink)] text-white text-[11px] tracking-[0.22em] uppercase px-8 py-4 hover:bg-[var(--brand-rose)] transition-colors">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* form */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white border border-[var(--brand-pink)]/30 p-6">
                <h2 className="font-serif text-xl font-light text-[var(--brand-charcoal)] mb-4">Contact</h2>
                <div className="space-y-3">
                  <input className={field} placeholder="Full name *" value={form.name} onChange={(e) => set('name', e.target.value)} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className={field} placeholder="Phone *" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                    <input className={field} placeholder="Email (optional)" value={form.email} onChange={(e) => set('email', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="bg-white border border-[var(--brand-pink)]/30 p-6">
                <h2 className="font-serif text-xl font-light text-[var(--brand-charcoal)] mb-4">Shipping Address</h2>
                <div className="space-y-3">
                  <input className={field} placeholder="Address line 1 *" value={form.line1} onChange={(e) => set('line1', e.target.value)} />
                  <input className={field} placeholder="Address line 2" value={form.line2} onChange={(e) => set('line2', e.target.value)} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input className={field} placeholder="City *" value={form.city} onChange={(e) => set('city', e.target.value)} />
                    <input className={field} placeholder="State" value={form.state} onChange={(e) => set('state', e.target.value)} />
                    <input className={field} placeholder="PIN code *" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} />
                  </div>
                </div>
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-3">{error}</p>}
            </div>

            {/* summary */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-[var(--brand-pink)]/30 p-6 lg:sticky lg:top-28">
                <h2 className="font-serif text-xl font-light text-[var(--brand-charcoal)] mb-4">Your Order</h2>
                <div className="divide-y divide-[var(--brand-pink)]/20 mb-3">
                  {cart.map((it) => (
                    <div key={`${it.id}-${it.size ?? ''}`} className="flex justify-between items-start py-2.5 text-sm">
                      <span className="text-[var(--brand-charcoal)] pr-3">{it.name}{it.size ? ` · ${it.size}` : ''} <span className="text-gray-400">× {it.qty}</span></span>
                      <span className="font-medium tabular-nums shrink-0">{formatPrice(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--brand-pink)]/30 pt-3 flex justify-between items-baseline mb-4">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-gray-500">Total</span>
                  <span className="font-serif text-2xl font-semibold text-[var(--brand-charcoal)] tabular-nums">{formatPrice(cartTotal)}</span>
                </div>
                <button onClick={placeOrder} disabled={placing} className="w-full min-h-[52px] bg-[var(--brand-darkpink)] text-white text-xs tracking-[0.2em] uppercase hover:bg-[var(--brand-rose)] transition-colors active:scale-[0.99] disabled:opacity-60 inline-flex items-center justify-center gap-2">
                  {placing ? <><Loader2 size={16} className="animate-spin" /> Placing…</> : <><MessageCircle size={16} /> Place Order</>}
                </button>
                <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-400">
                  <ShieldCheck size={14} className="text-[var(--brand-rose)]" />
                  Card / UPI payment arriving soon — order is confirmed over WhatsApp for now.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
