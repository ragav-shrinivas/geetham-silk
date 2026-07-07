import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getProducts, getCategories, getCategoryTree, getCollections, type ProductSort } from '@/lib/queries'
import { formatPrice } from '@/lib/utils'
import ShopFilters from '@/components/shop/ShopFilters'
import ShopGrid from '@/components/shop/ShopGrid'
import LuxButton from '@/components/ui/lux-button'
import PageNav from '@/components/common/PageNav'
import type { Crumb } from '@/components/common/Breadcrumbs'
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
  minPrice?: string
  maxPrice?: string
}

const VALID_SORTS: ProductSort[] = ['featured', 'newest', 'price-asc', 'price-desc', 'bestselling']

/** parse a positive number from a query param, else undefined */
function num(v?: string) {
  const n = v != null ? Number(v) : NaN
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const sort = VALID_SORTS.includes(params.sort as ProductSort) ? (params.sort as ProductSort) : undefined
  const minPrice = num(params.minPrice)
  const maxPrice = num(params.maxPrice)

  const [products, categories, categoryTree, collections] = await Promise.all([
    getProducts({
      categorySlug: params.category,
      collectionSlug: params.collection,
      featured: params.featured === 'true',
      trending: params.trending === 'true',
      newArrival: params.new === 'true',
      search: params.search,
      sort,
      minPrice,
      maxPrice,
    }),
    getCategories(),
    getCategoryTree(),
    getCollections(),
  ])

  const priceLabel = (minPrice != null || maxPrice != null)
    ? (maxPrice != null && minPrice == null
        ? `Under ${formatPrice(maxPrice)}`
        : minPrice != null && maxPrice == null
          ? `${formatPrice(minPrice)} & Above`
          : `${formatPrice(minPrice!)} – ${formatPrice(maxPrice!)}`)
    : null

  const title = params.search
    ? `Results for “${params.search}”`
    : params.category
    ? categories.find((c) => c.slug === params.category)?.name ?? 'Shop All'
    : params.collection
    ? collections.find((c) => c.slug === params.collection)?.name ?? 'Shop All'
    : params.new === 'true'
    ? 'New Arrivals'
    : params.featured === 'true'
    ? 'Featured Picks'
    : params.trending === 'true'
    ? 'Trending Now'
    : priceLabel
    ? priceLabel
    : 'Shop All'

  const filterKey = JSON.stringify(params)

  // Breadcrumb trail — Home > Shop, plus the active filter as the leaf when present.
  const isFiltered = !!(params.search || params.category || params.collection || params.new === 'true' || params.featured === 'true' || params.trending === 'true' || priceLabel)
  const crumbs: Crumb[] = isFiltered
    ? [{ label: 'Shop', href: '/shop' }, { label: title }]
    : [{ label: 'Shop' }]

  return (
    <div className="min-h-screen bg-[var(--brand-cream)]">
      {/* Page header — readable, no washed-out backdrop word */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-7 relative">
        <PageNav fallback="/" backLabel="Home" crumbs={crumbs} className="mb-6" />
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-[11px] tracking-[0.32em] uppercase text-[var(--brand-gold)] font-medium mb-2.5">Geethams Silks</p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[var(--brand-charcoal)] leading-[1.08]">
              {title}
            </h1>
          </div>
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--brand-charcoal)]/55 shrink-0 pb-2 tabular-nums">
            {products.length} {products.length === 1 ? 'Piece' : 'Pieces'}
          </p>
        </div>
      </div>

      {/* Filter bar — sticks just beneath the sticky header stack (mobile ≈93px; desktop ≈150px with the nav strip) */}
      <div className="sticky top-[93px] lg:top-[150px] z-40">
        <Suspense>
          <ShopFilters categories={categoryTree} collections={collections} />
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
