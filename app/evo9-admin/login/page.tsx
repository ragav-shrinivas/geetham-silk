'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push('/evo9-admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[var(--brand-charcoal)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[var(--brand-rose)]/20 rounded-full mb-4">
            <Lock className="text-[var(--brand-pink)]" size={24} />
          </div>
          <h1 className="font-serif text-3xl font-light text-white mb-1">Admin Access</h1>
          <p className="text-gray-400 text-xs tracking-widest uppercase">Geethams Silks</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 bg-white/5 border border-white/10 p-8">
          <div>
            <Label className="text-gray-300 mb-2 block" htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-[var(--brand-pink)]"
            />
          </div>
          <div>
            <Label className="text-gray-300 mb-2 block" htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-[var(--brand-pink)]"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-[var(--brand-rose)] hover:bg-[var(--brand-pink)] text-white">
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
