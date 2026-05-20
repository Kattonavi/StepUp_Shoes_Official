'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAdminCategories } from '@/hooks/admin/useAdminCategories'
import { useCategoryMutations } from '@/hooks/admin/useCategoryMutations'
import AdminPageHeader from '@/components/admin/common/AdminPageHeader'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import AdminCategoriesTable from '@/components/admin/categories/AdminCategoriesTable'
import ErrorState from '@/components/common/ErrorState'
import { CATEGORY_PERMISSIONS } from '@/components/admin/common/PermissionGate'

export default function AdminCategoriasPage() {
  const { user } = useAuth()
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const { data, isLoading, error, refetch } = useAdminCategories({
    includeInactive: true,
    includeDeleted,
    size: 100,
  })

  const { toggleStatus, remove, restore } = useCategoryMutations()

  if (!user) return null

  const perms = CATEGORY_PERMISSIONS
  const canCreate = perms.canManage(user.role)
  const canSeeDeleted = ['SUPER_ADMIN', 'OWNER'].includes(user.role)

  return (
    <div>
      <AdminPageHeader
        title="Categorías"
        description={data ? `${data.totalElements} categorías` : 'Gestión de categorías del catálogo'}
        action={canCreate ? { label: 'Nueva categoría', href: '/admin/categorias/nueva' } : undefined}
      />

      {canSeeDeleted && (
        <div className="flex items-center gap-3 mb-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            Incluir categorías eliminadas
          </label>
        </div>
      )}

      {isLoading && <AdminTableSkeleton rows={6} cols={5} />}

      {error && !isLoading && (
        <ErrorState
          title="No pudimos cargar las categorías"
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !error && data && (
        <AdminCategoriesTable
          categories={data.content}
          userRole={user.role}
          isLoading={toggleStatus.isPending || remove.isPending || restore.isPending}
          onToggleStatus={(id, active) =>
            toggleStatus.mutate({ id, data: { active } })
          }
          onDelete={(id) => remove.mutate(id)}
          onRestore={(id) => restore.mutate(id)}
        />
      )}
    </div>
  )
}
