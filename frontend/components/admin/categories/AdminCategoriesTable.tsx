'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit2, Trash2, RotateCcw, ToggleLeft, ToggleRight } from 'lucide-react'
import type { Category, Role } from '@/types'
import { CategoryStatusBadge } from './CategoryStatusBadge'
import { CATEGORY_PERMISSIONS } from '../common/PermissionGate'
import ConfirmDialog from '../common/ConfirmDialog'
import { cn } from '@/lib/utils'

interface AdminCategoriesTableProps {
  categories: Category[]
  userRole: Role
  onToggleStatus: (id: string, active: boolean) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  isLoading?: boolean
}

export default function AdminCategoriesTable({
  categories,
  userRole,
  onToggleStatus,
  onDelete,
  onRestore,
  isLoading,
}: AdminCategoriesTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<Category | null>(null)

  const perms = CATEGORY_PERMISSIONS

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Categoría</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Slug</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Posición</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Estado</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                    No hay categorías.
                  </td>
                </tr>
              )}
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className={cn(
                    'border-b border-border last:border-0 hover:bg-muted/20 transition-colors',
                    cat.deletedAt && 'opacity-60'
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {cat.icon && <span className="text-xl">{cat.icon}</span>}
                      <div>
                        <p className="text-sm font-medium">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{cat.slug}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{cat.position}</td>
                  <td className="px-4 py-3">
                    <CategoryStatusBadge active={cat.active} deleted={!!cat.deletedAt} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!cat.deletedAt ? (
                        <>
                          {perms.canManage(userRole) && (
                            <>
                              <Link
                                href={`/admin/categorias/${cat.id}/editar`}
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => onToggleStatus(cat.id, !cat.active)}
                                disabled={isLoading}
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title={cat.active ? 'Desactivar' : 'Activar'}
                              >
                                {cat.active ? (
                                  <ToggleRight className="w-4 h-4 text-green-400" />
                                ) : (
                                  <ToggleLeft className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          )}
                          {perms.canDelete(userRole) && (
                            <button
                              onClick={() => setDeleteTarget(cat)}
                              disabled={isLoading}
                              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        perms.canRestore(userRole) && (
                          <button
                            onClick={() => setRestoreTarget(cat)}
                            disabled={isLoading}
                            className="p-2 rounded-lg text-muted-foreground hover:text-green-400 hover:bg-green-500/10 transition-colors"
                            title="Restaurar"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border">
          {categories.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">No hay categorías.</div>
          )}
          {categories.map((cat) => (
            <div key={cat.id} className={cn('p-4 space-y-3', cat.deletedAt && 'opacity-60')}>
              <div className="flex items-center gap-2">
                {cat.icon && <span className="text-2xl">{cat.icon}</span>}
                <div>
                  <p className="font-medium text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{cat.slug}</p>
                </div>
                <div className="ml-auto">
                  <CategoryStatusBadge active={cat.active} deleted={!!cat.deletedAt} />
                </div>
              </div>
              {!cat.deletedAt && perms.canManage(userRole) && (
                <Link
                  href={`/admin/categorias/${cat.id}/editar`}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium border border-border rounded-lg py-2 hover:bg-muted transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar categoría"
        message={`¿Eliminar "${deleteTarget?.name}"? Fallará si tiene productos asignados.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) { onDelete(deleteTarget.id); setDeleteTarget(null) }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!restoreTarget}
        title="Restaurar categoría"
        message={`¿Restaurar "${restoreTarget?.name}"? Quedará inactiva y deberás activarla manualmente.`}
        confirmLabel="Restaurar"
        variant="default"
        onConfirm={() => {
          if (restoreTarget) { onRestore(restoreTarget.id); setRestoreTarget(null) }
        }}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  )
}
