'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useDeletedItems } from '@/hooks/admin/useDeletedItems'
import { useRestoreMutation } from '@/hooks/admin/useRestoreMutation'
import type { AuditableEntityType, DeletedItemFilters } from '@/types'
import EntityTypeBadge from './EntityTypeBadge'
import RestoreSnapshotDialog from './RestoreSnapshotDialog'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import ErrorState from '@/components/common/ErrorState'
import { formatDistanceToNow } from '@/components/admin/users/date-utils'

const ENTITY_TYPES: AuditableEntityType[] = ['PRODUCT', 'CATEGORY', 'USER']

export default function DeletedItemsTable() {
  const [filters, setFilters] = useState<DeletedItemFilters>({ page: 0, size: 20 })
  const [restoreTarget, setRestoreTarget] = useState<{
    snapshotId: string
    entityType: AuditableEntityType
    entityId: string
  } | null>(null)

  const { data, isLoading, error, refetch } = useDeletedItems(filters)
  const restoreMutation = useRestoreMutation()

  if (isLoading) return <AdminTableSkeleton rows={6} cols={5} />
  if (error) return <ErrorState title="Error al cargar elementos eliminados" onRetry={() => refetch()} />

  const items = data?.content ?? []

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-3">
        <select
          value={filters.entityType ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              entityType: (e.target.value as AuditableEntityType) || undefined,
              page: 0,
            }))
          }
          className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Todos los tipos</option>
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['Tipo', 'Nombre/ID', 'Eliminado', 'Eliminado por', 'Restaurar'].map((h) => (
                <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                  No hay elementos eliminados.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr
                key={item.entityId}
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <EntityTypeBadge entityType={item.entityType} />
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{item.entityName ?? '—'}</p>
                  <code className="text-[10px] font-mono text-muted-foreground truncate block max-w-[180px]">
                    {item.entityId}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(item.deletedAt)}
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs font-mono text-muted-foreground truncate block max-w-[160px]">
                    {item.deletedBy ?? '—'}
                  </code>
                </td>
                <td className="px-4 py-3">
                  {item.latestSnapshotId ? (
                    <button
                      onClick={() => setRestoreTarget({
                        snapshotId: item.latestSnapshotId!,
                        entityType: item.entityType,
                        entityId: item.entityId,
                      })}
                      className="flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restaurar
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin snapshot</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{data.totalElements} elementos eliminados</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 0) - 1 }))}
              disabled={(filters.page ?? 0) === 0}
              className="px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-muted transition-colors"
            >Anterior</button>
            <span className="px-3 py-1.5">{(filters.page ?? 0) + 1} / {data.totalPages}</span>
            <button
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 0) + 1 }))}
              disabled={(filters.page ?? 0) >= data.totalPages - 1}
              className="px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-muted transition-colors"
            >Siguiente</button>
          </div>
        </div>
      )}

      {restoreTarget && (
        <RestoreSnapshotDialog
          open={!!restoreTarget}
          snapshotId={restoreTarget.snapshotId}
          entityType={restoreTarget.entityType}
          entityId={restoreTarget.entityId}
          loading={restoreMutation.isPending}
          onConfirm={(snapshotId, reason) => {
            restoreMutation.mutate(
              { snapshotId, reason },
              { onSuccess: () => setRestoreTarget(null) }
            )
          }}
          onCancel={() => setRestoreTarget(null)}
        />
      )}
    </div>
  )
}
