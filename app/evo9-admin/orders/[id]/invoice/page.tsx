import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { SITE } from '@/lib/constants'
import PrintButton from '@/components/admin/PrintButton'

export const metadata = { title: 'Invoice', robots: { index: false, follow: false } }

interface OrderItem { id: string; product_name: string; size: string | null; unit_price: number; quantity: number; line_total: number }
interface Order {
  id: string; order_number: string; customer_name: string; customer_phone: string; customer_email: string | null
  status: string; payment_status: string; subtotal: number; shipping: number; tax: number; discount: number; total: number
  shipping_address: Record<string, string> | null; created_at: string; order_items: OrderItem[]
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')

  const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).single()
  if (!data) notFound()
  const o = data as Order
  const addr = o.shipping_address

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto px-4 print:px-0">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <Link href="/evo9-admin/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--brand-rose)]"><ArrowLeft size={15} /> Back to Orders</Link>
          <PrintButton />
        </div>

        <div className="bg-white p-8 sm:p-12 shadow-sm print:shadow-none">
          {/* header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-[var(--brand-charcoal)]">{SITE.name}</h1>
              <p className="text-xs text-gray-500 mt-1 max-w-[15rem]">{SITE.address}</p>
              <p className="text-xs text-gray-500">{SITE.phone} · {SITE.email}</p>
            </div>
            <div className="text-right">
              <p className="font-serif text-xl text-[var(--brand-charcoal)]">INVOICE</p>
              <p className="text-sm font-mono text-gray-600 mt-1">{o.order_number}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-xs mt-2"><span className="uppercase tracking-wide text-gray-400">Payment:</span> <span className={o.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}>{o.payment_status}</span></p>
            </div>
          </div>

          {/* bill to */}
          <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Bill To</p>
              <p className="font-medium text-[var(--brand-charcoal)]">{o.customer_name}</p>
              <p className="text-gray-500">{o.customer_phone}</p>
              {o.customer_email && <p className="text-gray-500">{o.customer_email}</p>}
            </div>
            {addr && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Ship To</p>
                <p className="text-gray-600">{[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>
              </div>
            )}
          </div>

          {/* items */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-gray-200 text-left text-[10px] uppercase tracking-wider text-gray-400">
                <th className="py-2">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {o.order_items.map((it) => (
                <tr key={it.id} className="border-b border-gray-100">
                  <td className="py-2.5 text-[var(--brand-charcoal)]">{it.product_name}{it.size ? ` · ${it.size}` : ''}</td>
                  <td className="py-2.5 text-center tabular-nums">{it.quantity}</td>
                  <td className="py-2.5 text-right tabular-nums">{formatPrice(it.unit_price)}</td>
                  <td className="py-2.5 text-right tabular-nums">{formatPrice(it.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="tabular-nums">{formatPrice(o.subtotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="tabular-nums">{formatPrice(o.shipping)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Tax (GST)</span><span className="tabular-nums">{formatPrice(o.tax)}</span></div>
              {o.discount > 0 && <div className="flex justify-between text-gray-500"><span>Discount</span><span className="tabular-nums">−{formatPrice(o.discount)}</span></div>}
              <div className="flex justify-between font-semibold text-[var(--brand-charcoal)] border-t border-gray-200 pt-2 text-base"><span>Total</span><span className="tabular-nums">{formatPrice(o.total)}</span></div>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 mt-10 border-t border-gray-100 pt-4">
            GST details and HSN codes will appear here once configured. Thank you for shopping with {SITE.name}.
          </p>
        </div>
      </div>
    </div>
  )
}
