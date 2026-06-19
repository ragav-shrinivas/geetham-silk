import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminReviewsClient from '@/components/admin/AdminReviewsClient'

export const metadata = { title: 'Reviews' }

export default async function AdminReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')

  return (
    <AdminShell>
      <AdminReviewsClient />
    </AdminShell>
  )
}
