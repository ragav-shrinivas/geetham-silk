'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PageNav from '@/components/common/PageNav'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setBusy(true)
    const supabase = createClient()
    // The recovery link establishes a temporary session; updateUser sets the new password.
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) { setError(err.message); setBusy(false); return }
    router.push('/account')
    router.refresh()
  }

  const field = 'w-full border border-[var(--brand-pink)] bg-white px-3 py-2.5 text-sm text-[var(--brand-charcoal)] focus:outline-none focus:border-[var(--brand-rose)] rounded-none'

  return (
    <div className="pt-24 min-h-screen bg-[var(--brand-cream)] pb-24 lg:pb-0">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageNav fallback="/account" backLabel="Account" crumbs={[{ label: 'Account', href: '/account' }, { label: 'New Password' }]} className="mb-10" />
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-light text-[var(--brand-charcoal)]">Set New Password</h1>
        </div>
        <form onSubmit={submit} className="bg-white border border-[var(--brand-pink)]/30 p-6 space-y-4">
          <input type="password" required minLength={6} placeholder="New password (min 6 chars)" className={field} value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={busy} className="w-full min-h-[52px] bg-[var(--brand-darkpink)] text-white text-xs tracking-[0.2em] uppercase hover:bg-[var(--brand-rose)] transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2">
            {busy ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
