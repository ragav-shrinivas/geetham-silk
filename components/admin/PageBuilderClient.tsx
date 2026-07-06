'use client'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, Eye, EyeOff, Pencil, X, ExternalLink,
  Film, Image as ImageIcon, LayoutGrid, Quote, Sparkles, Type, ShoppingBag, MessageSquareQuote, Star,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MediaPicker from '@/components/admin/MediaPicker'
import { cn } from '@/lib/utils'
import type { PageSection, MediaAsset, Json } from '@/types/database'

/* ---------- Section metadata: labels + editable fields per section ---------- */

type FieldType = 'text' | 'textarea' | 'number' | 'list' | 'media' | 'media-video' | 'media-image'

interface FieldSpec {
  key: string
  label: string
  type: FieldType
  help?: string
  min?: number
  max?: number
}

interface SectionMeta {
  label: string
  desc: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  fields: FieldSpec[]
  /** deep link to a dedicated admin screen that manages this section's content */
  manageHref?: string
  manageLabel?: string
}

const SECTION_META: Record<string, SectionMeta> = {
  hero: {
    label: 'Hero Slider',
    desc: 'Cinematic opening slideshow',
    icon: Film,
    fields: [
      { key: 'duration_ms', label: 'Slide duration (milliseconds)', type: 'number', min: 2000, max: 20000, help: '7000 = 7 seconds per slide. Minimum 2000.' },
    ],
    manageHref: '/evo9-admin/hero',
    manageLabel: 'Manage slides',
  },
  marquee: {
    label: 'Brand Marquee',
    desc: 'Scrolling strip of phrases',
    icon: Type,
    fields: [
      { key: 'items', label: 'Phrases (one per line)', type: 'list' },
    ],
  },
  categories: {
    label: 'Signature Collections',
    desc: 'The four category model cards',
    icon: LayoutGrid,
    fields: [],
    manageHref: '/evo9-admin/categories',
    manageLabel: 'Manage categories',
  },
  featured: {
    label: 'Featured Picks',
    desc: 'Editorial spread of featured products',
    icon: Sparkles,
    fields: [
      { key: 'limit', label: 'Number of products', type: 'number', min: 2, max: 12 },
    ],
    manageHref: '/evo9-admin/products',
    manageLabel: 'Manage products',
  },
  bestsellers: {
    label: 'Best Selling Products',
    desc: 'Most-loved products carousel',
    icon: Star,
    fields: [
      { key: 'limit', label: 'Max products to show', type: 'number', min: 2, max: 20 },
    ],
    manageHref: '/evo9-admin/products?filter=bestseller',
    manageLabel: 'Manage best sellers',
  },
  story: {
    label: 'Brand Story Strip',
    desc: 'Image + pull-quote with store values',
    icon: Quote,
    fields: [],
  },
  arrivals: {
    label: 'New Arrivals Rail',
    desc: 'Sideways-scrolling product rail',
    icon: ShoppingBag,
    fields: [
      { key: 'limit', label: 'Number of products', type: 'number', min: 2, max: 12 },
    ],
    manageHref: '/evo9-admin/products',
    manageLabel: 'Manage products',
  },
  testimonials: {
    label: 'Customer Reviews',
    desc: 'Rotating editorial quotes',
    icon: MessageSquareQuote,
    fields: [],
    manageHref: '/evo9-admin/testimonials',
    manageLabel: 'Manage reviews',
  },
  banners: {
    label: 'Promo Banners',
    desc: 'Scheduled promotional banner strip',
    icon: ImageIcon,
    fields: [],
    manageHref: '/evo9-admin/banners',
    manageLabel: 'Manage banners',
  },
  trending: {
    label: 'Trending Now',
    desc: 'Carousel of trending products',
    icon: Star,
    fields: [{ key: 'limit', label: 'Number of products', type: 'number', min: 2, max: 12 }],
    manageHref: '/evo9-admin/products?filter=all',
    manageLabel: 'Manage products',
  },
  discovery: {
    label: 'Explore Our Collection',
    desc: 'Shuffled all-category product grid',
    icon: Star,
    fields: [],
    manageHref: '/evo9-admin/products',
    manageLabel: 'Manage products',
  },
  recently: {
    label: 'Recently Viewed',
    desc: 'Each visitor’s recently viewed products',
    icon: Star,
    fields: [],
  },
  store: {
    label: 'Visit Our Store',
    desc: 'Map preview + address with directions',
    icon: ImageIcon,
    fields: [],
  },
  trust: {
    label: 'Trust & Service Strip',
    desc: 'Free shipping · secure payments · quality · support',
    icon: Star,
    fields: [],
  },
}

