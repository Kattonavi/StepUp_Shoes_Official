'use client'

import { useState } from 'react'
import { useRestoreActions } from '@/hooks/admin/useRestoreActions'
import EntityTypeBadge from './EntityTypeBadge'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import ErrorState from '@/components/common/ErrorState'
import { formatDistanceToNow } from '@/components/admin/users/date-utils'

export default function RestoreActionsTable() {
  const [page, setPage] = useState(0)
  const { data, isLoading, error, refetch } = useRestoreActions({ page, size: 20 })

  if (isLoading) return <AdminTableSkeleton rows={6} cols={5} />
  if (error) return <ErrorState title="Error al cargar restauraciones" onRetry={() => refetch()} />

  const actions = data?.content ?? []

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['Tipo', 'Entity ID', 'Restaurado por', 'Motivo', 'Fecha'].map((h) => (
                <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {actions.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                  No hay restauraciones registradas.
                </td>
              </tr>
            )}
            {actions.map((action) => (
              <tr
                key={action.id}
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <EntityTypeBadge entityType={action.entityType} />
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs font-mono text-muted-foreground truncate block max-w-[160px]">
                    {action.entityId}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-foreground">{action.restoredByEmail ?? '—'}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-muted-foreground max-w-xs line-clamp-2">
                    {action.reason ?? <em className="text-muted-foreground/60">Sin motivo</em>}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(action.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{data.totalElements} restauraciones</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 0}
              className="px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-muted transition-colors">
              Anterior
            </button>
            <span className="px-3 py-1.5">{page + 1} / {data.totalPages}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= data.totalPages - 1}
              className="px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-muted transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
