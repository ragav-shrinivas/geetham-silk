import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminCustomersClient from '@/components/admin/AdminCustomersClient'

export const metadata = { title: 'Customers' }

export default async function AdminCustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')

  return (
    <AdminShell>
      <AdminCustomersClient />
    </AdminShell>
  )
}
