import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminCategoriesClient from '@/components/admin/AdminCategoriesClient'

export const metadata = { title: 'Categories' }

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')
  return <AdminShell><AdminCategoriesClient /></AdminShell>
}
