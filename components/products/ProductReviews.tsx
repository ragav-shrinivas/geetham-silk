'use client'
import { useEffect, useState, useCallback } from 'react'
import { Star, Loader2, Check } from 'lucide-react'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import Stars from '@/components/products/Stars'
import { cn } from '@/lib/utils'

interface Review {
  id: string; author_name: string; rating: number; title: string | null; body: string | null; created_at: string
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('product_reviews')
      .select('id, author_name, rating, title, body, created_at')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
    setReviews((data as Review[]) ?? [])
    setLoading(false)
  }, [productId])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const count = reviews.length
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0

  return (
    <section id="reviews" className="mt-20 border-t border-[var(--brand-pink)]/30 pt-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-serif text-3xl lg:text-4xl font-light text-[var(--brand-charcoal)]">
            Customer <em className="italic text-[var(--brand-rose)]">Reviews</em>
          </h2>
          {count > 0 && (
            <div className="flex items-center gap-3 mt-3">
              <Stars value={avg} size={18} />
              <span className="text-sm text-[var(--brand-charcoal)]">{avg.toFixed(1)} · {count} {count === 1 ? 'review' : 'reviews'}</span>
            </div>
          )}
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 border border-[var(--brand-charcoal)] text-[var(--brand-charcoal)] text-[11px] tracking-[0.2em] uppercase px-6 py-3 hover:bg-[var(--brand-charcoal)] hover:text-white transition-colors self-start">
            Write a Review
          </button>
        )}
      </div>

      {showForm && <ReviewForm productId={productId} onDone={() => setShowForm(false)} />}

      {loading ? (
        <p className="text-sm text-gray-400 py-6">Loading reviews…</p>
      ) : count === 0 ? (
        <p className="text-sm text-gray-500 py-6">No reviews yet — be the first to share your thoughts.</p>
      ) : (
        <div className="space-y-6 mt-8">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-[var(--brand-pink)]/20 pb-6 last:border-0">
              <div className="flex items-center gap-3 mb-2">
                <Stars value={r.rating} />
                {r.title && <span className="font-medium text-[var(--brand-charcoal)]">{r.title}</span>}
              </div>
              {r.body && <p className="text-sm text-gray-600 leading-relaxed mb-2">{r.body}</p>}
              <p className="text-xs text-gray-400">{r.author_name} · {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function ReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [form, setForm] = useState({ author_name: '', title: '', body: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (rating < 1) { setError('Please select a rating'); return }
    if (form.author_name.trim().length < 2) { setError('Please enter your name'); return }
    setError(''); setBusy(true)
    const supabase = createClient()
    const { error: err } = await supabase.from('product_reviews').insert({
      product_id: productId, rating, author_name: form.author_name.trim(),
      title: form.title.trim() || null, body: form.body.trim() || null, is_approved: false,
    })
    setBusy(false)
    if (err) { setError('Could not submit. Please try again.'); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="bg-[var(--brand-pink)]/10 border border-[var(--brand-pink)]/40 p-6 mb-8 flex items-center gap-3">
        <Check size={20} className="text-green-600" />
        <p className="text-sm text-[var(--brand-charcoal)]">Thank you! Your review will appear once approved.</p>
      </div>
    )
  }

  const field = 'w-full border border-[var(--brand-pink)] bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--brand-rose)] rounded-none'

  return (
    <form onSubmit={submit} className="bg-white border border-[var(--brand-pink)]/30 p-6 mb-8 space-y-4">
      <div>
        <p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">Your Rating *</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => setRating(i)} aria-label={`${i} star${i > 1 ? 's' : ''}`} className="p-0.5">
              <Star size={26} className={cn('transition-colors', i <= (hover || rating) ? 'fill-[var(--brand-gold)] text-[var(--brand-gold)]' : 'text-[var(--brand-charcoal)]/20')} />
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className={field} placeholder="Your name *" value={form.author_name} onChange={(e) => setForm((p) => ({ ...p, author_name: e.target.value }))} />
        <input className={field} placeholder="Review title (optional)" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
      </div>
      <textarea className={cn(field, 'resize-none')} rows={4} placeholder="Share your experience…" value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 bg-[var(--brand-charcoal)] text-white text-[11px] tracking-[0.2em] uppercase px-7 py-3 hover:bg-[var(--brand-rose)] transition-colors disabled:opacity-60">
          {busy ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : 'Submit Review'}
        </button>
        <button type="button" onClick={onDone} className="text-[11px] tracking-[0.2em] uppercase text-gray-500 px-4">Cancel</button>
      </div>
    </form>
  )
}
