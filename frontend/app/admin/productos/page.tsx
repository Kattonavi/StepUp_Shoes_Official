'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAdminProducts } from '@/hooks/admin/useAdminProducts'
import { useProductMutations } from '@/hooks/admin/useProductMutations'
import AdminPageHeader from '@/components/admin/common/AdminPageHeader'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import AdminProductsTable from '@/components/admin/products/AdminProductsTable'
import ErrorState from '@/components/common/ErrorState'
import { PRODUCT_PERMISSIONS } from '@/components/admin/common/PermissionGate'

export default function AdminProductosPage() {
  const { user } = useAuth()
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const { data, isLoading, error, refetch } = useAdminProducts({
    includeDeleted,
    size: 50,
  })

  const { toggleVisibility, remove, restore } = useProductMutations()

  if (!user) return null

  const perms = PRODUCT_PERMISSIONS
  const canCreate = perms.canCreate(user.role)
  const canSeeDeleted = ['SUPER_ADMIN', 'OWNER'].includes(user.role)

  return (
    <div>
      <AdminPageHeader
        title="Productos"
        description={
          data
            ? `${data.totalElements} productos en total`
            : 'Gestión del catálogo de productos'
        }
        action={canCreate ? { label: 'Nuevo producto', href: '/admin/productos/nuevo' } : undefined}
      />

      {/* Filtros */}
      {canSeeDeleted && (
        <div className="flex items-center gap-3 mb-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            Incluir productos eliminados
          </label>
        </div>
      )}

      {/* Content */}
      {isLoading && <AdminTableSkeleton rows={8} cols={7} />}

      {error && !isLoading && (
        <ErrorState
          title="No pudimos cargar los productos"
          message="Verifica tu conexión e intenta nuevamente."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !error && data && (
        <AdminProductsTable
          products={data.content}
          userRole={user.role}
          isLoading={toggleVisibility.isPending || remove.isPending || restore.isPending}
          onToggleVisibility={(id, visible) =>
            toggleVisibility.mutate({ id, data: { visible } })
          }
          onDelete={(id) => remove.mutate(id)}
          onRestore={(id) => restore.mutate(id)}
        />
      )}
    </div>
  )
}
