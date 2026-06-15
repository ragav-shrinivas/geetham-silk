'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Trash2, Search, GripVertical, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Product {
  id: string; name: string; product_code: string; price: number
  is_active: boolean; is_featured: boolean; is_out_of_stock: boolean
  is_new_arrival: boolean; is_trending: boolean; is_best_seller: boolean
  best_seller_order: number
  product_images: { url: string; is_primary: boolean }[]
  categories: { name: string } | null
}

type Filter = 'all' | 'active' | 'oos' | 'bestseller' | 'featured' | 'new'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All Products' },
  { key: 'active', label: 'Active' },
  { key: 'oos', label: 'Out of Stock' },
  { key: 'bestseller', label: 'Best Selling' },
  { key: 'featured', label: 'Featured' },
  { key: 'new', label: 'New Arrivals' },
]

const SELECT = 'id, name, product_code, price, is_active, is_featured, is_out_of_stock, is_new_arrival, is_trending, is_best_seller, best_seller_order, product_images(url, is_primary), categories(name)'

export default function AdminProductsClient() {
  const params = useSearchParams()
  const initialFilter = (FILTERS.find((f) => f.key === params.get('filter'))?.key ?? 'all') as Filter

  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>(initialFilter)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let q = supabase.from('products').select(SELECT)

    switch (filter) {
      case 'active': q = q.eq('is_active', true); break
      case 'oos': q = q.eq('is_out_of_stock', true); break
      case 'bestseller': q = q.eq('is_best_seller', true); break
      case 'featured': q = q.eq('is_featured', true); break
      case 'new': q = q.eq('is_new_arrival', true); break
    }
    q = filter === 'bestseller'
      ? q.order('best_seller_order', { ascending: true })
      : q.order('created_at', { ascending: false })
    if (search) q = q.ilike('name', `%${search}%`)

    const { data } = await q
    setProducts((data ?? []) as unknown as Product[])
    setLoading(false)
  }, [filter, search])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

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

  async function removeBestSeller(id: string) {
    const supabase = createClient()
    await supabase.from('products').update({ is_best_seller: false }).eq('id', id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} shown</p>
        </div>
        <Link href="/evo9-admin/products/new">
          <Button variant="rose" size="sm" className="gap-2">
            <Plus size={14} /> Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'text-[11px] tracking-[0.12em] uppercase px-3.5 py-1.5 border transition-colors duration-200',
              filter === f.key
                ? 'border-[var(--brand-rose)] bg-[var(--brand-rose)] text-white'
                : 'border-gray-200 text-gray-500 hover:border-[var(--brand-rose)]/50 hover:text-[var(--brand-rose)]'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filter === 'bestseller' && !loading && products.length > 0 && (
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
          <GripVertical size={13} className="text-gray-400" />
          Drag to set the order they appear on the homepage.
        </p>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-100">
          <p className="text-gray-400 mb-4">No products in this view.</p>
          {filter === 'all' && (
            <Link href="/evo9-admin/products/new"><Button variant="rose" size="sm">Add First Product</Button></Link>
          )}
        </div>
      ) : filter === 'bestseller' ? (
        <BestSellerSortable products={products} setProducts={setProducts} onRemove={removeBestSeller} onDelete={deleteProduct} />
      ) : (
        <ProductTable products={products} onToggleActive={toggleActive} onDelete={deleteProduct} />
      )}
    </div>
  )
}

const primaryImage = (p: Product) => p.product_images?.find((i) => i.is_primary) ?? p.product_images?.[0]

/* ---------- Standard table (non-bestseller filters) ---------- */

function ProductTable({
  products, onToggleActive, onDelete,
}: {
  products: Product[]
  onToggleActive: (id: string, current: boolean) => void
  onDelete: (id: string) => void
}) {
  return (
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
                      <Badge variant={p.is_active ? 'pink' : 'outline'} className="cursor-pointer" onClick={() => onToggleActive(p.id, p.is_active)}>
                        {p.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                      {p.is_best_seller && <Badge variant="gold">Best Seller</Badge>}
                      {p.is_new_arrival && <Badge variant="rose">New</Badge>}
                      {p.is_trending && <Badge variant="gold">Trending</Badge>}
                      {p.is_out_of_stock && <Badge variant="default">Out of Stock</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/evo9-admin/products/${p.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil size={13} /></Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 hover:bg-red-50" onClick={() => onDelete(p.id)}>
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
  )
}

/* ---------- Sortable best-seller list (drag to order homepage) ---------- */

function BestSellerSortable({
  products, setProducts, onRemove, onDelete,
}: {
  products: Product[]
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  onRemove: (id: string) => void
  onDelete: (id: string) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = products.findIndex((p) => p.id === active.id)
    const newIndex = products.findIndex((p) => p.id === over.id)
    const next = arrayMove(products, oldIndex, newIndex)
    setProducts(next)

    const supabase = createClient()
    await Promise.all(
      next.map((p, i) => supabase.from('products').update({ best_seller_order: i }).eq('id', p.id))
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5">
          {products.map((p, i) => (
            <SortableRow key={p.id} product={p} index={i} onRemove={onRemove} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableRow({
  product, index, onRemove, onDelete,
}: {
  product: Product
  index: number
  onRemove: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id })
  const img = primaryImage(product)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 bg-white border rounded-lg px-3 py-2.5',
        isDragging ? 'border-[var(--brand-rose)] shadow-lg relative z-10' : 'border-gray-100 shadow-sm'
      )}
    >
      <button {...attributes} {...listeners} aria-label="Drag to reorder"
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none p-1">
        <GripVertical size={16} />
      </button>
      <span className="text-xs text-gray-300 tabular-nums w-5">{String(index + 1).padStart(2, '0')}</span>
      <div className="w-11 h-11 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        {img ? (
          <Image src={img.url} alt={product.name} width={44} height={44} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">G</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--brand-charcoal)] line-clamp-1">{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">{formatPrice(product.price)}</span>
          {product.categories && <span className="text-[11px] text-gray-400">· {product.categories.name}</span>}
          {product.is_out_of_stock && <Badge variant="default">Out of Stock</Badge>}
          {!product.is_active && <Badge variant="outline">Hidden</Badge>}
        </div>
      </div>
      <button onClick={() => onRemove(product.id)} title="Remove from best sellers"
        className="text-[10px] tracking-[0.12em] uppercase text-gray-400 hover:text-[var(--brand-rose)] inline-flex items-center gap-1 px-2 py-1 transition-colors">
        <Star size={12} /> Remove
      </button>
      <Link href={`/evo9-admin/products/${product.id}/edit`}>
        <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil size={13} /></Button>
      </Link>
      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 hover:bg-red-50" onClick={() => onDelete(product.id)}>
        <Trash2 size={13} />
      </Button>
    </div>
  )
}
