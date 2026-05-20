'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminUser, AuthUser, Role, UpdateUserRequest, UpdateUserRoleRequest, UpdateUserStatusRequest, UserStatus } from '@/types'
import { getAssignableRoles, USER_PERMISSIONS } from '@/components/admin/common/PermissionGate'
import UserRoleBadge from './UserRoleBadge'
import UserStatusBadge from './UserStatusBadge'

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  OWNER: 'Propietario',
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  VIEWER: 'Visor',
}

const STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  BLOCKED: 'Bloqueado',
  DELETED: 'Eliminado',
}

const editSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido').max(255),
  role: z.enum(['SUPER_ADMIN', 'OWNER', 'ADMIN', 'EDITOR', 'VIEWER'] as const),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED'] as const),
})

type EditFormValues = z.infer<typeof editSchema>

interface UserEditFormProps {
  user: AdminUser
  currentUser: AuthUser
  onSubmit: (
    nameChange: UpdateUserRequest | null,
    roleChange: UpdateUserRoleRequest | null,
    statusChange: UpdateUserStatusRequest | null
  ) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export default function UserEditForm({
  user,
  currentUser,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: UserEditFormProps) {
  const isSelf = user.id === currentUser.id
  const canEditTarget = USER_PERMISSIONS.canEditUser(
    currentUser.role,
    user.role,
    isSelf
  )

  // Self can edit their own fullName but not their role/status
  const canEditFullName = isSelf || canEditTarget
  const canEditRole = canEditTarget && !isSelf
  const canEditStatus = canEditTarget && !isSelf

  const assignableRoles: Role[] = canEditRole
    ? getAssignableRoles(currentUser.role)
    : [user.role]

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    },
  })

  useEffect(() => {
    reset({
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  const handleFormSubmit = async (values: EditFormValues) => {
    const nameChange: UpdateUserRequest | null =
      canEditFullName && values.fullName !== user.fullName
        ? { fullName: values.fullName }
        : null

    const roleChange: UpdateUserRoleRequest | null =
      canEditRole && values.role !== user.role
        ? { role: values.role }
        : null

    const statusChange: UpdateUserStatusRequest | null =
      canEditStatus && values.status !== user.status
        ? { status: values.status }
        : null

    if (!nameChange && !roleChange && !statusChange) {
      onCancel()
      return
    }

    await onSubmit(nameChange, roleChange, statusChange)
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
      noValidate
    >
      {/* Self-edit warning */}
      {isSelf && (
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            Estás editando tu propio perfil. Solo puedes cambiar tu nombre.
            El rol y estado de tu cuenta no pueden modificarse aquí.
          </p>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border pb-3">
          Información del usuario
        </h2>

        {/* Email — read only */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium block text-muted-foreground">Email</label>
          <div className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-muted-foreground">
            {user.email}
          </div>
          <p className="text-xs text-muted-foreground">El email no puede modificarse.</p>
        </div>

        {/* Full name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium block">Nombre completo *</label>
          <input
            disabled={!canEditFullName || isSubmitting}
            className={cn(
              'w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed',
              errors.fullName ? 'border-destructive' : 'border-border'
            )}
            {...register('fullName')}
          />
          {errors.fullName && (
            <p className="text-destructive text-xs">{errors.fullName.message}</p>
          )}
        </div>

        {/* Role */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium block">Rol</label>
          {canEditRole ? (
            <select
              disabled={isSubmitting}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-60"
              {...register('role')}
            >
              {assignableRoles.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
              {/* Include current role if not in assignable list (shouldn't happen) */}
              {!assignableRoles.includes(user.role) && (
                <option value={user.role} disabled>
                  {ROLE_LABELS[user.role]} (actual)
                </option>
              )}
            </select>
          ) : (
            <div className="flex items-center gap-3">
              <UserRoleBadge role={user.role} />
              {!canEditRole && !isSelf && (
                <span className="text-xs text-muted-foreground">
                  No tienes permiso para cambiar este rol
                </span>
              )}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium block">Estado</label>
          {canEditStatus ? (
            <select
              disabled={isSubmitting}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-60"
              {...register('status')}
            >
              {(['ACTIVE', 'INACTIVE', 'BLOCKED'] as UserStatus[]).map(
                (s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                )
              )}
            </select>
          ) : (
            <div className="flex items-center gap-3">
              <UserStatusBadge status={user.status} />
              {!canEditStatus && !isSelf && (
                <span className="text-xs text-muted-foreground">
                  No tienes permiso para cambiar este estado
                </span>
              )}
            </div>
          )}
        </div>

        {/* Current values summary */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Creado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
            {user.lastLoginAt && (
              <> · Último acceso: {new Date(user.lastLoginAt).toLocaleDateString('es-ES')}</>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !canEditFullName}
          className="px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar cambios
        </button>
      </div>
    </form>
  )
}
