'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { useLenis } from 'lenis/react'
import { SlidersHorizontal, ArrowDownUp, X, Check, ChevronDown, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CategoryNode, ShopFacets } from '@/lib/queries'

interface Props {
  categories: CategoryNode[]
  facets: ShopFacets
}

const SORTS: { label: string; value: string }[] = [
  { label: 'Curated', value: '' },
  { label: 'Featured', value: 'featured' },
  { label: 'Best Selling', value: 'bestselling' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Alphabetically, A–Z', value: 'name-asc' },
  { label: 'Alphabetically, Z–A', value: 'name-desc' },
]

const PRICE_BANDS: { label: string; min: number | null; max: number | null }[] = [
  { label: 'Under ₹2,500', min: null, max: 2500 },
  { label: '₹2,500 – ₹5,000', min: 2500, max: 5000 },
  { label: '₹5,000 – ₹7,000', min: 5000, max: 7000 },
  { label: '₹7,000 & Above', min: 7000, max: null },
]

const LUXE = [0.16, 1, 0.3, 1] as const

/**
 * Shop "Filter | Sort" bar + a slide-in filter sidebar (Category / Fabric / Colour /
 * Price / Availability) and a sort bottom-sheet. All facets are real (built from the
 * catalogue) and applied via URL query params — server-filtered, shareable, refresh-safe.
 */
export default function ShopControls({ categories, facets }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const lenis = useLenis()
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const sortDragControls = useDragControls()

  // lock background scroll while an overlay is up (Lenis-aware)
  useEffect(() => {
    const locked = filterOpen || sortOpen
    if (locked) { lenis?.stop(); document.body.style.overflow = 'hidden' }
    else { lenis?.start(); document.body.style.overflow = '' }
    return () => { lenis?.start(); document.body.style.overflow = '' }
  }, [filterOpen, sortOpen, lenis])

  const getList = (key: string) => (params.get(key) ? params.get(key)!.split(',').filter(Boolean) : [])
  const activeMaterials = getList('material')
  const activeColors = getList('color')
  const activeCategory = params.get('category')
  const activeAvailability = params.get('availability')
  const minPrice = params.get('minPrice')
  const maxPrice = params.get('maxPrice')
  const sort = params.get('sort') ?? ''

  const activeCount =
    activeMaterials.length + activeColors.length +
    (activeCategory ? 1 : 0) + (activeAvailability ? 1 : 0) + (minPrice || maxPrice ? 1 : 0)

  function push(next: URLSearchParams) {
    const qs = next.toString()
    router.push(qs ? `/shop?${qs}` : '/shop', { scroll: false })
  }
  function setSingle(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value); else next.delete(key)
    push(next)
  }
  function toggleList(key: string, value: string) {
    const cur = getList(key)
    const nextVals = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
    const next = new URLSearchParams(params.toString())
    if (nextVals.length) next.set(key, nextVals.join(',')); else next.delete(key)
    push(next)
  }
  function setPriceBand(min: number | null, max: number | null) {
    const next = new URLSearchParams(params.toString())
    if (min != null) next.set('minPrice', String(min)); else next.delete('minPrice')
    if (max != null) next.set('maxPrice', String(max)); else next.delete('maxPrice')
    push(next)
  }
  function clearAll() {
    const next = new URLSearchParams(params.toString())
    for (const k of ['category', 'material', 'color', 'minPrice', 'maxPrice', 'availability']) next.delete(k)
    push(next)
  }

  const barBtn = 'flex items-center gap-2 text-sm font-bold tracking-[0.08em] uppercase text-[var(--brand-charcoal)]'

  return (
    <>
      {/* Filter | Sort bar */}
      <div className="border-y-2 border-[var(--brand-pink)]/50 bg-[var(--brand-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <button onClick={() => setFilterOpen(true)} className={barBtn} aria-label="Open filters">
            <SlidersHorizontal size={18} strokeWidth={2.4} />
            Filter
            {activeCount > 0 && (
              <span className="ml-0.5 min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--brand-darkpink)] text-white text-[11px] font-bold flex items-center justify-center tabular-nums">
                {activeCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-[var(--brand-charcoal)]/20" />

          <button onClick={() => setSortOpen(true)} className={cn(barBtn, 'justify-end')} aria-label="Open sort options">
            <ArrowDownUp size={17} strokeWidth={2.4} />
            {SORTS.find((s) => s.value === sort)?.label ?? 'Sort'}
            <ChevronDown size={15} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* ───────── Filter sidebar ───────── */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[95] bg-black/50" onClick={() => setFilterOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: LUXE }}
              drag="x"
              dragConstraints={{ left: -140, right: 0 }}
              dragElastic={{ left: 0.15, right: 0 }}
              dragSnapToOrigin
              onDragEnd={(_, info) => {
                if (info.offset.x < -70 || info.velocity.x < -500) setFilterOpen(false)
              }}
              className="fixed left-0 top-0 z-[96] h-[100dvh] w-[86vw] max-w-[380px] bg-white shadow-2xl flex flex-col touch-pan-y"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b-2 border-[var(--brand-pink)]/40 shrink-0">
                <h2 className="font-serif text-2xl font-semibold text-[var(--brand-charcoal)]">Filters</h2>
                <button onClick={() => setFilterOpen(false)} aria-label="Close filters" className="p-1.5 text-[var(--brand-charcoal)]"><X size={24} strokeWidth={2.2} /></button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain">
                <Section title="Category" defaultOpen>
                  <ul className="space-y-1">
                    {categories.map((parent) => (
                      <li key={parent.id}>
                        <FacetRow label={parent.name} active={activeCategory === parent.slug} onClick={() => setSingle('category', activeCategory === parent.slug ? null : parent.slug)} bold />
                        {parent.children.length > 0 && (
                          <ul className="ml-3 mt-0.5 border-l-2 border-[var(--brand-pink)]/40 pl-3 space-y-0.5">
                            {parent.children.map((ch) => (
                              <li key={ch.id}>
                                <FacetRow label={ch.name} active={activeCategory === ch.slug} onClick={() => setSingle('category', activeCategory === ch.slug ? null : ch.slug)} />
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </Section>

                {facets.materials.length > 0 && (
                  <Section title="Fabric" defaultOpen>
                    {facets.materials.map((m) => (
                      <CheckRow key={m.value} label={m.value} count={m.count} checked={activeMaterials.includes(m.value)} onClick={() => toggleList('material', m.value)} />
                    ))}
                  </Section>
                )}

                {facets.colors.length > 0 && (
                  <Section title="Colour" defaultOpen>
                    {facets.colors.map((c) => (
                      <CheckRow key={c.value} label={c.value} count={c.count} checked={activeColors.includes(c.value)} onClick={() => toggleList('color', c.value)} swatch={c.value} />
                    ))}
                  </Section>
                )}

                <Section title="Price" defaultOpen>
                  {PRICE_BANDS.map((b) => {
                    const active = String(b.min ?? '') === (minPrice ?? '') && String(b.max ?? '') === (maxPrice ?? '')
                    return <FacetRow key={b.label} label={b.label} active={active} onClick={() => (active ? setPriceBand(null, null) : setPriceBand(b.min, b.max))} radio />
                  })}
                </Section>

                <Section title="Availability" defaultOpen>
                  <FacetRow label={`In stock (${facets.inStock})`} active={activeAvailability === 'in'} onClick={() => setSingle('availability', activeAvailability === 'in' ? null : 'in')} radio />
                  <FacetRow label={`Out of stock (${facets.outOfStock})`} active={activeAvailability === 'out'} onClick={() => setSingle('availability', activeAvailability === 'out' ? null : 'out')} radio />
                </Section>
              </div>

              <div className="shrink-0 border-t-2 border-[var(--brand-pink)]/40 p-4 flex items-center gap-3">
                <button onClick={clearAll} className="flex-1 h-12 border-2 border-[var(--brand-charcoal)] text-[var(--brand-charcoal)] text-sm font-bold tracking-[0.1em] uppercase">Clear All</button>
                <button onClick={() => setFilterOpen(false)} className="flex-1 h-12 bg-[var(--brand-darkpink)] text-white text-sm font-bold tracking-[0.1em] uppercase hover:bg-[var(--brand-darkpink-deep)] transition-colors">View Results</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ───────── Sort bottom sheet ───────── */}
      <AnimatePresence>
        {sortOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[95] bg-black/50" onClick={() => setSortOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ duration: 0.38, ease: LUXE }}
              drag="y"
              dragControls={sortDragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 220 }}
              dragElastic={{ top: 0, bottom: 0.2 }}
              dragSnapToOrigin
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 500) setSortOpen(false)
              }}
              className="fixed inset-x-0 bottom-0 z-[96] bg-white rounded-t-2xl shadow-2xl max-h-[80dvh] flex flex-col"
            >
              {/* drag handle — only the grabber bar starts the drag, so the close
                  button's tap always registers cleanly; list below is native-scroll */}
              <div
                onPointerDown={(e) => sortDragControls.start(e)}
                className="shrink-0 pt-2.5 pb-2 cursor-grab active:cursor-grabbing touch-none"
              >
                <div className="mx-auto h-1.5 w-11 rounded-full bg-[var(--brand-charcoal)]/25" aria-hidden />
              </div>
              <div className="flex items-center justify-between px-5 h-14 border-b-2 border-[var(--brand-pink)]/40 shrink-0">
                <h2 className="font-serif text-xl font-semibold text-[var(--brand-charcoal)]">Sort By</h2>
                <button onClick={() => setSortOpen(false)} aria-label="Close sort" className="p-1.5 text-[var(--brand-charcoal)]"><X size={22} strokeWidth={2.2} /></button>
              </div>
              <ul className="overflow-y-auto py-1">
                {SORTS.map((s) => {
                  const active = s.value === sort
                  return (
                    <li key={s.value || 'curated'}>
                      <button
                        onClick={() => { setSingle('sort', s.value || null); setSortOpen(false) }}
                        className={cn('w-full flex items-center justify-between px-5 py-3.5 text-left text-[15px]', active ? 'font-bold text-[var(--brand-darkpink)] bg-[var(--brand-cream)]' : 'font-semibold text-[var(--brand-charcoal)]')}
                      >
                        {s.label}
                        {active && <Check size={18} strokeWidth={2.6} />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ---- building blocks ---- */

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b-2 border-[var(--brand-pink)]/30">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-[var(--brand-charcoal)]">{title}</span>
        {open ? <Minus size={18} strokeWidth={2.6} className="text-[var(--brand-charcoal)]" /> : <Plus size={18} strokeWidth={2.6} className="text-[var(--brand-charcoal)]" />}
      </button>
      {open && <div className="px-5 pb-4 -mt-1">{children}</div>}
    </div>
  )
}

function FacetRow({ label, active, onClick, radio = false, bold = false }: { label: string; active: boolean; onClick: () => void; radio?: boolean; bold?: boolean }) {
  return (
    <button onClick={onClick} className={cn('w-full flex items-center gap-2.5 py-2 text-left text-[15px] transition-colors', active ? 'text-[var(--brand-darkpink)] font-bold' : bold ? 'text-[var(--brand-charcoal)] font-bold' : 'text-[var(--brand-charcoal)] font-semibold')}>
      {radio && <span className={cn('h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center', active ? 'border-[var(--brand-darkpink)]' : 'border-[var(--brand-charcoal)]/50')}>{active && <span className="h-2 w-2 rounded-full bg-[var(--brand-darkpink)]" />}</span>}
      {label}
    </button>
  )
}

function CheckRow({ label, count, checked, onClick, swatch }: { label: string; count: number; checked: boolean; onClick: () => void; swatch?: string }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2.5 py-2 text-left">
      <span className={cn('h-[18px] w-[18px] rounded border-2 shrink-0 flex items-center justify-center transition-colors', checked ? 'bg-[var(--brand-darkpink)] border-[var(--brand-darkpink)]' : 'border-[var(--brand-charcoal)]/50')}>
        {checked && <Check size={13} strokeWidth={3} className="text-white" />}
      </span>
      {swatch && <span className="h-4 w-4 rounded-full border border-black/15 shrink-0" style={{ backgroundColor: cssColor(swatch) }} />}
      <span className={cn('flex-1 text-[15px]', checked ? 'font-bold text-[var(--brand-darkpink)]' : 'font-semibold text-[var(--brand-charcoal)]')}>{label}</span>
      <span className="text-[13px] font-semibold text-[var(--brand-charcoal)]/70 tabular-nums">{count}</span>
    </button>
  )
}

/** best-effort colour swatch from a colour name */
function cssColor(name: string): string {
  const n = name.trim().toLowerCase()
  const map: Record<string, string> = { 'half white': '#f3efe6', 'off white': '#f3efe6', cream: '#f3efe6', maroon: '#7a2440' }
  return map[n] ?? n
}
