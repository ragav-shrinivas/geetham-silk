import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import MediaLibraryClient from '@/components/admin/MediaLibraryClient'

export const metadata = { title: 'Media Library' }

export default async function AdminMediaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')
  return <AdminShell><MediaLibraryClient /></AdminShell>
}
