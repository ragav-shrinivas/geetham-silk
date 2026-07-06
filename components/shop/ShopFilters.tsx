'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category, Collection } from '@/types/database'

type CatNode = Category & { children: Category[] }

interface Props {
  categories: CatNode[]
  collections: Collection[]
}

const QUICK = [
  { label: 'All', param: null, value: null },
  { label: 'New In', param: 'new', value: 'true' },
  { label: 'Featured', param: 'featured', value: 'true' },
  { label: 'Trending', param: 'trending', value: 'true' },
]

const SORTS = [
  { label: 'Curated', value: '' },
  { label: 'Best Selling', value: 'bestselling' },
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price · Low to High', value: 'price-asc' },
  { label: 'Price · High to Low', value: 'price-desc' },
]

/**
 * Luxury horizontal filter bar: tracked-caps pills with animated underline
 * fills, a quiet sort menu, and a clearable search chip. Sticky under the nav.
 */
export default function ShopFilters({ categories, collections }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  const activeCategory = params.get('category')
  const activeCollection = params.get('collection')
  const search = params.get('search')
  const sort = params.get('sort') ?? ''
  const activeQuick = QUICK.find((q) => q.param && params.get(q.param) === q.value)?.label
    ?? (activeCategory || activeCollection || search ? null : 'All')

  function push(next: URLSearchParams) {
    const qs = next.toString()
    router.push(qs ? `/shop?${qs}` : '/shop', { scroll: false })
  }

  function setQuick(param: string | null, value: string | null) {
    const next = new URLSearchParams()
    if (param && value) next.set(param, value)
    if (sort) next.set('sort', sort)
    push(next)
  }

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    push(next)
  }

  const pill = (active: boolean) =>
    cn(
      'group relative shrink-0 pb-1.5 text-[11px] tracking-[0.22em] uppercase transition-colors duration-300 whitespace-nowrap',
      active ? 'text-[var(--brand-rose)]' : 'text-[var(--brand-charcoal)]/60 hover:text-[var(--brand-charcoal)]'
    )

  const underline = (active: boolean) =>
    cn(
      'absolute left-0 bottom-0 h-px w-full bg-[var(--brand-rose)] origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
      active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'
    )

  return (
    <div className="border-y border-[var(--brand-pink)]/25 bg-[var(--brand-cream)]/95 backdrop-blur-sm">
      {/* row 1 — scrollable pills + sort pinned to the right edge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 flex-1 min-w-0">
          {QUICK.map((q) => (
            <button key={q.label} onClick={() => setQuick(q.param, q.value)} className={pill(activeQuick === q.label)}>
              {q.label}
              <span className={underline(activeQuick === q.label)} />
            </button>
          ))}

          {categories.length > 0 && <span className="h-4 w-px bg-[var(--brand-darkpink)]/15 shrink-0" />}

          {categories.map((cat) => {
            const active = activeCategory === cat.slug || cat.children.some((ch) => ch.slug === activeCategory)
            return (
              <button
                key={cat.id}
                onClick={() => setParam('category', active ? null : cat.slug)}
                className={pill(active)}
              >
                {cat.name}
                <span className={underline(active)} />
              </button>
            )
          })}
        </div>

        {/* sort — always visible, outside the scroll row */}
        <div className="relative shrink-0 pl-3 border-l border-[var(--brand-charcoal)]/10">
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value || null)}
            aria-label="Sort products"
            className="appearance-none bg-transparent text-[11px] tracking-[0.2em] uppercase text-[var(--brand-charcoal)]/70 pr-6 py-1 cursor-pointer focus:outline-none hover:text-[var(--brand-charcoal)] transition-colors max-w-[110px] sm:max-w-none truncate"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--brand-charcoal)]/50" />
        </div>
      </div>

      {/* subcategory row — children of the active parent */}
      {(() => {
        const activeParent = categories.find((p) => p.slug === activeCategory || p.children.some((ch) => ch.slug === activeCategory))
        if (!activeParent || activeParent.children.length === 0) return null
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-2 pb-3 -mt-1">
            <button
              onClick={() => setParam('category', activeParent.slug)}
              className={cn(
                'shrink-0 border px-3.5 py-1.5 text-[10px] tracking-[0.2em] uppercase transition-all duration-300',
                activeCategory === activeParent.slug
                  ? 'border-[var(--brand-rose)] bg-[var(--brand-rose)] text-white'
                  : 'border-[var(--brand-charcoal)]/15 text-[var(--brand-charcoal)]/60 hover:border-[var(--brand-rose)]/60 hover:text-[var(--brand-rose)]'
              )}
            >
              All {activeParent.name}
            </button>
            {activeParent.children.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setParam('category', ch.slug)}
                className={cn(
                  'shrink-0 border px-3.5 py-1.5 text-[10px] tracking-[0.2em] uppercase transition-all duration-300',
                  activeCategory === ch.slug
                    ? 'border-[var(--brand-rose)] bg-[var(--brand-rose)] text-white'
                    : 'border-[var(--brand-charcoal)]/15 text-[var(--brand-charcoal)]/60 hover:border-[var(--brand-rose)]/60 hover:text-[var(--brand-rose)]'
                )}
              >
                {ch.name}
              </button>
            ))}
          </div>
        )
      })()}

      {/* row 2 — collections + active search chip (only when relevant) */}
      {(collections.length > 0 || search) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-2 pb-4 -mt-1">
          {search && (
            <button
              onClick={() => setParam('search', null)}
              className="shrink-0 inline-flex items-center gap-2 bg-[var(--brand-rose)] text-white text-[10px] tracking-[0.2em] uppercase px-3.5 py-1.5 hover:bg-[var(--brand-darkpink)] transition-colors"
            >
              &ldquo;{search}&rdquo;
              <X size={11} />
            </button>
          )}
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => setParam('collection', activeCollection === col.slug ? null : col.slug)}
              className={cn(
                'shrink-0 border px-3.5 py-1.5 text-[10px] tracking-[0.2em] uppercase transition-all duration-300',
                activeCollection === col.slug
                  ? 'border-[var(--brand-rose)] bg-[var(--brand-rose)] text-white'
                  : 'border-[var(--brand-charcoal)]/15 text-[var(--brand-charcoal)]/60 hover:border-[var(--brand-rose)]/60 hover:text-[var(--brand-rose)]'
              )}
            >
              {col.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
