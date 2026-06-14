import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminProductsClient from '@/components/admin/products/AdminProductsClient'

export const metadata = { title: 'Products' }

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')

  return (
    <AdminShell>
      <AdminProductsClient />
    </AdminShell>
  )
}
