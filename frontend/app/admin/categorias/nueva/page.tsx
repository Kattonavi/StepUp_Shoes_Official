'use client'

import { useRouter } from 'next/navigation'
import { useCategoryMutations } from '@/hooks/admin/useCategoryMutations'
import AdminPageHeader from '@/components/admin/common/AdminPageHeader'
import CategoryForm from '@/components/admin/categories/CategoryForm'
import type { CreateCategoryRequest } from '@/types'

export default function NuevaCategoriаPage() {
  const router = useRouter()
  const { create } = useCategoryMutations()

  const handleSubmit = async (data: CreateCategoryRequest) => {
    await create.mutateAsync(data)
    router.push('/admin/categorias')
  }

  return (
    <div>
      <AdminPageHeader
        title="Nueva categoría"
        description="Completa la información de la categoría"
        backHref="/admin/categorias"
      />
      <CategoryForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/categorias')}
        isSubmitting={create.isPending}
      />
    </div>
  )
}
