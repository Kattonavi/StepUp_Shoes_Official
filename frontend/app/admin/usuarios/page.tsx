'use client'

import { useAuth } from '@/hooks/useAuth'
import { useAdminUsers } from '@/hooks/admin/useAdminUsers'
import { useUserMutations } from '@/hooks/admin/useUserMutations'
import AdminPageHeader from '@/components/admin/common/AdminPageHeader'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import AdminUsersTable from '@/components/admin/users/AdminUsersTable'
import ErrorState from '@/components/common/ErrorState'
import RoleGuard from '@/components/admin/RoleGuard'
import type { UserStatus } from '@/types'

function UsuariosContent() {
  const { user: currentUser } = useAuth()
  const { data, isLoading, error, refetch } = useAdminUsers({ size: 100 })
  const { changeStatus, deleteUser } = useUserMutations()

  if (!currentUser) return null

  const canCreate = ['SUPER_ADMIN', 'OWNER'].includes(currentUser.role)

  return (
    <div>
      <AdminPageHeader
        title="Usuarios"
        description={
          data
            ? `${data.totalElements} usuario${data.totalElements !== 1 ? 's' : ''} en el sistema`
            : 'Gestión del equipo administrativo'
        }
        action={canCreate ? { label: 'Nuevo usuario', href: '/admin/usuarios/nuevo' } : undefined}
      />

      {isLoading && <AdminTableSkeleton rows={6} cols={5} />}

      {error && !isLoading && (
        <ErrorState
          title="No pudimos cargar los usuarios"
          message="Verifica tu conexión e intenta nuevamente."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !error && data && (
        <AdminUsersTable
          users={data.content}
          currentUser={currentUser}
          isLoading={changeStatus.isPending || deleteUser.isPending}
          onChangeStatus={(id, status: UserStatus) =>
            changeStatus.mutate({ id, data: { status } })
          }
          onDeleteUser={(id) => deleteUser.mutate(id)}
        />
      )}
    </div>
  )
}

export default function AdminUsuariosPage() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'OWNER']} redirectTo="/admin">
      <UsuariosContent />
    </RoleGuard>
  )
}
