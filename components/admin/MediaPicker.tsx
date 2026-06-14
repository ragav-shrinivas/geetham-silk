'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { X, Upload, Film, Check } from 'lucide-react'
import { listMedia, uploadMedia } from '@/lib/media'
import { Button } from '@/components/ui/button'
import type { MediaAsset } from '@/types/database'

interface MediaPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (asset: MediaAsset) => void
  /** restrict the grid to a media kind */
  accept?: 'image' | 'video' | 'all'
}

/**
 * Modal media library picker — browse, upload, select. Reused anywhere an
 * admin form needs an image or video.
 */
export default function MediaPicker({ open, onClose, onSelect, accept = 'all' }: MediaPickerProps) {
  const [items, setItems] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    listMedia()
      .then(setItems)
      .catch(() => setError('Could not load media'))
      .finally(() => setLoading(false))
  }, [open])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const asset = await uploadMedia(file)
      setItems((prev) => [asset, ...prev])
    } catch {
      setError('Upload failed — please try again')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  if (!open) return null

  const filtered = accept === 'all' ? items : items.filter((i) => i.type === accept)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[82vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-medium text-[var(--brand-charcoal)]">Media Library</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {accept === 'all' ? 'Images & videos' : accept === 'image' ? 'Images' : 'Videos'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept={accept === 'video' ? 'video/*' : accept === 'image' ? 'image/*' : 'image/*,video/*'} className="hidden" onChange={handleUpload} />
            <Button variant="rose" size="sm" className="gap-2" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload size={13} />
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>
            <button onClick={onClose} aria-label="Close" className="p-1.5 text-gray-400 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-12">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">
              No media yet — upload your first {accept === 'video' ? 'video' : 'file'} above.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filtered.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => { onSelect(asset); onClose() }}
                  className="group relative aspect-square overflow-hidden rounded border border-gray-100 hover:border-[var(--brand-rose)] transition-colors bg-gray-50"
                  title={asset.name}
                >
                  {asset.type === 'video' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                      <Film size={26} />
                      <span className="text-[10px] px-2 truncate max-w-full">{asset.name}</span>
                    </div>
                  ) : (
                    <Image src={asset.url} alt={asset.name} fill sizes="160px" className="object-cover" />
                  )}
                  <span className="absolute inset-0 bg-[var(--brand-rose)]/0 group-hover:bg-[var(--brand-rose)]/15 transition-colors flex items-center justify-center">
                    <Check size={22} className="text-white opacity-0 group-hover:opacity-100 drop-shadow transition-opacity" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
