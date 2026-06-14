'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Upload, Trash2, Film, Copy, Check } from 'lucide-react'
import { listMedia, uploadMedia, deleteMedia } from '@/lib/media'
import { Button } from '@/components/ui/button'
import type { MediaAsset } from '@/types/database'

function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaLibraryClient() {
  const [items, setItems] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    listMedia()
      .then(setItems)
      .catch(() => setError('Could not load media'))
      .finally(() => setLoading(false))
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)
    setError('')
    try {
      for (const file of files) {
        const asset = await uploadMedia(file)
        setItems((prev) => [asset, ...prev])
      }
    } catch {
      setError('Upload failed — please try again')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(asset: MediaAsset) {
    if (!confirm(`Delete "${asset.name}"? Anywhere it is used on the site will stop showing it.`)) return
    await deleteMedia(asset)
    setItems((prev) => prev.filter((i) => i.id !== asset.id))
  }

  async function copyUrl(asset: MediaAsset) {
    await navigator.clipboard.writeText(asset.url)
    setCopied(asset.id)
    setTimeout(() => setCopied(null), 1600)
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Media Library</h1>
        <div>
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleUpload} />
          <Button variant="rose" size="sm" className="gap-2" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload size={13} />
            {uploading ? 'Uploading…' : 'Upload Media'}
          </Button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-7">
        Images and videos for the page builder and site content. Copy a URL to use it anywhere.
      </p>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400 py-10">Loading…</p>
      ) : items.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-lg py-20 text-center">
          <p className="text-gray-400 text-sm mb-4">No media yet</p>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            Upload your first file
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((asset) => (
            <div key={asset.id} className="group bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
              <div className="relative aspect-square bg-gray-50">
                {asset.type === 'video' ? (
                  <video src={asset.url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                ) : (
                  <Image src={asset.url} alt={asset.name} fill sizes="240px" className="object-cover" />
                )}
                {asset.type === 'video' && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-black/55 text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded">
                    <Film size={10} /> Video
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/45 to-transparent">
                  <button
                    onClick={() => copyUrl(asset)}
                    aria-label="Copy URL"
                    className="w-8 h-8 rounded bg-white/90 text-gray-600 hover:text-[var(--brand-rose)] flex items-center justify-center"
                  >
                    {copied === asset.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => handleDelete(asset)}
                    aria-label="Delete"
                    className="w-8 h-8 rounded bg-white/90 text-gray-600 hover:text-red-500 flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-xs font-medium text-[var(--brand-charcoal)] truncate" title={asset.name}>{asset.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{formatSize(asset.size_bytes)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
