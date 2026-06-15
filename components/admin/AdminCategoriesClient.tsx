'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { slugify } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Upload, Check } from 'lucide-react'

interface Category {
  id: string; name: string; slug: string; description: string | null
  image_url: string | null; is_active: boolean; display_order: number
  product_count?: number
}

const EMPTY: Omit<Category, 'id'> = { name: '', slug: '', description: null, image_url: null, is_active: true, display_order: 0 }

export default function AdminCategoriesClient() {
  const [items, setItems] = useState<Category[]>([])
  const [editing, setEditing] = useState<Category | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState({ ...EMPTY, description: '', display_order: 0 })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const supabase = createClient()
    const [{ data: cats }, { data: products }] = await Promise.all([
      supabase.from('categories').select('*').order('display_order'),
      supabase.from('products').select('category_id').eq('is_active', true),
    ])
    const countMap: Record<string, number> = {}
    for (const p of products ?? []) {
      if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] ?? 0) + 1
    }
    setItems((cats ?? []).map((c) => ({ ...c, product_count: countMap[c.id] ?? 0 })))
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', display_order: items.length, is_active: true, image_url: null })
    setImageFile(null); setPreview(''); setIsNew(true)
  }
  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? '', display_order: cat.display_order, is_active: cat.is_active, image_url: cat.image_url })
    setImageFile(null); setPreview(''); setIsNew(false)
  }
  function closeForm() { setEditing(null); setIsNew(false) }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    const r = new FileReader(); r.onload = (ev) => setPreview(ev.target?.result as string); r.readAsDataURL(f)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    let image_url = form.image_url

    if (imageFile) {
      const path = `${form.slug}/${Date.now()}.${imageFile.name.split('.').pop()}`
      await supabase.storage.from('gallery-images').upload(path, imageFile, { upsert: true })
      const { data: { publicUrl } } = supabase.storage.from('gallery-images').getPublicUrl(path)
      image_url = publicUrl
    }

    const payload = { name: form.name, slug: form.slug, description: form.description || null, image_url, is_active: form.is_active, display_order: form.display_order }
    if (editing) {
      await supabase.from('categories').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('categories').insert(payload)
    }
    setSaving(false); closeForm(); load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return
    const supabase = createClient()
    await supabase.from('categories').delete().eq('id', id)
    load()
  }

  const showForm = isNew || !!editing

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Categories</h1>
        <Button variant="rose" size="sm" className="gap-2" onClick={openNew}><Plus size={14} />Add Category</Button>
      </div>

      {showForm && (
        <div className="bg-white border border-[var(--brand-pink)]/30 rounded-lg p-6 mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-gray-700">{editing ? 'Edit Category' : 'New Category'}</h2>
            <button onClick={closeForm}><X size={16} className="text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input className="mt-1.5" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: editing ? p.slug : slugify(e.target.value) }))} required />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input className="mt-1.5" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Input className="mt-1.5" value={form.description ?? ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input className="mt-1.5" type="number" value={form.display_order} onChange={(e) => setForm((p) => ({ ...p, display_order: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="cat_active" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 accent-[var(--brand-rose)]" />
              <Label htmlFor="cat_active">Active</Label>
            </div>
          </div>

          {/* Image */}
          <div>
            <Label>Category Image</Label>
            <div className="mt-1.5 flex gap-4 items-start">
              {(preview || form.image_url) && (
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image src={preview || form.image_url!} alt="" fill className="object-cover rounded" />
                </div>
              )}
              <label className="flex items-center gap-2 border border-dashed border-gray-200 px-4 py-2 cursor-pointer hover:border-[var(--brand-pink)] text-sm text-gray-500">
                <Upload size={14} /> Upload Image
                <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="rose" size="sm" onClick={handleSave} disabled={saving} className="gap-2">
              <Check size={13} />{saving ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={closeForm}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm">No categories yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs tracking-wider">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs tracking-wider">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs tracking-wider">Products</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs tracking-wider">Status</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {cat.image_url && (
                        <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                          <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                        </div>
                      )}
                      <span className="font-medium text-[var(--brand-charcoal)]">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{cat.product_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 ${cat.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {cat.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}><Pencil size={13} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(cat.id)}><Trash2 size={13} /></Button>
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
