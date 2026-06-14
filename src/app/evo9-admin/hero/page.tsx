import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminHeroClient from '@/components/admin/AdminHeroClient'

export const metadata = { title: 'Hero Slider' }

export default async function AdminHeroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')
  return <AdminShell><AdminHeroClient /></AdminShell>
}
