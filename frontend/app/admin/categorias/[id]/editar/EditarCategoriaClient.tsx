'use client'

import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useCategoryMutations } from '@/hooks/admin/useCategoryMutations'
import { getAdminCategoryById } from '@/services/admin-category.service'
import AdminPageHeader from '@/components/admin/common/AdminPageHeader'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import CategoryForm from '@/components/admin/categories/CategoryForm'
import ErrorState from '@/components/common/ErrorState'
import type { UpdateCategoryRequest } from '@/types'

export default function EditarCategoriaClient() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const {
    data: category,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-category', id],
    queryFn: () => getAdminCategoryById(id),
    enabled: !!id,
    staleTime: 30_000,
  })

  const { update } = useCategoryMutations()

  const handleSubmit = async (data: UpdateCategoryRequest) => {
    await update.mutateAsync({ id, data })
    router.push('/admin/categorias')
  }

  if (isLoading) {
    return (
      <div>
        <AdminPageHeader title="Editar categoría" backHref="/admin/categorias" />
        <AdminTableSkeleton rows={4} cols={2} />
      </div>
    )
  }

  if (error || !category) {
    return (
      <div>
        <AdminPageHeader title="Editar categoría" backHref="/admin/categorias" />
        <ErrorState title="No pudimos cargar la categoría" onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div>
      <AdminPageHeader
        title={`Editar: ${category.name}`}
        backHref="/admin/categorias"
      />
      <CategoryForm
        category={category}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/categorias')}
        isSubmitting={update.isPending}
      />
    </div>
  )
}