/* ---------- Builder ---------- */

export default function PageBuilderClient() {
  const [sections, setSections] = useState<PageSection[]>([])
  const [editing, setEditing] = useState<PageSection | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const load = useCallback(async () => {
    const supabase = createAdminClient()
    const { data } = await supabase.from('page_sections').select('*').eq('page', 'home').order('display_order')
    setSections((data ?? []) as PageSection[])
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  function flashSaved() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)
    const next = arrayMove(sections, oldIndex, newIndex)
    setSections(next)

    const supabase = createAdminClient()
    await Promise.all(
      next.map((s, i) =>
        supabase.from('page_sections').update({ display_order: i, updated_at: new Date().toISOString() }).eq('id', s.id)
      )
    )
    flashSaved()
  }

  async function toggleVisible(section: PageSection) {
    const next = !section.is_visible
    setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, is_visible: next } : s)))
    const supabase = createAdminClient()
    await supabase.from('page_sections').update({ is_visible: next, updated_at: new Date().toISOString() }).eq('id', section.id)
    flashSaved()
  }

  async function saveSettings(section: PageSection, settings: Record<string, unknown>) {
    setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, settings: settings as Json } : s)))
    const supabase = createAdminClient()
    await supabase.from('page_sections').update({ settings, updated_at: new Date().toISOString() }).eq('id', section.id)
    setEditing(null)
    flashSaved()
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Page Builder</h1>
        <span
          className={cn(
            'text-xs px-3 py-1.5 rounded-full transition-opacity duration-300',
            saved ? 'opacity-100 bg-green-50 text-green-600' : 'opacity-0'
          )}
        >
          Saved ✓
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-7">
        Drag to reorder the homepage. Toggle the eye to show or hide a section. Changes go live within a minute.
      </p>

      {loading ? (
        <p className="text-sm text-gray-400 py-10">Loading sections…</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2.5">
              {sections.map((section, i) => (
                <SortableSectionCard
                  key={section.id}
                  section={section}
                  index={i}
                  onToggle={() => toggleVisible(section)}
                  onEdit={() => setEditing(section)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {editing && (
        <SettingsDrawer
          section={editing}
          onClose={() => setEditing(null)}
          onSave={(settings) => saveSettings(editing, settings)}
        />
      )}
    </div>
  )
}

/* ---------- Sortable card ---------- */

function SortableSectionCard({
  section, index, onToggle, onEdit,
}: {
  section: PageSection
  index: number
  onToggle: () => void
  onEdit: () => void
}) {
  const meta = SECTION_META[section.section_key] ?? {
    label: section.section_key, desc: '', icon: ImageIcon, fields: [],
  }
  const Icon = meta.icon
  const hasSettings = meta.fields.length > 0 || meta.manageHref

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 bg-white border rounded-lg px-4 py-3.5 select-none',
        isDragging ? 'border-[var(--brand-rose)] shadow-lg z-10 relative' : 'border-gray-100 shadow-sm',
        !section.is_visible && 'opacity-55'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none p-1 -ml-1"
      >
        <GripVertical size={17} />
      </button>

      <span className="text-xs text-gray-300 tabular-nums w-5">{String(index + 1).padStart(2, '0')}</span>

      <span className="w-8 h-8 rounded bg-[var(--brand-pink)]/15 text-[var(--brand-rose)] flex items-center justify-center shrink-0">
        <Icon size={15} />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--brand-charcoal)] leading-tight">{meta.label}</p>
        <p className="text-xs text-gray-400 truncate">{meta.desc}</p>
      </div>

      {hasSettings && (
        <button
          onClick={onEdit}
          aria-label={`Edit ${meta.label}`}
          className="p-2 text-gray-400 hover:text-[var(--brand-rose)] transition-colors"
        >
          <Pencil size={15} />
        </button>
      )}

      <button
        onClick={onToggle}
        aria-label={section.is_visible ? `Hide ${meta.label}` : `Show ${meta.label}`}
        className={cn(
          'p-2 transition-colors',
          section.is_visible ? 'text-[var(--brand-rose)]' : 'text-gray-300 hover:text-gray-500'
        )}
      >
        {section.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
    </div>
  )
}

/* ---------- Settings drawer ---------- */

function SettingsDrawer({
  section, onClose, onSave,
}: {
  section: PageSection
  onClose: () => void
  onSave: (settings: Record<string, unknown>) => void
}) {
  const meta = SECTION_META[section.section_key]
  const initial = (section.settings && typeof section.settings === 'object' && !Array.isArray(section.settings)
    ? section.settings
    : {}) as Record<string, unknown>
  const [form, setForm] = useState<Record<string, unknown>>({ ...initial })
  const [picker, setPicker] = useState<FieldSpec | null>(null)
  const [saving, setSaving] = useState(false)

  function set(key: string, value: unknown) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    // coerce numbers + drop empties
    const cleaned: Record<string, unknown> = { ...form }
    for (const f of meta.fields) {
      const v = cleaned[f.key]
      if (f.type === 'number' && v !== undefined && v !== '') {
        let n = Number(v)
        if (Number.isNaN(n)) { delete cleaned[f.key]; continue }
        if (f.min !== undefined) n = Math.max(f.min, n)
        if (f.max !== undefined) n = Math.min(f.max, n)
        cleaned[f.key] = n
      }
      if (v === '' || v === undefined) delete cleaned[f.key]
    }
    onSave(cleaned)
  }

  function onPick(asset: MediaAsset) {
    if (picker) set(picker.key, asset.url)
  }

  return (
    <div className="fixed inset-0 z-[65] flex justify-end">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-medium text-[var(--brand-charcoal)]">{meta.label}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{meta.desc}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {meta.manageHref && (
            <Link
              href={meta.manageHref}
              className="flex items-center justify-between gap-2 bg-[var(--brand-pink)]/10 border border-[var(--brand-pink)]/30 rounded-md px-4 py-3 text-sm text-[var(--brand-rose)] hover:bg-[var(--brand-pink)]/20 transition-colors"
            >
              {meta.manageLabel ?? 'Manage content'}
              <ExternalLink size={14} />
            </Link>
          )}

          {meta.fields.map((f) => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              {f.type === 'text' && (
                <Input
                  className="mt-1.5"
                  value={(form[f.key] as string) ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
              {f.type === 'textarea' && (
                <textarea
                  rows={3}
                  value={(form[f.key] as string) ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="mt-1.5 flex w-full border border-[var(--brand-pink)] bg-white px-3 py-2 text-sm text-[var(--brand-charcoal)] focus:outline-none focus:border-[var(--brand-rose)] focus:ring-1 focus:ring-[var(--brand-rose)] rounded-none resize-none"
                />
              )}
              {f.type === 'number' && (
                <Input
                  className="mt-1.5"
                  type="number"
                  min={f.min}
                  max={f.max}
                  value={form[f.key] !== undefined ? String(form[f.key]) : ''}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
              {f.type === 'list' && (
                <textarea
                  rows={6}
                  value={Array.isArray(form[f.key]) ? (form[f.key] as string[]).join('\n') : ''}
                  onChange={(e) => set(f.key, e.target.value.split('\n').map((l) => l.trim()).filter(Boolean))}
                  className="mt-1.5 flex w-full border border-[var(--brand-pink)] bg-white px-3 py-2 text-sm text-[var(--brand-charcoal)] focus:outline-none focus:border-[var(--brand-rose)] focus:ring-1 focus:ring-[var(--brand-rose)] rounded-none resize-none"
                />
              )}
              {(f.type === 'media' || f.type === 'media-video' || f.type === 'media-image') && (
                <div className="mt-1.5 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={(form[f.key] as string) ?? ''}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.type === 'media-video' ? '/silkvideo1.mp4 or library URL' : 'Image URL'}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 h-auto"
                      onClick={() => setPicker(f)}
                    >
                      Library
                    </Button>
                  </div>
                </div>
              )}
              {f.help && <p className="text-[11px] text-gray-400 mt-1.5">{f.help}</p>}
            </div>
          ))}

          {meta.fields.length === 0 && !meta.manageHref && (
            <p className="text-sm text-gray-400">
              This section has no editable settings yet — use the eye toggle to show or hide it.
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <Button variant="rose" className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>

      <MediaPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        onSelect={onPick}
        accept={picker?.type === 'media-video' ? 'video' : picker?.type === 'media-image' ? 'image' : 'all'}
      />
    </div>
  )
}
