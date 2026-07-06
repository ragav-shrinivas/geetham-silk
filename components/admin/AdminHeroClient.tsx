'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, X, Check, Upload, ChevronUp, ChevronDown, Eye, EyeOff, Film, ImageIcon, GripVertical } from 'lucide-react'

interface Slide {
  id: string
  title: string | null
  subtitle: string | null
  media_type: 'image' | 'video'
  media_url: string | null
  poster_url: string | null
  cta_primary_label: string | null
  cta_primary_link: string | null
  cta_secondary_label: string | null
  cta_secondary_link: string | null
  overlay_opacity: number
  is_active: boolean
  display_order: number
  focal_x: number
  focal_y: number
}

const EMPTY = {
  title: '', subtitle: '', media_type: 'image' as 'image' | 'video', media_url: null as string | null,
  poster_url: null as string | null, cta_primary_label: 'Explore Collections', cta_primary_link: '/collections',
  cta_secondary_label: 'Enquire on WhatsApp', cta_secondary_link: '', overlay_opacity: 0.45,
  is_active: true, display_order: 0, focal_x: 50, focal_y: 50,
}

export default function AdminHeroClient() {
  const [items, setItems] = useState<Slide[]>([])
  const [editing, setEditing] = useState<Slide | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState('')
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState('')
  const mediaRef = useRef<HTMLInputElement>(null)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('hero_slides').select('*').order('display_order')
    setItems((data ?? []) as Slide[])
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm({ ...EMPTY, display_order: items.length })
    setMediaFile(null); setMediaPreview(''); setPosterFile(null); setPosterPreview(''); setIsNew(true)
  }
  function openEdit(s: Slide) {
    setEditing(s)
    setForm({
      title: s.title ?? '', subtitle: s.subtitle ?? '', media_type: s.media_type, media_url: s.media_url,
      poster_url: s.poster_url, cta_primary_label: s.cta_primary_label ?? '', cta_primary_link: s.cta_primary_link ?? '',
      cta_secondary_label: s.cta_secondary_label ?? '', cta_secondary_link: s.cta_secondary_link ?? '',
      overlay_opacity: s.overlay_opacity, is_active: s.is_active, display_order: s.display_order,
      focal_x: s.focal_x ?? 50, focal_y: s.focal_y ?? 50,
    })
    setMediaFile(null); setMediaPreview(''); setPosterFile(null); setPosterPreview(''); setIsNew(false)
  }
  function closeForm() { setEditing(null); setIsNew(false) }

  function handleMedia(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setMediaFile(f)
    setForm((p) => ({ ...p, media_type: f.type.startsWith('video') ? 'video' : 'image' }))
    const r = new FileReader(); r.onload = (ev) => setMediaPreview(ev.target?.result as string); r.readAsDataURL(f)
  }
  function handlePoster(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setPosterFile(f)
    const r = new FileReader(); r.onload = (ev) => setPosterPreview(ev.target?.result as string); r.readAsDataURL(f)
  }

  async function uploadTo(file: File, prefix: string): Promise<string | null> {
    const supabase = createClient()
    const path = `${prefix}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const { error } = await supabase.storage.from('hero-media').upload(path, file, { upsert: true, contentType: file.type })
    if (error) return null
    return supabase.storage.from('hero-media').getPublicUrl(path).data.publicUrl
  }

  async function handleSave() {
    setSaving(true)
    let media_url = form.media_url
    let poster_url = form.poster_url

    if (mediaFile) {
      setProgress('Uploading media…')
      const url = await uploadTo(mediaFile, 'slides')
      if (!url) { setProgress('Media upload failed.'); setSaving(false); return }
      media_url = url
    }
    if (posterFile) {
      setProgress('Uploading poster…')
      const url = await uploadTo(posterFile, 'posters')
      if (url) poster_url = url
    }

    setProgress('Saving…')
    const supabase = createClient()
    const payload = {
      title: form.title || null, subtitle: form.subtitle || null, media_type: form.media_type,
      media_url, poster_url, cta_primary_label: form.cta_primary_label || null,
      cta_primary_link: form.cta_primary_link || null, cta_secondary_label: form.cta_secondary_label || null,
      cta_secondary_link: form.cta_secondary_link || null, overlay_opacity: form.overlay_opacity,
      is_active: form.is_active, display_order: form.display_order,
      focal_x: form.focal_x, focal_y: form.focal_y,
    }
    if (editing) await supabase.from('hero_slides').update(payload).eq('id', editing.id)
    else await supabase.from('hero_slides').insert(payload)

    setSaving(false); setProgress(''); closeForm(); load()
  }

  async function toggleActive(s: Slide) {
    const supabase = createClient()
    await supabase.from('hero_slides').update({ is_active: !s.is_active }).eq('id', s.id); load()
  }

  async function handleDelete(s: Slide) {
    if (!confirm('Delete this slide?')) return
    const supabase = createClient()
    for (const url of [s.media_url, s.poster_url]) {
      if (url && url.includes('/hero-media/')) {
        const path = url.split('/hero-media/')[1]
        if (path) await supabase.storage.from('hero-media').remove([path])
      }
    }
    await supabase.from('hero_slides').delete().eq('id', s.id); load()
  }

  // Persist the current list order as 0..n display_order values.
  async function persistOrder(list: Slide[]) {
    const supabase = createClient()
    await Promise.all(list.map((s, idx) => supabase.from('hero_slides').update({ display_order: idx }).eq('id', s.id)))
  }

  // Keyboard-accessible up/down fallback.
  async function move(index: number, dir: -1 | 1) {
    const other = index + dir
    if (other < 0 || other >= items.length) return
    const next = arrayMove(items, index, other)
    setItems(next)                 // optimistic
    await persistOrder(next)
    load()
  }

  // Drag-and-drop reorder (pointer + keyboard sensors).
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((s) => s.id === active.id)
    const newIndex = items.findIndex((s) => s.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(items, oldIndex, newIndex)
    setItems(next)                 // optimistic
    await persistOrder(next)
    load()
  }

  const showForm = isNew || !!editing
  const inputCls = 'mt-1.5'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Hero Slider</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the homepage hero slides — images, videos, headlines & buttons.</p>
        </div>
        <Button variant="rose" size="sm" className="gap-2" onClick={openNew}><Plus size={14} />Add Slide</Button>
      </div>

      {showForm && (
        <div className="bg-white border border-[var(--brand-pink)]/30 rounded-lg p-6 mb-6 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-gray-700">{editing ? 'Edit Slide' : 'New Slide'}</h2>
            <button onClick={closeForm}><X size={16} className="text-gray-400" /></button>
          </div>

          {/* Media upload */}
          <div>
            <Label>Background Media (image or video)</Label>
            <div className="mt-1.5 flex gap-4 items-start flex-wrap">
              {(mediaPreview || form.media_url) && (
                <div className="relative w-40 h-24 flex-shrink-0 bg-gray-100 overflow-hidden rounded">
                  {form.media_type === 'video' ? (
                    <video src={mediaPreview || form.media_url || ''} className="w-full h-full object-cover" style={{ objectPosition: `${form.focal_x}% ${form.focal_y}%` }} muted />
                  ) : (
                    <Image src={mediaPreview || form.media_url || ''} alt="" fill className="object-cover" style={{ objectPosition: `${form.focal_x}% ${form.focal_y}%` }} />
                  )}
                  {/* focal crosshair */}
                  <span className="pointer-events-none absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full border-2 border-white shadow ring-1 ring-black/40" style={{ left: `${form.focal_x}%`, top: `${form.focal_y}%` }} />
                  <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    {form.media_type === 'video' ? <Film size={9} /> : <ImageIcon size={9} />}{form.media_type}
                  </span>
                </div>
              )}
              <label className="flex items-center gap-2 border border-dashed border-gray-200 px-4 py-2 cursor-pointer hover:border-[var(--brand-pink)] text-sm text-gray-500">
                <Upload size={14} /> Upload Media
                <input ref={mediaRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" onChange={handleMedia} className="sr-only" />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Tip: leave empty to use an elegant gradient background. Videos up to ~75MB.</p>
          </div>

          {/* Poster for video */}
          {form.media_type === 'video' && (
            <div>
              <Label>Poster image (shown on slow connections)</Label>
              <div className="mt-1.5 flex gap-4 items-center">
                {(posterPreview || form.poster_url) && (
                  <div className="relative w-24 h-16 flex-shrink-0 bg-gray-100 overflow-hidden rounded">
                    <Image src={posterPreview || form.poster_url || ''} alt="" fill className="object-cover" />
                  </div>
                )}
                <label className="flex items-center gap-2 border border-dashed border-gray-200 px-4 py-2 cursor-pointer hover:border-[var(--brand-pink)] text-sm text-gray-500">
                  <Upload size={14} /> Upload Poster
                  <input type="file" accept="image/*" onChange={handlePoster} className="sr-only" />
                </label>
              </div>
            </div>
          )}

          {/* Text */}
          <div className="grid grid-cols-1 gap-4">
            <div><Label>Headline</Label><Input className={inputCls} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></div>
            <div>
              <Label>Subtitle</Label>
              <textarea value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} rows={2}
                className="mt-1.5 flex w-full border border-[var(--brand-pink)] bg-white px-3 py-2 text-sm text-[var(--brand-charcoal)] focus:outline-none focus:border-[var(--brand-rose)] focus:ring-1 focus:ring-[var(--brand-rose)] rounded-none resize-none" />
            </div>
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Primary button label</Label><Input className={inputCls} value={form.cta_primary_label} onChange={(e) => setForm((p) => ({ ...p, cta_primary_label: e.target.value }))} /></div>
            <div><Label>Primary button link</Label><Input className={inputCls} value={form.cta_primary_link} onChange={(e) => setForm((p) => ({ ...p, cta_primary_link: e.target.value }))} placeholder="/collections" /></div>
            <div><Label>Secondary button label</Label><Input className={inputCls} value={form.cta_secondary_label} onChange={(e) => setForm((p) => ({ ...p, cta_secondary_label: e.target.value }))} /></div>
            <div><Label>Secondary button link</Label><Input className={inputCls} value={form.cta_secondary_link} onChange={(e) => setForm((p) => ({ ...p, cta_secondary_link: e.target.value }))} placeholder="leave empty for WhatsApp" /></div>
          </div>

          {/* Overlay + active */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <Label>Overlay darkness ({Math.round(form.overlay_opacity * 100)}%)</Label>
              <input type="range" min="0" max="0.8" step="0.05" value={form.overlay_opacity}
                onChange={(e) => setForm((p) => ({ ...p, overlay_opacity: parseFloat(e.target.value) }))}
                className="mt-3 w-full accent-[var(--brand-rose)]" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer pt-5">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 accent-[var(--brand-rose)]" />
              <span className="text-sm text-gray-600">Active (visible on site)</span>
            </label>
          </div>

          {/* Focal point — keeps portrait creatives framed on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Horizontal focus ({form.focal_x}%)</Label>
              <input type="range" min="0" max="100" step="1" value={form.focal_x}
                onChange={(e) => setForm((p) => ({ ...p, focal_x: parseInt(e.target.value, 10) }))}
                className="mt-3 w-full accent-[var(--brand-rose)]" />
            </div>
            <div>
              <Label>Vertical focus ({form.focal_y}%)</Label>
              <input type="range" min="0" max="100" step="1" value={form.focal_y}
                onChange={(e) => setForm((p) => ({ ...p, focal_y: parseInt(e.target.value, 10) }))}
                className="mt-3 w-full accent-[var(--brand-rose)]" />
            </div>
            <p className="text-xs text-gray-400 sm:col-span-2 -mt-1">Focus point for portrait / off-centre photos on mobile. The crosshair on the preview shows where the image stays anchored.</p>
          </div>

          <div className="flex gap-3 items-center">
            <Button type="button" variant="rose" size="sm" onClick={handleSave} disabled={saving} className="gap-2"><Check size={13} />{saving ? 'Saving…' : 'Save Slide'}</Button>
            <Button type="button" variant="outline" size="sm" onClick={closeForm}>Cancel</Button>
            {progress && <span className="text-xs text-gray-500">{progress}</span>}
          </div>
        </div>
      )}

      {/* List — drag to reorder, or use the arrow buttons (keyboard-accessible) */}
      {items.length === 0 ? (
        <p className="text-center py-12 text-gray-400 text-sm bg-white rounded-lg border">No slides yet. Add your first hero slide.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((s, i) => (
                <SortableSlideRow
                  key={s.id}
                  slide={s}
                  index={i}
                  total={items.length}
                  onMove={move}
                  onToggle={toggleActive}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function SortableSlideRow({
  slide: s, index: i, total, onMove, onToggle, onEdit, onDelete,
}: {
  slide: Slide; index: number; total: number
  onMove: (i: number, d: -1 | 1) => void
  onToggle: (s: Slide) => void
  onEdit: (s: Slide) => void
  onDelete: (s: Slide) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.id })
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-100 rounded-lg p-4 flex gap-3 sm:gap-4 items-center ${!s.is_active ? 'opacity-50' : ''} ${isDragging ? 'shadow-lg ring-1 ring-[var(--brand-rose)]/40' : ''}`}
    >
      {/* drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="touch-none cursor-grab active:cursor-grabbing text-gray-300 hover:text-[var(--brand-rose)] shrink-0"
      >
        <GripVertical size={16} />
      </button>
      {/* order controls (keyboard-accessible fallback) */}
      <div className="flex flex-col gap-1">
        <button onClick={() => onMove(i, -1)} disabled={i === 0} aria-label="Move up" className="text-gray-400 hover:text-[var(--brand-rose)] disabled:opacity-30"><ChevronUp size={16} /></button>
        <button onClick={() => onMove(i, 1)} disabled={i === total - 1} aria-label="Move down" className="text-gray-400 hover:text-[var(--brand-rose)] disabled:opacity-30"><ChevronDown size={16} /></button>
      </div>
      {/* thumb */}
      <div className="relative w-24 sm:w-28 h-16 flex-shrink-0 bg-gradient-to-br from-[var(--brand-cream)] to-[var(--brand-pink)]/30 overflow-hidden rounded">
        {s.media_url && s.media_type === 'image' && <Image src={s.media_url} alt="" fill className="object-cover" style={{ objectPosition: `${s.focal_x ?? 50}% ${s.focal_y ?? 50}%` }} />}
        {s.media_url && s.media_type === 'video' && (s.poster_url
          ? <Image src={s.poster_url} alt="" fill className="object-cover" />
          : <video src={s.media_url} muted className="w-full h-full object-cover" />)}
        <span className="absolute top-1 left-1 bg-black/55 text-white text-[8px] px-1 py-0.5 rounded uppercase tracking-wider">
          {s.media_url ? s.media_type : 'gradient'}
        </span>
      </div>
      {/* info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--brand-charcoal)] truncate">{s.title || <span className="text-gray-400">Untitled</span>}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{s.subtitle}</p>
      </div>
      {/* actions */}
      <div className="flex gap-1.5 flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggle(s)} title={s.is_active ? 'Hide' : 'Show'}>
          {s.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(s)} title="Edit"><Pencil size={13} /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 hover:bg-red-50" onClick={() => onDelete(s)} title="Delete"><Trash2 size={13} /></Button>
      </div>
    </div>
  )
}
