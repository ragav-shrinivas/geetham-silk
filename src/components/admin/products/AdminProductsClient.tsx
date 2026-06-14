'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Product {
  id: string; name: string; product_code: string; price: number
  is_active: boolean; is_featured: boolean; is_out_of_stock: boolean
  is_new_arrival: boolean; is_trending: boolean
  product_images: { url: string; is_primary: boolean }[]
  categories: { name: string } | null
}

export default function AdminProductsClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const supabase = createClient()
    let q = supabase
      .from('products')
      .select('id, name, product_code, price, is_active, is_featured, is_out_of_stock, is_new_arrival, is_trending, product_images(url, is_primary), categories(name)')
      .order('created_at', { ascending: false })
    if (search) q = q.ilike('name', `%${search}%`)
    const { data } = await q
    setProducts((data ?? []) as unknown as Product[])
    setLoading(false)
  }

  // reload whenever the search term changes
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { load() }, [search])

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('products').update({ is_active: !current }).eq('id', id)
    load()
  }

  const primaryImage = (p: Product) => p.product_images?.find((i) => i.is_primary) ?? p.product_images?.[0]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} total</p>
        </div>
        <Link href="/evo9-admin/products/new">
          <Button variant="rose" size="sm" className="gap-2">
            <Plus size={14} /> Add Product
          </Button>
        </Link>
      </div>

      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-100">
          <p className="text-gray-400 mb-4">No products yet.</p>
          <Link href="/evo9-admin/products/new">
            <Button variant="rose" size="sm">Add First Product</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs tracking-wider">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => {
                  const img = primaryImage(p)
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {img ? (
                              <Image src={img.url} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">G</div>
                            )}
                          </div>
                          <span className="font-medium text-[var(--brand-charcoal)] line-clamp-1">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.product_code}</td>
                      <td className="px-4 py-3 font-medium text-[var(--brand-charcoal)]">{formatPrice(p.price)}</td>
                      <td className="px-4 py-3 text-gray-500">{p.categories?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={p.is_active ? 'pink' : 'outline'} className="cursor-pointer" onClick={() => toggleActive(p.id, p.is_active)}>
                            {p.is_active ? 'Active' : 'Hidden'}
                          </Badge>
                          {p.is_new_arrival && <Badge variant="rose">New</Badge>}
                          {p.is_trending && <Badge variant="gold">Trending</Badge>}
                          {p.is_out_of_stock && <Badge variant="default">Out of Stock</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/evo9-admin/products/${p.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil size={13} />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 hover:bg-red-50"
                            onClick={() => deleteProduct(p.id)}>
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
