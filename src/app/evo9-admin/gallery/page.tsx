import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminGalleryClient from '@/components/admin/AdminGalleryClient'

export const metadata = { title: 'Gallery' }

export default async function AdminGalleryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')
  return <AdminShell><AdminGalleryClient /></AdminShell>
}
