'use client'

import { useRouter } from 'next/navigation'
import { useAdminCategories } from '@/hooks/admin/useAdminCategories'
import { useProductMutations } from '@/hooks/admin/useProductMutations'
import AdminPageHeader from '@/components/admin/common/AdminPageHeader'
import ProductForm from '@/components/admin/products/ProductForm'
import type { CreateProductRequest } from '@/types'

export default function NuevoProductoPage() {
  const router = useRouter()
  const { data: categoriesPage } = useAdminCategories()
  const { create } = useProductMutations()

  const categories = categoriesPage?.content ?? []

  const handleSubmit = async (data: CreateProductRequest) => {
    await create.mutateAsync(data)
    router.push('/admin/productos')
  }

  return (
    <div>
      <AdminPageHeader
        title="Nuevo producto"
        description="Completa la información del producto"
        backHref="/admin/productos"
      />

      <ProductForm
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/productos')}
        isSubmitting={create.isPending}
      />
    </div>
  )
}
