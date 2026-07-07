'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingBag, MessageCircle, UserCircle, LogOut, Package, MapPin, Plus, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { useUser } from '@/lib/auth/useUser'
import { formatPrice } from '@/lib/utils'
import { SITE } from '@/lib/constants'
import PageNav from '@/components/common/PageNav'

interface Order { id: string; order_number: string; status: string; total: number; created_at: string; order_items: { id: string; product_name: string; quantity: number }[] }
interface Address { id: string; full_name: string; phone: string; line1: string; line2: string | null; city: string; state: string | null; pincode: string; is_default: boolean }

const STATUS_STYLE: Record<string, string> = {
  pending: 'text-amber-600', confirmed: 'text-blue-600', processing: 'text-indigo-600',
  shipped: 'text-purple-600', delivered: 'text-green-600', cancelled: 'text-gray-400', returned: 'text-red-500',
}

export default function AccountPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const waMsg = encodeURIComponent('Hi Geethams Silks, I need help with my order.')

  if (loading) {
    return <div className="min-h-screen bg-[var(--brand-cream)] flex items-center justify-center"><Loader2 className="animate-spin text-[var(--brand-rose)]" /></div>
  }

  return (
    <div className="min-h-screen bg-[var(--brand-cream)] pb-24 lg:pb-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageNav fallback="/" backLabel="Home" crumbs={[{ label: 'Account' }]} className="mb-10" />
        {user ? <SignedIn user={user} onSignOut={async () => { await createClient().auth.signOut(); router.refresh() }} /> : <SignedOut waMsg={waMsg} />}
      </div>
    </div>
  )
}

