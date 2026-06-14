'use client'
import { useEffect, useState } from 'react'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { slugify } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Upload, Check } from 'lucide-react'
import Image from 'next/image'

interface Collection {
  id: string; name: string; slug: string; description: string | null
  image_url: string | null; is_active: boolean; is_featured: boolean; display_order: number
}

export default function AdminCollectionsClient() {
  const [items, setItems] = useState<Collection[]>([])
  const [editing, setEditing] = useState<Collection | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', is_active: true, is_featured: false, display_order: 0, image_url: null as string | null })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('collections').select('*').order('display_order')
    setItems(data ?? [])
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  function openNew() { setEditing(null); setForm({ name: '', slug: '', description: '', is_active: true, is_featured: false, display_order: items.length, image_url: null }); setImageFile(null); setPreview(''); setIsNew(true) }
  function openEdit(c: Collection) { setEditing(c); setForm({ name: c.name, slug: c.slug, description: c.description ?? '', is_active: c.is_active, is_featured: c.is_featured, display_order: c.display_order, image_url: c.image_url }); setImageFile(null); setPreview(''); setIsNew(false) }
  function closeForm() { setEditing(null); setIsNew(false) }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setImageFile(f); const r = new FileReader(); r.onload = (ev) => setPreview(ev.target?.result as string); r.readAsDataURL(f)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    let image_url = form.image_url
    if (imageFile) {
      const path = `collections/${form.slug}/${Date.now()}.${imageFile.name.split('.').pop()}`
      await supabase.storage.from('gallery-images').upload(path, imageFile, { upsert: true })
      const { data: { publicUrl } } = supabase.storage.from('gallery-images').getPublicUrl(path)
      image_url = publicUrl
    }
    const payload = { name: form.name, slug: form.slug, description: form.description || null, image_url, is_active: form.is_active, is_featured: form.is_featured, display_order: form.display_order }
    if (editing) { await supabase.from('collections').update(payload).eq('id', editing.id) }
    else { await supabase.from('collections').insert(payload) }
    setSaving(false); closeForm(); load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this collection?')) return
    const supabase = createClient()
    await supabase.from('collections').delete().eq('id', id); load()
  }

  const showForm = isNew || !!editing

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Collections</h1>
        <Button variant="rose" size="sm" className="gap-2" onClick={openNew}><Plus size={14} />Add Collection</Button>
      </div>

      {showForm && (
        <div className="bg-white border border-[var(--brand-pink)]/30 rounded-lg p-6 mb-6 space-y-4">
          <div className="flex justify-between"><h2 className="font-medium text-gray-700">{editing ? 'Edit' : 'New'} Collection</h2><button onClick={closeForm}><X size={16} className="text-gray-400" /></button></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Name *</Label><Input className="mt-1.5" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: editing ? p.slug : slugify(e.target.value) }))} /></div>
            <div><Label>Slug *</Label><Input className="mt-1.5" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} /></div>
            <div className="sm:col-span-2"><Label>Description</Label><Input className="mt-1.5" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
            <div className="flex items-center gap-3 pt-4"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 accent-[var(--brand-rose)]" /><Label>Active</Label></div>
            <div className="flex items-center gap-3 pt-4"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))} className="w-4 h-4 accent-[var(--brand-rose)]" /><Label>Featured</Label></div>
          </div>
          <div>
            <Label>Image</Label>
            <div className="mt-1.5 flex gap-4 items-start">
              {(preview || form.image_url) && <div className="relative w-20 h-14 flex-shrink-0"><Image src={preview || form.image_url!} alt="" fill className="object-cover rounded" /></div>}
              <label className="flex items-center gap-2 border border-dashed border-gray-200 px-4 py-2 cursor-pointer hover:border-[var(--brand-pink)] text-sm text-gray-500"><Upload size={14} />Upload<input type="file" accept="image/*" onChange={handleFile} className="sr-only" /></label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="rose" size="sm" onClick={handleSave} disabled={saving} className="gap-2"><Check size={13} />{saving ? 'Saving…' : 'Save'}</Button>
            <Button type="button" variant="outline" size="sm" onClick={closeForm}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        {items.length === 0 ? (<p className="text-center py-12 text-gray-400 text-sm">No collections yet.</p>) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Collection</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((col) => (
                <tr key={col.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-[var(--brand-charcoal)]">{col.name}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{col.slug}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <span className={`text-xs px-2 py-0.5 ${col.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{col.is_active ? 'Active' : 'Hidden'}</span>
                      {col.is_featured && <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600">Featured</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(col)}><Pencil size={13} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(col.id)}><Trash2 size={13} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
