import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import PageBuilderClient from '@/components/admin/PageBuilderClient'

export const metadata = { title: 'Page Builder' }

export default async function AdminHomepagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')
  return <AdminShell><PageBuilderClient /></AdminShell>
}
