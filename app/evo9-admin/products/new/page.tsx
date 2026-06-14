import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import ProductForm from '@/components/admin/products/ProductForm'

export const metadata = { title: 'Add Product' }

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')

  const [{ data: categories }, { data: collections }] = await Promise.all([
    supabase.from('categories').select('id, name').eq('is_active', true).order('name'),
    supabase.from('collections').select('id, name').eq('is_active', true).order('name'),
  ])

  return (
    <AdminShell>
      <ProductForm categories={categories ?? []} collections={collections ?? []} />
    </AdminShell>
  )
}
