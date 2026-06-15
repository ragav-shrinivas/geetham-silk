'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { Package, Tag, BookOpen, Image, Star, ArrowRight } from 'lucide-react'

interface Stats {
  products: number
  categories: number
  collections: number
  gallery: number
  testimonials: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ products: 0, categories: 0, collections: 0, gallery: 0, testimonials: 0 })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [p, c, col, g, t] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('collections').select('id', { count: 'exact', head: true }),
        supabase.from('gallery').select('id', { count: 'exact', head: true }),
        supabase.from('testimonials').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        products: p.count ?? 0,
        categories: c.count ?? 0,
        collections: col.count ?? 0,
        gallery: g.count ?? 0,
        testimonials: t.count ?? 0,
      })
    }
    load()
  }, [])

  const cards = [
    { label: 'Products', value: stats.products, href: '/evo9-admin/products', icon: Package, color: 'bg-rose-50 text-rose-600' },
    { label: 'Categories', value: stats.categories, href: '/evo9-admin/categories', icon: Tag, color: 'bg-amber-50 text-amber-600' },
    { label: 'Collections', value: stats.collections, href: '/evo9-admin/collections', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'Gallery', value: stats.gallery, href: '/evo9-admin/gallery', icon: Image, color: 'bg-purple-50 text-purple-600' },
    { label: 'Testimonials', value: stats.testimonials, href: '/evo9-admin/testimonials', icon: Star, color: 'bg-green-50 text-green-600' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back to Geetham Silks admin panel.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-sm transition-shadow group">
            <div className={`inline-flex p-2 rounded-md ${card.color} mb-3`}>
              <card.icon size={18} />
            </div>
            <p className="text-2xl font-semibold text-[var(--brand-charcoal)]">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Add New Product', href: '/evo9-admin/products/new' },
            { label: 'Add Category', href: '/evo9-admin/categories/new' },
            { label: 'Add Collection', href: '/evo9-admin/collections/new' },
            { label: 'Upload to Gallery', href: '/evo9-admin/gallery/new' },
            { label: 'Add Testimonial', href: '/evo9-admin/testimonials/new' },
            { label: 'Edit Homepage', href: '/evo9-admin/homepage' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded text-sm text-gray-600 hover:border-[var(--brand-rose)] hover:text-[var(--brand-rose)] transition-colors group"
            >
              {action.label}
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
