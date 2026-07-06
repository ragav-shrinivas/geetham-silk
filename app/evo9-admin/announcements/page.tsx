import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminAnnouncementsClient from '@/components/admin/AdminAnnouncementsClient'

export const metadata = { title: 'Announcements' }

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')
  return <AdminShell><AdminAnnouncementsClient /></AdminShell>
}
