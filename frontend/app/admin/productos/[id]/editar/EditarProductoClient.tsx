'use client'

import { useRouter, useParams } from 'next/navigation'
import { useAdminProduct } from '@/hooks/admin/useAdminProduct'
import { useAdminCategories } from '@/hooks/admin/useAdminCategories'
import { useProductMutations } from '@/hooks/admin/useProductMutations'
import AdminPageHeader from '@/components/admin/common/AdminPageHeader'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import ProductForm from '@/components/admin/products/ProductForm'
import ErrorState from '@/components/common/ErrorState'
import type { CreateProductRequest } from '@/types'

export default function EditarProductoClient() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const { data: product, isLoading: productLoading, error: productError, refetch } = useAdminProduct(id)
  const { data: categoriesPage } = useAdminCategories()
  const { update } = useProductMutations()

  const categories = categoriesPage?.content ?? []

  const handleSubmit = async (data: CreateProductRequest) => {
    await update.mutateAsync({ id, data })
    router.push('/admin/productos')
  }

  if (productLoading) {
    return (
      <div>
        <AdminPageHeader title="Editar producto" backHref="/admin/productos" />
        <AdminTableSkeleton rows={6} cols={2} />
      </div>
    )
  }

  if (productError || !product) {
    return (
      <div>
        <AdminPageHeader title="Editar producto" backHref="/admin/productos" />
        <ErrorState
          title="No pudimos cargar el producto"
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div>
      <AdminPageHeader
        title={`Editar: ${product.name}`}
        description={`ID: ${product.id}`}
        backHref="/admin/productos"
      />

      <ProductForm
        product={product}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/productos')}
        isSubmitting={update.isPending}
      />
    </div>
  )
}
