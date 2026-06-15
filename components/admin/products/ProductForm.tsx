'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { slugify } from '@/lib/utils'
import { Upload, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  product?: {
    id: string; name: string; slug: string; product_code: string
    description: string | null; price: number; original_price: number | null
    category_id: string | null; collection_id: string | null
    sizes: string[]; colors: string[]; material: string | null
    care_instructions: string | null; is_active: boolean; is_featured: boolean
    is_trending: boolean; is_new_arrival: boolean; is_out_of_stock: boolean
    is_best_seller: boolean
    meta_title: string | null; meta_description: string | null
    product_images: { id: string; url: string; is_primary: boolean; display_order: number }[]
  }
  categories: { id: string; name: string }[]
  collections: { id: string; name: string }[]
}

export default function ProductForm({ product, categories, collections }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    product_code: product?.product_code ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    original_price: product?.original_price?.toString() ?? '',
    category_id: product?.category_id ?? '',
    collection_id: product?.collection_id ?? '',
    sizes: product?.sizes?.join(', ') ?? '',
    colors: product?.colors?.join(', ') ?? '',
    material: product?.material ?? '',
    care_instructions: product?.care_instructions ?? '',
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    is_trending: product?.is_trending ?? false,
    is_new_arrival: product?.is_new_arrival ?? false,
    is_out_of_stock: product?.is_out_of_stock ?? false,
    is_best_seller: product?.is_best_seller ?? false,
    meta_title: product?.meta_title ?? '',
    meta_description: product?.meta_description ?? '',
  })

  const [existingImages, setExistingImages] = useState(product?.product_images ?? [])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (name === 'name' && !isEdit) {
      setForm((prev) => ({ ...prev, slug: slugify(value), name: value }))
    }
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setNewImages((prev) => [...prev, ...files])
    files.forEach((f) => {
      const reader = new FileReader()
      reader.onload = (ev) => setNewPreviews((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(f)
    })
  }

  async function removeExisting(id: string, url: string) {
    const supabase = createClient()
    const path = url.split('/product-images/')[1]
    if (path) await supabase.storage.from('product-images').remove([path])
    await supabase.from('product_images').delete().eq('id', id)
    setExistingImages((prev) => prev.filter((i) => i.id !== id))
  }

  async function setPrimary(id: string) {
    const supabase = createClient()
    if (product) {
      await supabase.from('product_images').update({ is_primary: false }).eq('product_id', product.id)
      await supabase.from('product_images').update({ is_primary: true }).eq('id', id)
      setExistingImages((prev) => prev.map((i) => ({ ...i, is_primary: i.id === id })))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()

    const payload = {
      name: form.name,
      slug: form.slug,
      product_code: form.product_code,
      description: form.description || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      category_id: form.category_id || null,
      collection_id: form.collection_id || null,
      sizes: form.sizes ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
      colors: form.colors ? form.colors.split(',').map((s) => s.trim()).filter(Boolean) : [],
      material: form.material || null,
      care_instructions: form.care_instructions || null,
      is_active: form.is_active,
      is_featured: form.is_featured,
      is_trending: form.is_trending,
      is_new_arrival: form.is_new_arrival,
      is_out_of_stock: form.is_out_of_stock,
      is_best_seller: form.is_best_seller,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
    }

    let productId = product?.id
    if (isEdit) {
      const { error: err } = await supabase.from('products').update(payload).eq('id', productId!)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { data, error: err } = await supabase.from('products').insert(payload).select('id').single()
      if (err) { setError(err.message); setSaving(false); return }
      productId = data.id
    }

    // Upload new images
    for (let i = 0; i < newImages.length; i++) {
      const file = newImages[i]
      const ext = file.name.split('.').pop()
      const path = `${productId}/${Date.now()}-${i}.${ext}`
      const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
      if (upErr) continue
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
      await supabase.from('product_images').insert({
        product_id: productId!,
        url: publicUrl,
        display_order: existingImages.length + i,
        is_primary: existingImages.length === 0 && i === 0,
      })
    }

    router.push('/evo9-admin/products')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/evo9-admin/products">
          <Button variant="ghost" size="icon" type="button"><ArrowLeft size={16} /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h1>
        </div>
        <div className="ml-auto flex gap-3">
          <Link href="/evo9-admin/products">
            <Button variant="outline" type="button" size="sm">Cancel</Button>
          </Link>
          <Button type="submit" variant="rose" size="sm" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded mb-6">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-5">
            <h2 className="font-medium text-gray-700 text-sm">Basic Information</h2>
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product_code">Product Code *</Label>
                <Input id="product_code" name="product_code" value={form.product_code} onChange={handleChange} required className="mt-1.5" placeholder="e.g. GS-001" />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input id="slug" name="slug" value={form.slug} onChange={handleChange} required className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description" name="description" value={form.description} onChange={handleChange}
                rows={4}
                className="mt-1.5 flex w-full border border-[var(--brand-pink)] bg-white px-3 py-2 text-sm text-[var(--brand-charcoal)] placeholder:text-gray-400 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-1 focus:ring-[var(--brand-rose)] rounded-none resize-none"
              />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-5">
            <h2 className="font-medium text-gray-700 text-sm">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₹) *</Label>
                <Input id="price" name="price" type="number" value={form.price} onChange={handleChange} required min="0" step="0.01" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="original_price">Original Price (₹)</Label>
                <Input id="original_price" name="original_price" type="number" value={form.original_price} onChange={handleChange} min="0" step="0.01" className="mt-1.5" placeholder="For discount display" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-5">
            <h2 className="font-medium text-gray-700 text-sm">Variants</h2>
            <div>
              <Label htmlFor="sizes">Sizes (comma separated)</Label>
              <Input id="sizes" name="sizes" value={form.sizes} onChange={handleChange} className="mt-1.5" placeholder="XS, S, M, L, XL" />
            </div>
            <div>
              <Label htmlFor="colors">Colors (comma separated)</Label>
              <Input id="colors" name="colors" value={form.colors} onChange={handleChange} className="mt-1.5" placeholder="Red, Blue, Green" />
            </div>
            <div>
              <Label htmlFor="material">Material</Label>
              <Input id="material" name="material" value={form.material} onChange={handleChange} className="mt-1.5" placeholder="e.g. Pure Silk" />
            </div>
            <div>
              <Label htmlFor="care_instructions">Care Instructions</Label>
              <Input id="care_instructions" name="care_instructions" value={form.care_instructions} onChange={handleChange} className="mt-1.5" placeholder="e.g. Dry clean only" />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-5">
            <h2 className="font-medium text-gray-700 text-sm">SEO</h2>
            <div>
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input id="meta_title" name="meta_title" value={form.meta_title} onChange={handleChange} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="meta_description">Meta Description</Label>
              <textarea
                id="meta_description" name="meta_description" value={form.meta_description} onChange={handleChange}
                rows={3}
                className="mt-1.5 flex w-full border border-[var(--brand-pink)] bg-white px-3 py-2 text-sm text-[var(--brand-charcoal)] focus:outline-none focus:border-[var(--brand-rose)] focus:ring-1 focus:ring-[var(--brand-rose)] rounded-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <h2 className="font-medium text-gray-700 text-sm mb-4">Status & Flags</h2>
            <div className="space-y-3">
              {[
                { key: 'is_active', label: 'Active (visible on site)' },
                { key: 'is_featured', label: 'Featured' },
                { key: 'is_trending', label: 'Trending' },
                { key: 'is_new_arrival', label: 'New Arrival' },
                { key: 'is_best_seller', label: 'Best Selling (homepage)' },
                { key: 'is_out_of_stock', label: 'Out of Stock' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={key}
                    checked={form[key as keyof typeof form] as boolean}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[var(--brand-rose)]"
                  />
                  <span className="text-sm text-gray-600">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category / Collection */}
          <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-4">
            <h2 className="font-medium text-gray-700 text-sm">Organisation</h2>
            <div>
              <Label htmlFor="category_id">Category</Label>
              <select
                id="category_id" name="category_id" value={form.category_id} onChange={handleChange}
                className="mt-1.5 flex h-10 w-full border border-[var(--brand-pink)] bg-white px-3 py-2 text-sm text-[var(--brand-charcoal)] focus:outline-none focus:border-[var(--brand-rose)] rounded-none"
              >
                <option value="">No Category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="collection_id">Collection</Label>
              <select
                id="collection_id" name="collection_id" value={form.collection_id} onChange={handleChange}
                className="mt-1.5 flex h-10 w-full border border-[var(--brand-pink)] bg-white px-3 py-2 text-sm text-[var(--brand-charcoal)] focus:outline-none focus:border-[var(--brand-rose)] rounded-none"
              >
                <option value="">No Collection</option>
                {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <h2 className="font-medium text-gray-700 text-sm mb-4">Product Images</h2>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {existingImages.map((img) => (
                  <div key={img.id} className={`relative aspect-square group border-2 ${img.is_primary ? 'border-[var(--brand-rose)]' : 'border-transparent'}`}>
                    <Image src={img.url} alt="" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button type="button" onClick={() => setPrimary(img.id)}
                        className="text-white text-[9px] bg-[var(--brand-rose)] px-1.5 py-0.5">Primary</button>
                      <button type="button" onClick={() => removeExisting(img.id, img.url)}
                        className="text-white bg-red-500 p-0.5 rounded-sm"><X size={10} /></button>
                    </div>
                    {img.is_primary && <span className="absolute bottom-0 left-0 right-0 bg-[var(--brand-rose)] text-white text-[8px] text-center py-0.5">Primary</span>}
                  </div>
                ))}
              </div>
            )}

            {/* New image previews */}
            {newPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {newPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square border border-dashed border-green-300">
                    <Image src={src} alt="" fill className="object-cover opacity-70" />
                    <button type="button"
                      onClick={() => { setNewImages((p) => p.filter((_, j) => j !== i)); setNewPreviews((p) => p.filter((_, j) => j !== i)) }}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-sm p-0.5"><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 p-4 cursor-pointer hover:border-[var(--brand-pink)] transition-colors">
              <Upload size={20} className="text-gray-400" />
              <span className="text-xs text-gray-500">Click to upload images</span>
              <span className="text-[10px] text-gray-400">JPEG, PNG, WebP — max 5MB each</span>
              <input type="file" multiple accept="image/*" onChange={handleFiles} className="sr-only" />
            </label>
          </div>
        </div>
      </div>
    </form>
  )
}
