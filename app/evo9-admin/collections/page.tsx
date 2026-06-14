import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminCollectionsClient from '@/components/admin/AdminCollectionsClient'

export const metadata = { title: 'Collections' }

export default async function AdminCollectionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')
  return <AdminShell><AdminCollectionsClient /></AdminShell>
}
