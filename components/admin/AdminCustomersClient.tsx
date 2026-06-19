'use client'
import { useEffect, useState } from 'react'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { formatPrice } from '@/lib/utils'
import { Users } from 'lucide-react'

interface Row {
  id: string; name: string; phone: string | null; email: string | null
  orders: number; spent: number; lastOrder: string | null
}

export default function AdminCustomersClient() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      // Derive customers from orders (covers guests too) and enrich with profiles.
      const [{ data: orders }, { data: profiles }] = await Promise.all([
        supabase.from('orders').select('customer_id, customer_name, customer_phone, customer_email, total, created_at'),
        supabase.from('profiles').select('id, full_name, phone, role').eq('role', 'customer'),
      ])

      const map = new Map<string, Row>()
      for (const o of (orders as { customer_id: string | null; customer_name: string; customer_phone: string; customer_email: string | null; total: number; created_at: string }[]) ?? []) {
        const key = o.customer_id ?? `guest:${o.customer_phone}`
        const existing = map.get(key)
        if (existing) {
          existing.orders += 1
          existing.spent += Number(o.total)
          if (!existing.lastOrder || o.created_at > existing.lastOrder) existing.lastOrder = o.created_at
        } else {
          map.set(key, { id: key, name: o.customer_name, phone: o.customer_phone, email: o.customer_email, orders: 1, spent: Number(o.total), lastOrder: o.created_at })
        }
      }
      // Add registered customers who haven't ordered yet
      for (const p of (profiles as { id: string; full_name: string | null; phone: string | null }[]) ?? []) {
        if (!map.has(p.id)) map.set(p.id, { id: p.id, name: p.full_name ?? 'Customer', phone: p.phone, email: null, orders: 0, spent: 0, lastOrder: null })
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRows([...map.values()].sort((a, b) => b.spent - a.spent))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">Everyone who has registered or placed an order.</p>
      </div>

      {loading ? (
        <div className="h-40 bg-white border border-gray-100 rounded-lg animate-pulse" />
      ) : rows.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-lg py-16 text-center">
          <Users size={36} strokeWidth={1} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No customers yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs tracking-wider">Contact</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs tracking-wider">Orders</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs tracking-wider">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-[var(--brand-charcoal)]">{r.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{[r.phone, r.email].filter(Boolean).join(' · ') || '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.orders}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">{formatPrice(r.spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
