'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PageNav from '@/components/common/PageNav'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setBusy(true)
    const supabase = createClient()
    const redirectTo = `${window.location.origin}/account/reset`
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
    if (err) { setError(err.message); setBusy(false); return }
    setSent(true); setBusy(false)
  }

  const field = 'w-full border border-[var(--brand-pink)] bg-white px-3 py-2.5 text-sm text-[var(--brand-charcoal)] focus:outline-none focus:border-[var(--brand-rose)] rounded-none'

  return (
    <div className="min-h-screen bg-[var(--brand-cream)] pb-24 lg:pb-0">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageNav fallback="/account/login" backLabel="Sign In" crumbs={[{ label: 'Account', href: '/account' }, { label: 'Reset Password' }]} className="mb-10" />
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-light text-[var(--brand-charcoal)]">Reset Password</h1>
        </div>
        {sent ? (
          <div className="bg-white border border-[var(--brand-pink)]/30 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4"><Check size={24} /></div>
            <p className="text-sm text-gray-500">If an account exists for <strong>{email}</strong>, a reset link is on its way.</p>
            <Link href="/account/login" className="inline-flex mt-6 text-[11px] tracking-[0.2em] uppercase border-b border-[var(--brand-charcoal)]/30 pb-1 hover:text-[var(--brand-rose)] hover:border-[var(--brand-rose)] transition-colors">Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white border border-[var(--brand-pink)]/30 p-6 space-y-4">
            <p className="text-sm text-gray-500">Enter your email and we’ll send you a link to reset your password.</p>
            <input type="email" required placeholder="Email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={busy} className="w-full min-h-[52px] bg-[var(--brand-darkpink)] text-white text-xs tracking-[0.2em] uppercase hover:bg-[var(--brand-rose)] transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {busy ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
