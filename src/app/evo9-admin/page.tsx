import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminDashboard from '@/components/admin/AdminDashboard'

export const metadata = { title: 'Dashboard' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')

  return (
    <AdminShell>
      <AdminDashboard />
    </AdminShell>
  )
}
