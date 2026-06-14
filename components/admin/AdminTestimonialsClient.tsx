'use client'
import { useEffect, useState } from 'react'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, X, Check, Star } from 'lucide-react'

interface Testimonial {
  id: string; customer_name: string; location: string | null
  rating: number; review: string; is_active: boolean; display_order: number
}

const EMPTY = { customer_name: '', location: '', rating: 5, review: '', is_active: true, display_order: 0 }

export default function AdminTestimonialsClient() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('testimonials').select('*').order('display_order')
    setItems(data ?? [])
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  function openNew() { setEditing(null); setForm({ ...EMPTY, display_order: items.length }); setIsNew(true) }
  function openEdit(t: Testimonial) { setEditing(t); setForm({ customer_name: t.customer_name, location: t.location ?? '', rating: t.rating, review: t.review, is_active: t.is_active, display_order: t.display_order }); setIsNew(false) }
  function closeForm() { setEditing(null); setIsNew(false) }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const payload = { customer_name: form.customer_name, location: form.location || null, rating: form.rating, review: form.review, is_active: form.is_active, display_order: form.display_order }
    if (editing) { await supabase.from('testimonials').update(payload).eq('id', editing.id) }
    else { await supabase.from('testimonials').insert(payload) }
    setSaving(false); closeForm(); load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial?')) return
    const supabase = createClient()
    await supabase.from('testimonials').delete().eq('id', id); load()
  }

  const showForm = isNew || !!editing

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Testimonials</h1>
        <Button variant="rose" size="sm" className="gap-2" onClick={openNew}><Plus size={14} />Add Testimonial</Button>
      </div>

      {showForm && (
        <div className="bg-white border border-[var(--brand-pink)]/30 rounded-lg p-6 mb-6 space-y-4">
          <div className="flex justify-between"><h2 className="font-medium text-gray-700">{editing ? 'Edit' : 'New'} Testimonial</h2><button onClick={closeForm}><X size={16} className="text-gray-400" /></button></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Customer Name *</Label><Input className="mt-1.5" value={form.customer_name} onChange={(e) => setForm((p) => ({ ...p, customer_name: e.target.value }))} /></div>
            <div><Label>Location</Label><Input className="mt-1.5" value={form.location ?? ''} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="City, Area" /></div>
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} type="button" onClick={() => setForm((p) => ({ ...p, rating: n }))}>
                    <Star size={20} className={n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-5"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 accent-[var(--brand-rose)]" /><Label>Active</Label></div>
            <div className="sm:col-span-2"><Label>Review *</Label><textarea value={form.review} onChange={(e) => setForm((p) => ({ ...p, review: e.target.value }))} rows={4} className="mt-1.5 flex w-full border border-[var(--brand-pink)] bg-white px-3 py-2 text-sm text-[var(--brand-charcoal)] focus:outline-none focus:border-[var(--brand-rose)] focus:ring-1 focus:ring-[var(--brand-rose)] rounded-none resize-none" /></div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="rose" size="sm" onClick={handleSave} disabled={saving} className="gap-2"><Check size={13} />{saving ? 'Saving…' : 'Save'}</Button>
            <Button type="button" variant="outline" size="sm" onClick={closeForm}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.length === 0 ? <p className="text-center py-12 text-gray-400 text-sm bg-white rounded-lg border">No testimonials yet.</p> : items.map((t) => (
          <div key={t.id} className={`bg-white border border-gray-100 rounded-lg p-5 flex gap-4 ${!t.is_active ? 'opacity-50' : ''}`}>
            <div className="flex-1">
              <div className="flex gap-1 mb-1">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}</div>
              <p className="text-sm text-gray-600 italic mb-2">&ldquo;{t.review}&rdquo;</p>
              <p className="text-sm font-medium text-[var(--brand-charcoal)]">{t.customer_name}{t.location && <span className="text-gray-400 font-normal"> · {t.location}</span>}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}><Pencil size={13} /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(t.id)}><Trash2 size={13} /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
