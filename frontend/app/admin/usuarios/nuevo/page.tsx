'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUserMutations } from '@/hooks/admin/useUserMutations'
import AdminPageHeader from '@/components/admin/common/AdminPageHeader'
import UserCreateForm from '@/components/admin/users/UserCreateForm'
import RoleGuard from '@/components/admin/RoleGuard'
import type { CreateUserRequest } from '@/types'

function NuevoUsuarioContent() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { create } = useUserMutations()

  if (!currentUser) return null

  const handleSubmit = async (data: CreateUserRequest) => {
    await create.mutateAsync(data)
    router.push('/admin/usuarios')
  }

  return (
    <div>
      <AdminPageHeader
        title="Nuevo usuario"
        description="Crea un nuevo miembro del equipo"
        backHref="/admin/usuarios"
      />
      <UserCreateForm
        callerRole={currentUser.role}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/usuarios')}
        isSubmitting={create.isPending}
      />
    </div>
  )
}

export default function NuevoUsuarioPage() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'OWNER']} redirectTo="/admin">
      <NuevoUsuarioContent />
    </RoleGuard>
  )
}
