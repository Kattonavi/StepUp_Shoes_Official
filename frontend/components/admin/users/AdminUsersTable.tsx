'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit2, UserX, UserCheck, ShieldAlert, Trash2 } from 'lucide-react'
import type { AdminUser, AuthUser, Role, UserStatus } from '@/types'
import UserRoleBadge from './UserRoleBadge'
import UserStatusBadge from './UserStatusBadge'
import { USER_PERMISSIONS } from '@/components/admin/common/PermissionGate'
import ConfirmDialog from '@/components/admin/common/ConfirmDialog'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from './date-utils'

interface AdminUsersTableProps {
  users: AdminUser[]
  currentUser: AuthUser
  onChangeStatus: (id: string, status: UserStatus) => void
  onDeleteUser: (id: string) => void
  isLoading?: boolean
}

export default function AdminUsersTable({
  users,
  currentUser,
  onChangeStatus,
  onDeleteUser,
  isLoading,
}: AdminUsersTableProps) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')
  const [blockTarget, setBlockTarget] = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    const matchStatus = !statusFilter || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  function canEdit(target: AdminUser) {
    return USER_PERMISSIONS.canEditUser(
      currentUser.role,
      target.role,
      target.id === currentUser.id
    )
  }

  function canDelete(target: AdminUser) {
    return USER_PERMISSIONS.canDeleteUser(
      currentUser.role,
      target.role,
      target.id === currentUser.id
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="flex-1 min-w-48 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | '')}
          className="bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        >
          <option value="">Todos los roles</option>
          {currentUser.role === 'SUPER_ADMIN' && (
            <option value="SUPER_ADMIN">Super Admin</option>
          )}
          <option value="OWNER">Propietario</option>
          <option value="ADMIN">Administrador</option>
          <option value="EDITOR">Editor</option>
          <option value="VIEWER">Visor</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as UserStatus | '')}
          className="bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
          <option value="BLOCKED">Bloqueado</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  'Usuario', 'Rol', 'Estado', 'Último acceso', 'Acciones',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 last:text-right"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground text-sm"
                  >
                    {search || roleFilter || statusFilter
                      ? 'No se encontraron usuarios con esos criterios.'
                      : 'No hay usuarios.'}
                  </td>
                </tr>
              )}
              {filtered.map((user) => {
                const isSelf = user.id === currentUser.id
                const editable = canEdit(user)

                return (
                  <tr
                    key={user.id}
                    className={cn(
                      'border-b border-border last:border-0 hover:bg-muted/20 transition-colors',
                      isSelf && 'bg-primary/5'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-primary">
                            {user.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate max-w-[200px]">
                            {user.fullName}
                            {isSelf && (
                              <span className="ml-2 text-xs text-primary font-normal">
                                (tú)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <UserRoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {user.lastLoginAt
                        ? formatDistanceToNow(user.lastLoginAt)
                        : 'Nunca'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {user.role === 'SUPER_ADMIN' && !isSelf && (
                          <span
                            className="p-2 text-muted-foreground/40"
                            title="Sin acciones sobre SUPER_ADMIN"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </span>
                        )}

                        {editable && (
                          <>
                            <Link
                              href={`/admin/usuarios/${user.id}/editar`}
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>

                            {user.status === 'ACTIVE' ? (
                              <button
                                onClick={() => setBlockTarget(user)}
                                disabled={isLoading}
                                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title="Bloquear"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : user.status === 'BLOCKED' || user.status === 'INACTIVE' ? (
                              <button
                                onClick={() =>
                                  onChangeStatus(user.id, 'ACTIVE')
                                }
                                disabled={isLoading}
                                className="p-2 rounded-lg text-muted-foreground hover:text-green-400 hover:bg-green-500/10 transition-colors"
                                title="Activar"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            ) : null}

                            {canDelete(user) && (
                              <button
                                onClick={() => setDeleteTarget(user)}
                                disabled={isLoading}
                                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}

                        {/* Self: only edit fullName */}
                        {isSelf && !editable && (
                          <Link
                            href={`/admin/usuarios/${user.id}/editar`}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Editar mi nombre"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden divide-y divide-border">
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No hay usuarios.
            </div>
          )}
          {filtered.map((user) => {
            const isSelf = user.id === currentUser.id
            const editable = canEdit(user)

            return (
              <div
                key={user.id}
                className={cn('p-4 space-y-3', isSelf && 'bg-primary/5')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {user.fullName}
                      {isSelf && (
                        <span className="ml-1 text-xs text-primary font-normal">
                          (tú)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <UserRoleBadge role={user.role} />
                  <UserStatusBadge status={user.status} />
                </div>
                {(editable || isSelf) && (
                  <Link
                    href={`/admin/usuarios/${user.id}/editar`}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium border border-border rounded-lg py-2 hover:bg-muted transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirm block */}
      <ConfirmDialog
        open={!!blockTarget}
        title="Bloquear usuario"
        message={`¿Bloquear a "${blockTarget?.fullName}"? No podrá iniciar sesión hasta que lo actives nuevamente.`}
        confirmLabel="Bloquear"
        variant="danger"
        onConfirm={() => {
          if (blockTarget) {
            onChangeStatus(blockTarget.id, 'BLOCKED')
            setBlockTarget(null)
          }
        }}
        onCancel={() => setBlockTarget(null)}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar usuario"
        message={`¿Eliminar a "${deleteTarget?.fullName}" (${deleteTarget?.email})? Esta acción no se puede deshacer desde la interfaz.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteUser(deleteTarget.id)
            setDeleteTarget(null)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
