import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import ProductForm from '@/components/admin/products/ProductForm'

export const metadata = { title: 'Edit Product' }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/evo9-admin/login')

  const [{ data: product }, { data: categories }, { data: collections }] = await Promise.all([
    supabase.from('products').select('*, product_images(*)').eq('id', id).single(),
    supabase.from('categories').select('id, name').eq('is_active', true).order('name'),
    supabase.from('collections').select('id, name').eq('is_active', true).order('name'),
  ])

  if (!product) notFound()

  return (
    <AdminShell>
      <ProductForm product={product} categories={categories ?? []} collections={collections ?? []} />
    </AdminShell>
  )
}
