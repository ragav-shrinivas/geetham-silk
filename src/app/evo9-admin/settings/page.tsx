import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminSettingsClient from '@/components/admin/AdminSettingsClient'

export const metadata = { title: 'Settings' }

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')
  return <AdminShell><AdminSettingsClient /></AdminShell>
}
