'use client'

import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAdminUser } from '@/hooks/admin/useAdminUser'
import { useUserMutations } from '@/hooks/admin/useUserMutations'
import AdminPageHeader from '@/components/admin/common/AdminPageHeader'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import UserEditForm from '@/components/admin/users/UserEditForm'
import ErrorState from '@/components/common/ErrorState'
import RoleGuard from '@/components/admin/RoleGuard'
import type {
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
} from '@/types'

function EditarUsuarioContent({ id }: { id: string }) {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { data: targetUser, isLoading, error, refetch } = useAdminUser(id)
  const { updateName, changeRole, changeStatus } = useUserMutations()

  if (!currentUser) return null

  if (isLoading) {
    return (
      <div>
        <AdminPageHeader title="Editar usuario" backHref="/admin/usuarios" />
        <AdminTableSkeleton rows={5} cols={2} />
      </div>
    )
  }

  if (error || !targetUser) {
    return (
      <div>
        <AdminPageHeader title="Editar usuario" backHref="/admin/usuarios" />
        <ErrorState
          title="No pudimos cargar el usuario"
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const handleSubmit = async (
    nameChange: UpdateUserRequest | null,
    roleChange: UpdateUserRoleRequest | null,
    statusChange: UpdateUserStatusRequest | null
  ) => {
    // Execute changes sequentially — stop on first error
    if (nameChange) {
      await updateName.mutateAsync({ id, data: nameChange })
    }
    if (roleChange) {
      await changeRole.mutateAsync({ id, data: roleChange })
    }
    if (statusChange) {
      await changeStatus.mutateAsync({ id, data: statusChange })
    }
    router.push('/admin/usuarios')
  }

  const isSubmitting =
    updateName.isPending || changeRole.isPending || changeStatus.isPending

  return (
    <div>
      <AdminPageHeader
        title={`Editar: ${targetUser.fullName}`}
        description={targetUser.email}
        backHref="/admin/usuarios"
      />
      <UserEditForm
        user={targetUser}
        currentUser={currentUser}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/usuarios')}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default function EditarUsuarioClient() {
  const params = useParams()
  const id = params.id as string

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'OWNER']} redirectTo="/admin">
      <EditarUsuarioContent id={id} />
    </RoleGuard>
  )
}
