'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, CreditCard, Check, Loader2, MessageCircle } from 'lucide-react'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { useStore } from '@/lib/store/StoreProvider'
import { formatPrice } from '@/lib/utils'
import { SITE } from '@/lib/constants'
import PageNav from '@/components/common/PageNav'

// ── Razorpay checkout.js types (browser SDK, not server SDK) ─────────────────

interface RazorpaySuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id:   string
  razorpay_signature:  string
}

interface RazorpayErrorResponse {
  error: { code: string; description: string; source: string; step: string; reason: string }
}

interface RazorpayOptions {
  key: string; amount: number; currency: string
  name: string; description: string; order_id: string
  handler:  (response: RazorpaySuccessResponse) => void
  prefill?: { name?: string; contact?: string; email?: string }
  theme?:   { color?: string }
  modal?:   { ondismiss?: () => void }
}

declare global {
  interface Window {
    Razorpay: new (opts: RazorpayOptions) => {
      open(): void
      on(event: 'payment.failed', handler: (r: RazorpayErrorResponse) => void): void
    }
  }
}

// ── lazy-load checkout.js (idempotent) ───────────────────────────────────────

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Razorpay) { resolve(); return }
    const existing = document.getElementById('rzp-checkout-js')
    if (existing) {
      existing.addEventListener('load',  () => resolve())
      existing.addEventListener('error', () => reject(new Error('Razorpay script load failed')))
      return
    }
    const s   = document.createElement('script')
    s.id      = 'rzp-checkout-js'
    s.src     = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload  = () => resolve()
    s.onerror = () => reject(new Error('Razorpay script load failed'))
    document.head.appendChild(s)
  })
}

// ── component ────────────────────────────────────────────────────────────────

/**
 * Checkout — Razorpay Standard Checkout.
 *
 * Flow:
 *   1. placeOrder() validates form + calls Supabase `place_order` RPC
 *      → order recorded (status:pending, payment_status:unpaid)
 *   2. POST /api/razorpay/create-order → Razorpay order created server-side
 *   3. Razorpay modal opens in browser
 *   4. On success → POST /api/razorpay/verify-payment (HMAC checked server-side)
 *   5. Only on verified success: cart cleared, success screen shown
 *
 * WhatsApp fallback: if script fails or gateway unavailable the order is still
 * saved and WhatsApp opens so the customer can pay manually.
 * If user dismisses the modal: order stays in DB as pending — they can retry.
 */
