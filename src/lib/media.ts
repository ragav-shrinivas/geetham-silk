import { createAdminClient } from '@/lib/supabase/admin-client'
import type { MediaAsset } from '@/types/database'

/** Client-side media library helpers (admin only — RLS enforces auth). */

export async function listMedia(): Promise<MediaAsset[]> {
  const supabase = createAdminClient()
  const { data } = await supabase.from('media').select('*').order('created_at', { ascending: false })
  return (data ?? []) as MediaAsset[]
}

export async function uploadMedia(file: File): Promise<MediaAsset> {
  const supabase = createAdminClient()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error: upErr } = await supabase.storage.from('media').upload(path, file, {
    upsert: false,
    contentType: file.type,
  })
  if (upErr) throw upErr

  const url = supabase.storage.from('media').getPublicUrl(path).data.publicUrl
  const row = {
    name: file.name,
    url,
    path,
    type: file.type.startsWith('video') ? 'video' : 'image',
    size_bytes: file.size,
  }
  const { data, error } = await supabase.from('media').insert(row).select().single()
  if (error) throw error
  return data as MediaAsset
}

export async function deleteMedia(asset: MediaAsset): Promise<void> {
  const supabase = createAdminClient()
  await supabase.storage.from('media').remove([asset.path])
  await supabase.from('media').delete().eq('id', asset.id)
}
