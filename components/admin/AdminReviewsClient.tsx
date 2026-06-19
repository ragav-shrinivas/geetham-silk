'use client'
import { useEffect, useState, useCallback } from 'react'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import Stars from '@/components/products/Stars'
import { Check, Trash2, EyeOff, MessageSquare } from 'lucide-react'

interface Review {
  id: string; product_id: string; author_name: string; rating: number
  title: string | null; body: string | null; is_approved: boolean; created_at: string
  products: { name: string; slug: string } | null
}

export default function AdminReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('product_reviews')
      .select('*, products(name, slug)')
      .order('created_at', { ascending: false })
    setReviews((data as Review[]) ?? [])
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  async function setApproved(id: string, value: boolean) {
    const supabase = createClient()
    await supabase.from('product_reviews').update({ is_approved: value }).eq('id', id)
    load()
  }
  async function remove(id: string) {
    if (!confirm('Delete this review?')) return
    const supabase = createClient()
    await supabase.from('product_reviews').delete().eq('id', id)
    load()
  }

  const visible = reviews.filter((r) => filter === 'all' ? true : filter === 'pending' ? !r.is_approved : r.is_approved)
  const pending = reviews.filter((r) => !r.is_approved).length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Product Reviews</h1>
        <p className="text-gray-500 text-sm mt-1">Approve reviews to publish them on the product page.</p>
      </div>

      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 text-xs tracking-wide uppercase rounded-full border transition-colors ${filter === f ? 'bg-[var(--brand-charcoal)] text-white border-[var(--brand-charcoal)]' : 'bg-white text-gray-500 border-gray-200 hover:border-[var(--brand-rose)]'}`}>
            {f}{f === 'pending' && pending > 0 ? ` (${pending})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-32 bg-white border border-gray-100 rounded-lg animate-pulse" />
      ) : visible.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-lg py-16 text-center">
          <MessageSquare size={36} strokeWidth={1} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No {filter === 'all' ? '' : filter} reviews.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((r) => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Stars value={r.rating} />
                    {r.title && <span className="font-medium text-sm text-[var(--brand-charcoal)]">{r.title}</span>}
                    {!r.is_approved && <span className="text-[10px] uppercase tracking-wide bg-amber-50 text-amber-600 px-2 py-0.5 rounded">Pending</span>}
                  </div>
                  {r.body && <p className="text-sm text-gray-600 mb-1">{r.body}</p>}
                  <p className="text-xs text-gray-400">{r.author_name} · {r.products?.name ?? 'product'} · {new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {r.is_approved ? (
                    <button onClick={() => setApproved(r.id, false)} title="Unpublish" className="inline-flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-200 rounded hover:border-amber-400 hover:text-amber-600 transition-colors"><EyeOff size={13} /> Hide</button>
                  ) : (
                    <button onClick={() => setApproved(r.id, true)} title="Approve" className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded hover:bg-green-100 transition-colors"><Check size={13} /> Approve</button>
                  )}
                  <button onClick={() => remove(r.id)} title="Delete" className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
