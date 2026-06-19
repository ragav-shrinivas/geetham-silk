import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminOrdersClient from '@/components/admin/AdminOrdersClient'

export const metadata = { title: 'Orders' }

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')

  return (
    <AdminShell>
      <AdminOrdersClient />
    </AdminShell>
  )
}
