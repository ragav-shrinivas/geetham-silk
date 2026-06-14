'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Trash2, Eye, EyeOff } from 'lucide-react'

interface GalleryItem {
  id: string; title: string | null; image_url: string
  caption: string | null; is_active: boolean; display_order: number
}

export default function AdminGalleryClient() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('gallery').select('*').order('display_order')
    setItems(data ?? [])
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    const supabase = createClient()
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const path = `gallery/${Date.now()}-${i}.${f.name.split('.').pop()}`
      const { error } = await supabase.storage.from('gallery-images').upload(path, f, { upsert: true })
      if (error) continue
      const { data: { publicUrl } } = supabase.storage.from('gallery-images').getPublicUrl(path)
      await supabase.from('gallery').insert({ image_url: publicUrl, display_order: items.length + i, is_active: true })
    }
    setUploading(false); load()
    if (fileRef.current) fileRef.current.value = ''
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('gallery').update({ is_active: !current }).eq('id', id); load()
  }

  async function updateCaption(id: string, caption: string) {
    const supabase = createClient()
    await supabase.from('gallery').update({ caption: caption || null }).eq('id', id)
  }

  async function handleDelete(id: string, imageUrl: string) {
    if (!confirm('Delete this image?')) return
    const supabase = createClient()
    const path = imageUrl.split('/gallery-images/')[1]
    if (path) await supabase.storage.from('gallery-images').remove([path])
    await supabase.from('gallery').delete().eq('id', id); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Gallery</h1>
        <label className="cursor-pointer">
          <Button variant="rose" size="sm" className="gap-2" asChild>
            <span><Upload size={14} />{uploading ? 'Uploading…' : 'Upload Images'}</span>
          </Button>
          <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleUpload} className="sr-only" />
        </label>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-100">
          <p className="text-gray-400 mb-4">No gallery images yet.</p>
          <label className="cursor-pointer">
            <Button variant="rose" size="sm" asChild><span><Upload size={14} className="mr-2" />Upload First Images</span></Button>
            <input type="file" multiple accept="image/*" onChange={handleUpload} className="sr-only" />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className={`bg-white border rounded-lg overflow-hidden ${!item.is_active ? 'opacity-50' : ''}`}>
              <div className="relative aspect-square">
                <Image src={item.image_url} alt={item.caption ?? ''} fill className="object-cover" />
              </div>
              <div className="p-3 space-y-2">
                <Input
                  placeholder="Caption (optional)"
                  defaultValue={item.caption ?? ''}
                  onBlur={(e) => updateCaption(item.id, e.target.value)}
                  className="text-xs h-8"
                />
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleActive(item.id, item.is_active)}>
                    {item.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(item.id, item.image_url)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
