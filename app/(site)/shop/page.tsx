import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getProducts, getCategories, getCollections, type ProductSort } from '@/lib/queries'
import ShopFilters from '@/components/shop/ShopFilters'
import ShopGrid from '@/components/shop/ShopGrid'
import LuxButton from '@/components/ui/lux-button'
import WhatsAppFloat from '@/components/common/WhatsAppFloat'

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse our complete collection of premium sarees, kurtas & ethnic wear. Enquire on WhatsApp.',
}

export const revalidate = 3600

interface SearchParams {
  category?: string
  collection?: string
  featured?: string
  new?: string
  trending?: string
  search?: string
  sort?: string
}

const VALID_SORTS: ProductSort[] = ['featured', 'newest', 'price-asc', 'price-desc']

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const sort = VALID_SORTS.includes(params.sort as ProductSort) ? (params.sort as ProductSort) : undefined

  const [products, categories, collections] = await Promise.all([
    getProducts({
      categorySlug: params.category,
      collectionSlug: params.collection,
      featured: params.featured === 'true',
      trending: params.trending === 'true',
      newArrival: params.new === 'true',
      search: params.search,
      sort,
    }),
    getCategories(),
    getCollections(),
  ])

  const title = params.search
    ? `Results for “${params.search}”`
    : params.category
    ? categories.find((c) => c.slug === params.category)?.name ?? 'The Boutique'
    : params.collection
    ? collections.find((c) => c.slug === params.collection)?.name ?? 'The Boutique'
    : params.new === 'true'
    ? 'New Arrivals'
    : params.featured === 'true'
    ? 'Featured Picks'
    : params.trending === 'true'
    ? 'Trending Now'
    : 'The Boutique'

  const filterKey = JSON.stringify(params)

  return (
    <div className="pt-24 min-h-screen bg-[var(--brand-cream)]">
      {/* Editorial header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 relative overflow-hidden">
        <span aria-hidden className="backdrop-word -top-4 text-left">Boutique</span>
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-[var(--brand-rose)] mb-3">Geetham Silks</p>
            <h1 className="font-serif text-4xl lg:text-6xl font-light text-[var(--brand-charcoal)] leading-[1.05]">
              {title}
            </h1>
          </div>
          <p className="text-xs tracking-[0.25em] uppercase text-gray-400 shrink-0 pb-2 tabular-nums">
            {products.length} — {products.length === 1 ? 'Piece' : 'Pieces'}
          </p>
        </div>
      </div>

      {/* Filter bar — sticky beneath the fixed navbar (announcement bar + nav ≈ 96px when condensed) */}
      <div className="sticky top-[96px] z-40">
        <Suspense>
          <ShopFilters categories={categories} collections={collections} />
        </Suspense>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-3xl text-gray-300 mb-3">No pieces found</p>
            <p className="text-sm text-gray-400 mb-8">Try a different filter, or browse the full boutique.</p>
            <LuxButton href="/shop" variant="outline-charcoal" arrow>
              View All Products
            </LuxButton>
          </div>
        ) : (
          <ShopGrid key={filterKey} products={products} />
        )}
      </div>
      <WhatsAppFloat />
    </div>
  )
}
