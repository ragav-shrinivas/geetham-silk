'use client'
import { useEffect, useState, useCallback } from 'react'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { formatPrice } from '@/lib/utils'
import { ChevronDown, Package, Phone, Mail, MapPin } from 'lucide-react'

interface OrderItem {
  id: string; product_name: string; product_slug: string | null; size: string | null
  unit_price: number; quantity: number; line_total: number
}
interface Order {
  id: string; order_number: string; customer_name: string; customer_phone: string
  customer_email: string | null; status: string; payment_status: string
  subtotal: number; shipping: number; tax: number; discount: number; total: number
  shipping_address: Record<string, string> | null; notes: string | null
  created_at: string; order_items: OrderItem[]
}

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] as const
const FILTERS = ['all', ...STATUSES] as const

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  returned: 'bg-red-50 text-red-600 border-red-200',
}

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    setOrders((data as Order[]) ?? [])
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  async function changeStatus(id: string, status: string) {
    setUpdating(id)
    const supabase = createClient()
    await supabase.rpc('admin_set_order_status', { p_order_id: id, p_status: status })
    await load()
    setUpdating(null)
  }

  const visible = filter === 'all' ? orders : orders.filter((o) => o.status === filter)
  const count = (s: string) => (s === 'all' ? orders.length : orders.filter((o) => o.status === s).length)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Manage orders and update fulfilment status. Stock adjusts automatically.</p>
      </div>

      {/* status filter bar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-3.5 py-1.5 text-xs tracking-wide uppercase rounded-full border transition-colors ${
              filter === f ? 'bg-[var(--brand-charcoal)] text-white border-[var(--brand-charcoal)]' : 'bg-white text-gray-500 border-gray-200 hover:border-[var(--brand-rose)]'
            }`}
          >
            {f} <span className="opacity-60">({count(f)})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-white border border-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-lg py-16 text-center">
          <Package size={36} strokeWidth={1} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No {filter === 'all' ? '' : filter} orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((o) => {
            const open = expanded === o.id
            return (
              <div key={o.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                <button onClick={() => setExpanded(open ? null : o.id)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-medium text-[var(--brand-charcoal)]">{o.order_number}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wide ${STATUS_STYLE[o.status] ?? ''}`}>{o.status}</span>
                      {o.payment_status === 'paid' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200 uppercase tracking-wide">Paid</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{o.customer_name} · {o.customer_phone} · {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className="font-serif text-lg font-semibold text-[var(--brand-charcoal)] tabular-nums">{formatPrice(o.total)}</span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                  <div className="border-t border-gray-100 px-4 py-4 bg-gray-50/40">
                    {/* items */}
                    <div className="space-y-1.5 mb-4">
                      {o.order_items.map((it) => (
                        <div key={it.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{it.product_name}{it.size ? ` · ${it.size}` : ''} <span className="text-gray-400">× {it.quantity}</span></span>
                          <span className="tabular-nums text-gray-600">{formatPrice(it.line_total)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 pt-2 space-y-1 text-sm mb-4">
                      <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="tabular-nums">{formatPrice(o.subtotal)}</span></div>
                      {o.shipping > 0 && <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="tabular-nums">{formatPrice(o.shipping)}</span></div>}
                      {o.tax > 0 && <div className="flex justify-between text-gray-500"><span>Tax</span><span className="tabular-nums">{formatPrice(o.tax)}</span></div>}
                      {o.discount > 0 && <div className="flex justify-between text-gray-500"><span>Discount</span><span className="tabular-nums">−{formatPrice(o.discount)}</span></div>}
                      <div className="flex justify-between font-semibold text-[var(--brand-charcoal)] pt-1"><span>Total</span><span className="tabular-nums">{formatPrice(o.total)}</span></div>
                    </div>

                    {/* contact + address */}
                    <div className="grid sm:grid-cols-2 gap-3 text-xs text-gray-600 mb-4">
                      <div className="flex items-center gap-2"><Phone size={13} className="text-gray-400" /> {o.customer_phone}</div>
                      {o.customer_email && <div className="flex items-center gap-2"><Mail size={13} className="text-gray-400" /> {o.customer_email}</div>}
                      {o.shipping_address && (
                        <div className="flex items-start gap-2 sm:col-span-2"><MapPin size={13} className="text-gray-400 mt-0.5" />
                          <span>{[o.shipping_address.line1, o.shipping_address.line2, o.shipping_address.city, o.shipping_address.state, o.shipping_address.pincode].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                      {o.notes && <div className="sm:col-span-2 text-gray-500 italic">“{o.notes}”</div>}
                    </div>

                    {/* status control */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Update status:</span>
                      <select
                        value={o.status}
                        disabled={updating === o.id}
                        onChange={(e) => changeStatus(o.id, e.target.value)}
                        className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--brand-rose)] disabled:opacity-50"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      {updating === o.id && <span className="text-xs text-gray-400">Saving…</span>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
