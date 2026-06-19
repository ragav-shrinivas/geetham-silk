'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Check } from 'lucide-react'
// untyped browser client for writes — the typed client infers `never` on inserts
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LUXE } from '@/lib/motion'

/**
 * Public customer-feedback form. Submissions land in the testimonials table
 * as inactive (pending) — the admin approves them from the Testimonials
 * screen, after which they appear in the homepage reviews carousel.
 */
export default function FeedbackForm() {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [website, setWebsite] = useState('') // honeypot — humans never see it
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (website.trim() !== '') {
      // bot filled the hidden field — pretend success, store nothing
      setDone(true)
      return
    }
    if (name.trim().length < 2) {
      setError('Please enter your name.')
      return
    }
    if (review.trim().length < 10) {
      setError('Please write a few words about your experience (at least 10 characters).')
      return
    }

    setSubmitting(true)
    const supabase = createClient()
    const { error: dbError } = await supabase.from('testimonials').insert({
      customer_name: name.trim().slice(0, 80),
      location: location.trim() ? location.trim().slice(0, 80) : null,
      rating,
      review: review.trim().slice(0, 1000),
      is_active: false,
      display_order: 999,
      avatar_url: null,
      product_id: null,
    })
    setSubmitting(false)

    if (dbError) {
      setError('Something went wrong — please try again, or message us on WhatsApp.')
      return
    }
    setDone(true)
  }

  return (
    <div className="bg-white border border-[var(--brand-pink)]/20 p-7 sm:p-10">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: LUXE }}
            className="text-center py-10"
          >
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--brand-pink)]/15 mb-5">
              <Check className="text-[var(--brand-rose)]" size={26} />
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-[var(--brand-charcoal)] mb-3">
              Thank you for your <em className="italic text-[var(--brand-rose)]">kind words</em>
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
              Your feedback has been received and will appear on our site once it&apos;s reviewed.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={false}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: LUXE }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="fb-name">Your Name *</Label>
                <Input id="fb-name" className="mt-1.5" value={name} maxLength={80}
                  onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="fb-location">Location</Label>
                <Input id="fb-location" className="mt-1.5" value={location} maxLength={80}
                  placeholder="Area, City" onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Your Rating</Label>
              <div className="flex gap-1.5 mt-2" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    className="p-0.5 transition-transform duration-200 hover:scale-110"
                  >
                    <Star
                      size={24}
                      className={
                        n <= (hoverRating || rating)
                          ? 'fill-[var(--brand-gold)] text-[var(--brand-gold)]'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="fb-review">Your Experience *</Label>
              <textarea
                id="fb-review"
                value={review}
                maxLength={1000}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                required
                placeholder="Tell us about the saree, the visit, the WhatsApp experience…"
                className="mt-1.5 flex w-full border border-[var(--brand-pink)] bg-white px-3 py-2 text-sm text-[var(--brand-charcoal)] focus:outline-none focus:border-[var(--brand-rose)] focus:ring-1 focus:ring-[var(--brand-rose)] rounded-none resize-none"
              />
            </div>

            {/* honeypot — hidden from humans, bots fill it */}
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute opacity-0 h-0 w-0 pointer-events-none"
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-[var(--brand-darkpink)] text-white text-xs tracking-[0.22em] uppercase font-medium px-9 py-4 hover:bg-[var(--brand-rose)] transition-colors duration-500 disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-rose)] focus-visible:ring-offset-2"
            >
              {submitting ? 'Sending…' : 'Share Feedback'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
