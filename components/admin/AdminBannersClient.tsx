'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, X, Upload, Check, GalleryHorizontalEnd } from 'lucide-react'

interface Banner {
  id: string; title: string | null; subtitle: string | null; image_url: string
  link_url: string | null; cta_label: string | null; display_order: number
  is_active: boolean; starts_at: string | null; ends_at: string | null
}

const BUCKET = 'hero-media'
const toLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : '')
const toIso = (local: string) => (local ? new Date(local).toISOString() : null)

export default function AdminBannersClient() {
  const [items, setItems] = useState<Banner[]>([])
  const [editing, setEditing] = useState<Banner | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState({ title: '', subtitle: '', link_url: '', cta_label: '', display_order: 0, is_active: true, starts_at: '', ends_at: '', image_url: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('banners').select('*').order('display_order')
    setItems((data as Banner[]) ?? [])
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null); setIsNew(true)
    setForm({ title: '', subtitle: '', link_url: '', cta_label: '', display_order: items.length, is_active: true, starts_at: '', ends_at: '', image_url: '' })
    setImageFile(null); setPreview('')
  }
  function openEdit(b: Banner) {
    setEditing(b); setIsNew(false)
    setForm({ title: b.title ?? '', subtitle: b.subtitle ?? '', link_url: b.link_url ?? '', cta_label: b.cta_label ?? '', display_order: b.display_order, is_active: b.is_active, starts_at: toLocal(b.starts_at), ends_at: toLocal(b.ends_at), image_url: b.image_url })
    setImageFile(null); setPreview('')
  }
  function close() { setEditing(null); setIsNew(false) }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setImageFile(f)
    const r = new FileReader(); r.onload = (ev) => setPreview(ev.target?.result as string); r.readAsDataURL(f)
  }

  async function save() {
    if (!form.image_url && !imageFile) { alert('Please upload a banner image.'); return }
    setSaving(true)
    const supabase = createClient()
    let image_url = form.image_url
    if (imageFile) {
      const path = `banners/${Date.now()}.${imageFile.name.split('.').pop()}`
      await supabase.storage.from(BUCKET).upload(path, imageFile, { upsert: true })
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
      image_url = publicUrl
    }
    const payload = {
      title: form.title || null, subtitle: form.subtitle || null, image_url,
      link_url: form.link_url || null, cta_label: form.cta_label || null,
      display_order: form.display_order, is_active: form.is_active,
      starts_at: toIso(form.starts_at), ends_at: toIso(form.ends_at),
    }
    if (editing) await supabase.from('banners').update(payload).eq('id', editing.id)
    else await supabase.from('banners').insert(payload)
    setSaving(false); close(); load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this banner?')) return
    const supabase = createClient()
    await supabase.from('banners').delete().eq('id', id)
    load()
  }

  async function toggle(b: Banner) {
    const supabase = createClient()
    await supabase.from('banners').update({ is_active: !b.is_active }).eq('id', b.id)
    load()
  }

  const showForm = isNew || !!editing
  const field = 'mt-1.5'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Promotional Banners</h1>
          <p className="text-sm text-gray-500 mt-0.5">Schedule and order the homepage promo strip.</p>
        </div>
        <Button variant="rose" size="sm" className="gap-2" onClick={openNew}><Plus size={14} /> Add Banner</Button>
      </div>

      {showForm && (
        <div className="bg-white border border-[var(--brand-pink)]/30 rounded-lg p-6 mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-gray-700">{editing ? 'Edit Banner' : 'New Banner'}</h2>
            <button onClick={close}><X size={16} className="text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Title</Label><Input className={field} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Subtitle / Eyebrow</Label><Input className={field} value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} /></div>
            <div><Label>Link URL</Label><Input className={field} placeholder="/shop?category=sarees" value={form.link_url} onChange={(e) => setForm((p) => ({ ...p, link_url: e.target.value }))} /></div>
            <div><Label>CTA Label</Label><Input className={field} placeholder="Shop the Sale" value={form.cta_label} onChange={(e) => setForm((p) => ({ ...p, cta_label: e.target.value }))} /></div>
            <div><Label>Starts At</Label><Input type="datetime-local" className={field} value={form.starts_at} onChange={(e) => setForm((p) => ({ ...p, starts_at: e.target.value }))} /></div>
            <div><Label>Ends At</Label><Input type="datetime-local" className={field} value={form.ends_at} onChange={(e) => setForm((p) => ({ ...p, ends_at: e.target.value }))} /></div>
            <div><Label>Display Order</Label><Input type="number" className={field} value={form.display_order} onChange={(e) => setForm((p) => ({ ...p, display_order: parseInt(e.target.value) || 0 }))} /></div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="b_active" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 accent-[var(--brand-rose)]" />
              <Label htmlFor="b_active">Active</Label>
            </div>
          </div>
          <div>
            <Label>Banner Image (wide, ~16:5)</Label>
            <div className="mt-1.5 flex gap-4 items-start">
              {(preview || form.image_url) && (
                <div className="relative w-40 h-16 flex-shrink-0 rounded overflow-hidden">
                  <Image src={preview || form.image_url} alt="" fill className="object-cover" />
                </div>
              )}
              <label className="flex items-center gap-2 border border-dashed border-gray-200 px-4 py-2 cursor-pointer hover:border-[var(--brand-pink)] text-sm text-gray-500">
                <Upload size={14} /> Upload <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="rose" size="sm" onClick={save} disabled={saving} className="gap-2"><Check size={13} />{saving ? 'Saving…' : 'Save'}</Button>
            <Button type="button" variant="outline" size="sm" onClick={close}>Cancel</Button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-lg py-16 text-center">
          <GalleryHorizontalEnd size={36} strokeWidth={1} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No banners yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <div key={b.id} className="bg-white border border-gray-100 rounded-lg p-3 flex items-center gap-4">
              <div className="relative w-28 h-14 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                <Image src={b.image_url} alt={b.title ?? ''} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--brand-charcoal)] line-clamp-1">{b.title || '(no title)'}</p>
                <p className="text-xs text-gray-400">
                  {b.starts_at ? `From ${new Date(b.starts_at).toLocaleDateString('en-IN')}` : 'Always'}{b.ends_at ? ` → ${new Date(b.ends_at).toLocaleDateString('en-IN')}` : ''}
                </p>
              </div>
              <button onClick={() => toggle(b)} className={`text-xs px-2 py-0.5 rounded ${b.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {b.is_active ? 'Active' : 'Hidden'}
              </button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil size={13} /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 hover:bg-red-50" onClick={() => remove(b.id)}><Trash2 size={13} /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