/* -------------------------------------------------- signed-out */
function SignedOut({ waMsg }: { waMsg: string }) {
  return (
    <>
      <div className="text-center mb-10">
        <UserCircle size={48} strokeWidth={1} className="mx-auto text-[var(--brand-rose)] mb-4" />
        <h1 className="font-serif text-4xl lg:text-5xl font-light text-[var(--brand-charcoal)]">My Account</h1>
        <p className="text-gray-500 mt-3 max-w-md mx-auto text-sm">Sign in to track orders, save addresses and check out faster.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
        <Link href="/account/login" className="inline-flex items-center justify-center bg-[var(--brand-darkpink)] text-white text-[11px] tracking-[0.22em] uppercase px-8 py-4 hover:bg-[var(--brand-rose)] transition-colors">Sign In</Link>
        <Link href="/account/register" className="inline-flex items-center justify-center border border-[var(--brand-charcoal)] text-[var(--brand-charcoal)] text-[11px] tracking-[0.22em] uppercase px-8 py-4 hover:bg-[var(--brand-darkpink)] hover:text-white transition-colors">Create Account</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[{ href: '/wishlist', icon: Heart, label: 'Wishlist' }, { href: '/cart', icon: ShoppingBag, label: 'Shopping Bag' }].map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className="group flex items-center gap-4 bg-white border border-[var(--brand-pink)]/30 p-5 hover:border-[var(--brand-rose)] transition-colors">
            <Icon size={22} className="text-[var(--brand-rose)]" />
            <span className="font-serif text-lg font-light text-[var(--brand-charcoal)] group-hover:text-[var(--brand-rose)] transition-colors">{label}</span>
          </Link>
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 mt-8">
        Need help? <a href={`https://wa.me/${SITE.whatsapp}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-rose)] hover:underline inline-flex items-center gap-1"><MessageCircle size={12} /> Chat on WhatsApp</a>
      </p>
    </>
  )
}

/* -------------------------------------------------- signed-in */
function SignedIn({ user, onSignOut }: { user: { id: string; email?: string }; onSignOut: () => void }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [name, setName] = useState('')

  const load = useCallback(async () => {
    const sb = createAdminClient()
    const [{ data: o }, { data: a }, { data: prof }] = await Promise.all([
      sb.from('orders').select('id, order_number, status, total, created_at, order_items(id, product_name, quantity)').eq('customer_id', user.id).order('created_at', { ascending: false }),
      sb.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }),
      sb.from('profiles').select('full_name').eq('id', user.id).single(),
    ])
    setOrders((o as Order[]) ?? [])
    setAddresses((a as Address[]) ?? [])
    setName((prof as { full_name: string | null })?.full_name ?? '')
  }, [user.id])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl lg:text-4xl font-light text-[var(--brand-charcoal)]">Hello{name ? `, ${name.split(' ')[0]}` : ''}</h1>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>
        <button onClick={onSignOut} className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-gray-500 hover:text-red-500 transition-colors"><LogOut size={14} /> Sign Out</button>
      </div>

      {/* Orders */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-light text-[var(--brand-charcoal)] mb-4 flex items-center gap-2"><Package size={18} className="text-[var(--brand-rose)]" /> Order History</h2>
        {orders.length === 0 ? (
          <div className="bg-white border border-[var(--brand-pink)]/30 p-8 text-center text-sm text-gray-400">
            No orders yet. <Link href="/shop" className="text-[var(--brand-rose)] hover:underline">Start shopping</Link>.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="bg-white border border-[var(--brand-pink)]/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium text-[var(--brand-charcoal)]">{o.order_number}</span>
                  <span className={`text-[11px] uppercase tracking-wide font-medium ${STATUS_STYLE[o.status] ?? ''}`}>{o.status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {o.order_items.length} item(s)</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{o.order_items.map((it) => `${it.product_name} ×${it.quantity}`).join(', ')}</p>
                <p className="font-serif text-lg font-semibold text-[var(--brand-charcoal)] mt-2">{formatPrice(o.total)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Addresses */}
      <AddressBook userId={user.id} addresses={addresses} reload={load} />
    </>
  )
}

/* -------------------------------------------------- address book */
function AddressBook({ userId, addresses, reload }: { userId: string; addresses: Address[]; reload: () => void }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' })
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  async function save() {
    if (!form.full_name || !form.phone || !form.line1 || !form.city || !form.pincode) return
    setBusy(true)
    const sb = createAdminClient()
    await sb.from('addresses').insert({ ...form, user_id: userId, is_default: addresses.length === 0 })
    setBusy(false); setAdding(false)
    setForm({ full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' })
    reload()
  }
  async function remove(id: string) {
    const sb = createAdminClient()
    await sb.from('addresses').delete().eq('id', id)
    reload()
  }

  const field = 'w-full border border-[var(--brand-pink)] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand-rose)] rounded-none'

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-light text-[var(--brand-charcoal)] flex items-center gap-2"><MapPin size={18} className="text-[var(--brand-rose)]" /> Saved Addresses</h2>
        {!adding && <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.18em] uppercase text-[var(--brand-rose)] hover:underline"><Plus size={13} /> Add</button>}
      </div>

      {adding && (
        <div className="bg-white border border-[var(--brand-pink)]/30 p-5 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className={field} placeholder="Full name *" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
            <input className={field} placeholder="Phone *" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <input className={field} placeholder="Address line 1 *" value={form.line1} onChange={(e) => set('line1', e.target.value)} />
          <input className={field} placeholder="Address line 2" value={form.line2} onChange={(e) => set('line2', e.target.value)} />
          <div className="grid grid-cols-3 gap-3">
            <input className={field} placeholder="City *" value={form.city} onChange={(e) => set('city', e.target.value)} />
            <input className={field} placeholder="State" value={form.state} onChange={(e) => set('state', e.target.value)} />
            <input className={field} placeholder="PIN *" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={busy} className="bg-[var(--brand-darkpink)] text-white text-[11px] tracking-[0.18em] uppercase px-6 py-2.5 hover:bg-[var(--brand-rose)] transition-colors disabled:opacity-60">{busy ? 'Saving…' : 'Save'}</button>
            <button onClick={() => setAdding(false)} className="text-[11px] tracking-[0.18em] uppercase text-gray-500 px-4">Cancel</button>
          </div>
        </div>
      )}

      {addresses.length === 0 && !adding ? (
        <div className="bg-white border border-[var(--brand-pink)]/30 p-8 text-center text-sm text-gray-400">No saved addresses yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((a) => (
            <div key={a.id} className="bg-white border border-[var(--brand-pink)]/30 p-4 relative">
              {a.is_default && <span className="absolute top-3 right-3 text-[9px] tracking-wide uppercase bg-[var(--brand-rose)]/10 text-[var(--brand-rose)] px-2 py-0.5">Default</span>}
              <p className="font-medium text-sm text-[var(--brand-charcoal)]">{a.full_name}</p>
              <p className="text-xs text-gray-500 mt-1">{[a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(', ')}</p>
              <p className="text-xs text-gray-400 mt-1">{a.phone}</p>
              <button onClick={() => remove(a.id)} className="mt-3 inline-flex items-center gap-1 text-[10px] tracking-wide uppercase text-gray-400 hover:text-red-500"><Trash2 size={12} /> Remove</button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
