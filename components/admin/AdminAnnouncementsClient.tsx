'use client'
import { useEffect, useState } from 'react'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Plus, Pencil, Trash2, X, Check, ChevronUp, ChevronDown, Eye, EyeOff,
  Truck, Sparkles, ShieldCheck, MapPin, Gift, MessageCircle, Star, Megaphone,
} from 'lucide-react'

interface Announcement {
  id: string
  text: string
  icon: string | null
  href: string | null
  is_active: boolean
  display_order: number
}

const ICON_OPTIONS = [
  { value: '', label: 'None', Icon: null },
  { value: 'truck', label: 'Shipping', Icon: Truck },
  { value: 'sparkles', label: 'New', Icon: Sparkles },
  { value: 'shield', label: 'Secure', Icon: ShieldCheck },
  { value: 'mappin', label: 'Store', Icon: MapPin },
  { value: 'gift', label: 'Offer', Icon: Gift },
  { value: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle },
  { value: 'star', label: 'Star', Icon: Star },
] as const

function iconFor(key: string | null) {
  return ICON_OPTIONS.find((o) => o.value === (key ?? ''))?.Icon ?? null
}

const EMPTY = { text: '', icon: '', href: '', is_active: true, display_order: 0 }

/**
 * Admin CRUD for the rotating announcement bar. Add / edit / delete / show-hide /
 * reorder (keyboard-accessible up/down) / optional icon + link. Rows persist to
 * the `announcements` table; the storefront bar reads active rows (cached ~5 min).
 */
export default function AdminAnnouncementsClient() {
  const [items, setItems] = useState<Announcement[]>([])
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('announcements').select('*').order('display_order')
    setItems((data ?? []) as Announcement[])
    setLoading(false)
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null); setForm({ ...EMPTY, display_order: items.length }); setIsNew(true)
  }
  function openEdit(a: Announcement) {
    setEditing(a)
    setForm({ text: a.text, icon: a.icon ?? '', href: a.href ?? '', is_active: a.is_active, display_order: a.display_order })
    setIsNew(false)
  }
  function closeForm() { setEditing(null); setIsNew(false) }

  async function handleSave() {
    if (!form.text.trim()) return
    setSaving(true)
    const supabase = createClient()
    const payload = {
      text: form.text.trim(),
      icon: form.icon || null,
      href: form.href.trim() || null,
      is_active: form.is_active,
      display_order: form.display_order,
    }
    if (editing) await supabase.from('announcements').update(payload).eq('id', editing.id)
    else await supabase.from('announcements').insert(payload)
    setSaving(false); closeForm(); load()
  }

  async function toggleActive(a: Announcement) {
    const supabase = createClient()
    await supabase.from('announcements').update({ is_active: !a.is_active }).eq('id', a.id); load()
  }

  async function handleDelete(a: Announcement) {
    if (!confirm('Delete this announcement?')) return
    const supabase = createClient()
    await supabase.from('announcements').delete().eq('id', a.id); load()
  }

  async function move(index: number, dir: -1 | 1) {
    const other = index + dir
    if (other < 0 || other >= items.length) return
    const a = items[index], b = items[other]
    const supabase = createClient()
    await supabase.from('announcements').update({ display_order: b.display_order }).eq('id', a.id)
    await supabase.from('announcements').update({ display_order: a.display_order }).eq('id', b.id)
    load()
  }

  const showForm = isNew || !!editing

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Announcements</h1>
          <p className="text-sm text-gray-500 mt-0.5">The rotating messages in the top bar. They cycle automatically on the storefront.</p>
        </div>
        <Button variant="rose" size="sm" className="gap-2" onClick={openNew}><Plus size={14} />Add Message</Button>
      </div>

      {showForm && (
        <div className="bg-white border border-[var(--brand-pink)]/30 rounded-lg p-6 mb-6 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-gray-700">{editing ? 'Edit Message' : 'New Message'}</h2>
            <button onClick={closeForm} aria-label="Close"><X size={16} className="text-gray-400" /></button>
          </div>

          <div>
            <Label>Message text</Label>
            <Input className="mt-1.5" value={form.text} maxLength={80}
              onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
              placeholder="Free Shipping Across India" />
            <p className="text-xs text-gray-400 mt-1">Keep it short — one line. {80 - form.text.length} characters left.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Icon (optional)</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {ICON_OPTIONS.map(({ value, label, Icon }) => {
                  const active = form.icon === value
                  return (
                    <button
                      key={value || 'none'}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, icon: value }))}
                      className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 rounded text-xs transition-colors ${
                        active ? 'border-[var(--brand-rose)] bg-[var(--brand-rose)]/10 text-[var(--brand-rose)]' : 'border-gray-200 text-gray-500 hover:border-[var(--brand-rose)]/50'
                      }`}
                    >
                      {Icon ? <Icon size={13} /> : <X size={13} />}
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <Label>Link (optional)</Label>
              <Input className="mt-1.5" value={form.href}
                onChange={(e) => setForm((p) => ({ ...p, href: e.target.value }))}
                placeholder="/shop?sort=newest" />
              <p className="text-xs text-gray-400 mt-1">Internal path (/shop) or full URL. Leave empty for plain text.</p>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 accent-[var(--brand-rose)]" />
            <span className="text-sm text-gray-600">Active (visible on site)</span>
          </label>

          <div className="flex gap-3 items-center">
            <Button type="button" variant="rose" size="sm" onClick={handleSave} disabled={saving || !form.text.trim()} className="gap-2"><Check size={13} />{saving ? 'Saving…' : 'Save Message'}</Button>
            <Button type="button" variant="outline" size="sm" onClick={closeForm}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Live preview note */}
      <p className="text-xs text-gray-400 mb-3">Changes appear on the storefront within a few minutes (cached for performance).</p>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center py-12 text-gray-400 text-sm bg-white rounded-lg border">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm bg-white rounded-lg border">No announcements yet. Add your first message.</p>
        ) : items.map((a, i) => {
          const Icon = iconFor(a.icon)
          return (
            <div key={a.id} className={`bg-white border border-gray-100 rounded-lg p-4 flex gap-4 items-center ${!a.is_active ? 'opacity-50' : ''}`}>
              <div className="flex flex-col gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="text-gray-400 hover:text-[var(--brand-rose)] disabled:opacity-30"><ChevronUp size={16} /></button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down" className="text-gray-400 hover:text-[var(--brand-rose)] disabled:opacity-30"><ChevronDown size={16} /></button>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-darkpink)]/10 text-[var(--brand-darkpink)]">
                {Icon ? <Icon size={16} /> : <Megaphone size={16} />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--brand-charcoal)] truncate">{a.text}</p>
                {a.href && <p className="text-xs text-gray-400 truncate mt-0.5">→ {a.href}</p>}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(a)} title={a.is_active ? 'Hide' : 'Show'}>
                  {a.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)} title="Edit"><Pencil size={13} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(a)} title="Delete"><Trash2 size={13} /></Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
