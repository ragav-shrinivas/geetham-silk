'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { formatPrice } from '@/lib/utils'
import { Package, ShoppingCart, IndianRupee, AlertTriangle, ArrowRight, Clock } from 'lucide-react'

interface LowStock { id: string; name: string; slug: string; stock_quantity: number; low_stock_threshold: number }
interface RecentOrder { id: string; order_number: string; customer_name: string; total: number; status: string; created_at: string }

export default function AdminDashboard() {
  const [revenue, setRevenue] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [lowStock, setLowStock] = useState<LowStock[]>([])
  const [recent, setRecent] = useState<RecentOrder[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [paid, orders, pending, products, low, recentOrders] = await Promise.all([
        supabase.from('orders').select('total').eq('payment_status', 'paid'),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id, name, slug, stock_quantity, low_stock_threshold').eq('track_inventory', true),
        supabase.from('orders').select('id, order_number, customer_name, total, status, created_at').order('created_at', { ascending: false }).limit(5),
      ])
      const rev = ((paid.data as { total: number }[]) ?? []).reduce((s, o) => s + Number(o.total), 0)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRevenue(rev)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrderCount(orders.count ?? 0)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPendingCount(pending.count ?? 0)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProductCount(products.count ?? 0)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLowStock(((low.data as LowStock[]) ?? []).filter((p) => p.stock_quantity <= p.low_stock_threshold))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecent((recentOrders.data as RecentOrder[]) ?? [])
    }
    load()
  }, [])

  const stats = [
    { label: 'Revenue (paid)', value: formatPrice(revenue), icon: IndianRupee, color: 'bg-green-50 text-green-600' },
    { label: 'Total Orders', value: orderCount, icon: ShoppingCart, color: 'bg-rose-50 text-rose-600', href: '/evo9-admin/orders' },
    { label: 'Pending Orders', value: pendingCount, icon: Clock, color: 'bg-amber-50 text-amber-600', href: '/evo9-admin/orders' },
    { label: 'Products', value: productCount, icon: Package, color: 'bg-blue-50 text-blue-600', href: '/evo9-admin/products' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back to Geethams Silks admin panel.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const inner = (
            <div className="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-sm transition-shadow h-full">
              <div className={`inline-flex p-2 rounded-md ${s.color} mb-3`}><s.icon size={18} /></div>
              <p className="text-2xl font-semibold text-[var(--brand-charcoal)] tabular-nums">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          )
          return s.href ? <Link key={s.label} href={s.href}>{inner}</Link> : <div key={s.label}>{inner}</div>
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent orders */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-700">Recent Orders</h2>
            <Link href="/evo9-admin/orders" className="text-xs text-[var(--brand-rose)] hover:underline inline-flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No orders yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="min-w-0">
                    <span className="font-mono text-xs text-[var(--brand-charcoal)]">{o.order_number}</span>
                    <span className="text-gray-400 text-xs ml-2">{o.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] uppercase tracking-wide text-gray-400">{o.status}</span>
                    <span className="font-medium tabular-nums">{formatPrice(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-700 inline-flex items-center gap-2"><AlertTriangle size={15} className="text-amber-500" /> Low Stock</h2>
            <Link href="/evo9-admin/products" className="text-xs text-[var(--brand-rose)] hover:underline inline-flex items-center gap-1">Manage <ArrowRight size={12} /></Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">All tracked products are well stocked.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {lowStock.map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`} target="_blank" className="flex items-center justify-between py-2.5 text-sm hover:text-[var(--brand-rose)]">
                  <span className="truncate pr-3">{p.name}</span>
                  <span className={`tabular-nums font-medium shrink-0 ${p.stock_quantity === 0 ? 'text-red-500' : 'text-amber-600'}`}>{p.stock_quantity} left</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'View Orders', href: '/evo9-admin/orders' },
            { label: 'Add New Product', href: '/evo9-admin/products/new' },
            { label: 'Manage Categories', href: '/evo9-admin/categories' },
            { label: 'Customers', href: '/evo9-admin/customers' },
            { label: 'Edit Homepage', href: '/evo9-admin/homepage' },
            { label: 'Settings', href: '/evo9-admin/settings' },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded text-sm text-gray-600 hover:border-[var(--brand-rose)] hover:text-[var(--brand-rose)] transition-colors group">
              {a.label}
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