export default function CheckoutPage() {
  const { cart, ready, cartTotal, cartCount, clearCart } = useStore()
  const [placing, setPlacing] = useState(false)
  const [done,    setDone]    = useState<{ number: string; paid: boolean } | null>(null)
  const [error,   setError]   = useState('')
  const [form,    setForm]    = useState({
    name: '', phone: '', email: '',
    line1: '', line2: '', city: '', state: '', pincode: '',
  })

  function set(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })) }

  function validate() {
    if (!form.name.trim())  return 'Please enter your name'
    if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) return 'Please enter a valid phone number'
    if (!form.line1.trim() || !form.city.trim() || !form.pincode.trim())
      return 'Please complete the shipping address'
    return ''
  }

  function openWhatsAppFallback(orderNo: string, total: number) {
    const lines = cart
      .map((it, i) => `${i + 1}. ${it.name}${it.size ? ` (${it.size})` : ''} × ${it.qty} — ${formatPrice(it.price * it.qty)}`)
      .join('\n')
    const msg =
      `Hi Geethams Silks, I've placed order ${orderNo}:\n\n${lines}\n\n` +
      `Total: ${formatPrice(total)}\n\n` +
      `Ship to: ${form.name}, ${form.line1}${form.line2 ? ', ' + form.line2 : ''}, ${form.city} ${form.pincode}\n` +
      `Phone: ${form.phone}\n\nPlease confirm and share payment details.`
    window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
  }

  async function placeOrder() {
    const v = validate()
    if (v) { setError(v); return }
    setError(''); setPlacing(true)

    // ── 1. Record order in Supabase ──────────────────────────────────────────
    const items = cart.map((it) => ({
      product_id: it.id, product_name: it.name, product_slug: it.slug,
      size: it.size ?? '', unit_price: it.price, quantity: it.qty,
    }))
    const address = {
      line1: form.line1, line2: form.line2,
      city: form.city, state: form.state, pincode: form.pincode,
    }

    const supabase = createClient()
    const { data, error: rpcErr } = await supabase.rpc('place_order', {
      p_customer_name: form.name, p_customer_phone: form.phone,
      p_customer_email: form.email || null,
      p_items: items, p_shipping_address: address, p_notes: null,
      p_shipping: 0, p_tax: 0, p_discount: 0,
    })

    if (rpcErr || !data) {
      setError('Could not place the order. Please try again or order via WhatsApp.')
      setPlacing(false); return
    }

    const { id: orderId, order_number: orderNo, total } =
      data as { id: string; order_number: string; total: number }

    // ── 2. Load Razorpay checkout.js ─────────────────────────────────────────
    try {
      await loadRazorpayScript()
    } catch {
      // Script unavailable — WhatsApp fallback (order is already saved)
      openWhatsAppFallback(orderNo, total)
      clearCart()
      setDone({ number: orderNo, paid: false })
      setPlacing(false); return
    }

    // ── 3. Create Razorpay order (server-side, KEY_SECRET never leaves server) ─
    const createRes = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, amount_inr: total }),
    })

    if (!createRes.ok) {
      // Gateway unavailable — WhatsApp fallback
      openWhatsAppFallback(orderNo, total)
      clearCart()
      setDone({ number: orderNo, paid: false })
      setPlacing(false); return
    }

    const { razorpay_order_id, amount, currency } = await createRes.json()
    setPlacing(false) // hide spinner while modal is open

    // ── 4. Open Razorpay checkout modal ──────────────────────────────────────
    let paymentResponse: RazorpaySuccessResponse | null = null

    try {
      paymentResponse = await new Promise<RazorpaySuccessResponse>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount, currency,
          name: SITE.name,
          description: `Order ${orderNo}`,
          order_id: razorpay_order_id,
          prefill: { name: form.name, contact: form.phone, email: form.email || undefined },
          theme: { color: '#c85a8b' },
          modal: { ondismiss: () => reject(new Error('DISMISSED')) },
          handler: (response) => resolve(response),
        })
        rzp.on('payment.failed', (r) =>
          reject(new Error(r.error.description || 'Payment failed'))
        )
        rzp.open()
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment failed'
      if (msg === 'DISMISSED') {
        setError(`Payment cancelled — order ${orderNo} is saved. Retry or message us on WhatsApp.`)
      } else {
        setError(msg)
      }
      return
    }

    // ── 5. Verify signature server-side (HMAC-SHA256) ────────────────────────
    setPlacing(true)
    const verifyRes = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...paymentResponse, order_id: orderId }),
    })

    if (!verifyRes.ok) {
      setError(`Payment received but verification failed. Please contact us with order number ${orderNo}.`)
      setPlacing(false); return
    }

    // ── 6. All good — payment verified ───────────────────────────────────────
    clearCart()
    setDone({ number: orderNo, paid: true })
    setPlacing(false)
  }

  const field =
    'w-full border border-[var(--brand-pink)] bg-white px-3 py-2.5 text-sm text-[var(--brand-charcoal)] focus:outline-none focus:border-[var(--brand-rose)] rounded-none'

  return (
    <div className="min-h-screen bg-[var(--brand-cream)] pb-24 lg:pb-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageNav
          fallback="/cart" backLabel="Bag"
          crumbs={[{ label: 'Shopping Bag', href: '/cart' }, { label: 'Checkout' }]}
          className="mb-8"
        />
        <h1 className="font-serif text-4xl lg:text-5xl font-light text-[var(--brand-charcoal)] mb-8">Checkout</h1>

        {done ? (
          <div className="bg-[var(--brand-sandal-light)] border border-[var(--brand-pink)]/30 p-10 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
              <Check size={28} />
            </div>
            <h2 className="font-serif text-2xl font-light text-[var(--brand-charcoal)] mb-2">
              {done.paid ? 'Payment confirmed!' : 'Order placed'}
            </h2>
            <p className="text-sm text-[var(--brand-charcoal)]/85 mb-1">Your order reference is</p>
            <p className="font-mono text-lg font-semibold text-[var(--brand-rose)] mb-5">{done.number}</p>
            {done.paid ? (
              <p className="text-sm text-[var(--brand-charcoal)]/85 mb-6">
                Your payment was successful. We'll confirm your order and share shipping updates shortly.
              </p>
            ) : (
              <p className="text-sm text-[var(--brand-charcoal)]/85 mb-6">
                We've opened WhatsApp so you can confirm with us and share payment details.
              </p>
            )}
            <Link
              href="/shop"
              className="inline-flex bg-[var(--brand-darkpink)] text-white text-[11px] tracking-[0.22em] uppercase px-8 py-4 hover:bg-[var(--brand-rose)] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : !ready ? null : cartCount === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-[var(--brand-charcoal)]/80 mb-6">Your bag is empty</p>
            <Link href="/shop" className="inline-flex bg-[var(--brand-darkpink)] text-white text-[11px] tracking-[0.22em] uppercase px-8 py-4 hover:bg-[var(--brand-rose)] transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ── Contact + address form ──────────────────────────────────── */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-[var(--brand-sandal-light)] border border-[var(--brand-pink)]/30 p-6">
                <h2 className="font-serif text-xl font-light text-[var(--brand-charcoal)] mb-4">Contact</h2>
                <div className="space-y-3">
                  <input className={field} placeholder="Full name *" value={form.name} onChange={(e) => set('name', e.target.value)} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className={field} placeholder="Phone *"            value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                    <input className={field} placeholder="Email (optional)"   value={form.email} onChange={(e) => set('email', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="bg-[var(--brand-sandal-light)] border border-[var(--brand-pink)]/30 p-6">
                <h2 className="font-serif text-xl font-light text-[var(--brand-charcoal)] mb-4">Shipping Address</h2>
                <div className="space-y-3">
                  <input className={field} placeholder="Address line 1 *" value={form.line1} onChange={(e) => set('line1', e.target.value)} />
                  <input className={field} placeholder="Address line 2"   value={form.line2} onChange={(e) => set('line2', e.target.value)} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input className={field} placeholder="City *"     value={form.city}    onChange={(e) => set('city',    e.target.value)} />
                    <input className={field} placeholder="State"      value={form.state}   onChange={(e) => set('state',   e.target.value)} />
                    <input className={field} placeholder="PIN code *" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-3">{error}</p>
              )}
            </div>

            {/* ── Order summary + pay button ─────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="bg-[var(--brand-sandal-light)] border border-[var(--brand-pink)]/30 p-6 lg:sticky lg:top-28">
                <h2 className="font-serif text-xl font-light text-[var(--brand-charcoal)] mb-4">Your Order</h2>

                <div className="divide-y divide-[var(--brand-pink)]/20 mb-3">
                  {cart.map((it) => (
                    <div key={`${it.id}-${it.size ?? ''}`} className="flex justify-between items-start py-2.5 text-sm">
                      <span className="text-[var(--brand-charcoal)] pr-3">
                        {it.name}{it.size ? ` · ${it.size}` : ''}{' '}
                        <span className="text-[var(--brand-charcoal)]/75">× {it.qty}</span>
                      </span>
                      <span className="font-medium tabular-nums shrink-0">{formatPrice(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--brand-pink)]/30 pt-3 flex justify-between items-baseline mb-4">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--brand-charcoal)]/85">Total</span>
                  <span className="font-serif text-2xl font-semibold text-[var(--brand-charcoal)] tabular-nums">
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="w-full min-h-[52px] bg-[var(--brand-darkpink)] text-white text-xs tracking-[0.2em] uppercase hover:bg-[var(--brand-rose)] transition-colors active:scale-[0.99] disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  {placing
                    ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                    : <><CreditCard size={16} /> Pay Securely · {formatPrice(cartTotal)}</>
                  }
                </button>

                <div className="mt-4 flex items-start gap-2 text-[11px] text-[var(--brand-charcoal)]/75 leading-relaxed">
                  <ShieldCheck size={14} className="text-[var(--brand-rose)] shrink-0 mt-0.5" />
                  Secured by Razorpay · Cards, UPI, NetBanking &amp; Wallets accepted
                </div>
                <div className="mt-2 flex items-start gap-2 text-[11px] text-[var(--brand-charcoal)]/75 leading-relaxed">
                  <MessageCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                  WhatsApp confirmation available if payment window is dismissed
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
