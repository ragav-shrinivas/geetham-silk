'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PageNav from '@/components/common/PageNav'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(false)

  function set(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setBusy(true)
    const supabase = createClient()
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { full_name: form.name, phone: form.phone } },
    })
    if (err) { setError(err.message); setBusy(false); return }
    // If email confirmation is on, there's no active session yet.
    if (data.session) { router.push('/account'); router.refresh() }
    else { setConfirm(true); setBusy(false) }
  }

  const field = 'w-full border border-[var(--brand-pink)] bg-white px-3 py-2.5 text-sm text-[var(--brand-charcoal)] focus:outline-none focus:border-[var(--brand-rose)] rounded-none'

  return (
    <div className="pt-24 min-h-screen bg-[var(--brand-cream)] pb-24 lg:pb-0">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageNav fallback="/account" backLabel="Account" crumbs={[{ label: 'Account', href: '/account' }, { label: 'Register' }]} className="mb-10" />
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.35em] uppercase text-[var(--brand-rose)] mb-3">Join Geethams Silks</p>
          <h1 className="font-serif text-4xl font-light text-[var(--brand-charcoal)]">Create Account</h1>
        </div>

        {confirm ? (
          <div className="bg-white border border-[var(--brand-pink)]/30 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4"><Check size={24} /></div>
            <p className="font-serif text-xl font-light text-[var(--brand-charcoal)] mb-2">Almost there</p>
            <p className="text-sm text-gray-500">We’ve sent a confirmation link to <strong>{form.email}</strong>. Confirm your email, then sign in.</p>
            <Link href="/account/login" className="inline-flex mt-6 bg-[var(--brand-darkpink)] text-white text-[11px] tracking-[0.2em] uppercase px-8 py-3.5 hover:bg-[var(--brand-rose)] transition-colors">Go to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white border border-[var(--brand-pink)]/30 p-6 space-y-4">
            <input required placeholder="Full name" className={field} value={form.name} onChange={(e) => set('name', e.target.value)} />
            <input required placeholder="Phone" className={field} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            <input type="email" required placeholder="Email" className={field} value={form.email} onChange={(e) => set('email', e.target.value)} />
            <input type="password" required minLength={6} placeholder="Password (min 6 chars)" className={field} value={form.password} onChange={(e) => set('password', e.target.value)} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={busy} className="w-full min-h-[52px] bg-[var(--brand-darkpink)] text-white text-xs tracking-[0.2em] uppercase hover:bg-[var(--brand-rose)] transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {busy ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : 'Create Account'}
            </button>
            <p className="text-xs text-center text-[var(--brand-charcoal)]/60">
              Already have an account? <Link href="/account/login" className="text-[var(--brand-rose)] hover:underline">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
