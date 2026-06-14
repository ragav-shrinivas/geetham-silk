import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminTestimonialsClient from '@/components/admin/AdminTestimonialsClient'

export const metadata = { title: 'Testimonials' }

export default async function AdminTestimonialsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')
  return <AdminShell><AdminTestimonialsClient /></AdminShell>
}
