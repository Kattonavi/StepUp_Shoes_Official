'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { useSnapshots } from '@/hooks/admin/useSnapshots'
import { useSnapshot } from '@/hooks/admin/useSnapshot'
import { useRestoreMutation } from '@/hooks/admin/useRestoreMutation'
import type { AuditableEntityType, SnapshotFilters, SnapshotReason } from '@/types'
import EntityTypeBadge from './EntityTypeBadge'
import SnapshotDiffViewer from './SnapshotDiffViewer'
import RestoreSnapshotDialog from './RestoreSnapshotDialog'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import ErrorState from '@/components/common/ErrorState'
import { formatDistanceToNow } from '@/components/admin/users/date-utils'
import { cn } from '@/lib/utils'

const REASON_LABELS: Record<SnapshotReason, string> = {
  BEFORE_UPDATE:  'Antes de editar',
  AFTER_UPDATE:   'Después de editar',
  BEFORE_DELETE:  'Antes de eliminar',
  AFTER_RESTORE:  'Después de restaurar',
  MANUAL:         'Manual',
  SYSTEM:         'Sistema',
}

const REASON_CLASSES: Record<SnapshotReason, string> = {
  BEFORE_UPDATE:  'bg-yellow-500/15 text-yellow-400',
  AFTER_UPDATE:   'bg-blue-500/15 text-blue-400',
  BEFORE_DELETE:  'bg-destructive/15 text-destructive',
  AFTER_RESTORE:  'bg-teal-500/15 text-teal-400',
  MANUAL:         'bg-muted text-muted-foreground',
  SYSTEM:         'bg-muted text-muted-foreground',
}

const ENTITY_TYPES: AuditableEntityType[] = [
  'USER', 'PRODUCT', 'CATEGORY', 'PRODUCT_IMAGE', 'PRODUCT_SIZE',
  'STORE_SETTINGS', 'MESSAGE', 'SYSTEM',
]

const RESTORABLE_REASONS: SnapshotReason[] = ['BEFORE_DELETE', 'BEFORE_UPDATE']

export default function SnapshotsTable() {
  const [filters, setFilters] = useState<SnapshotFilters>({ page: 0, size: 20 })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<{
    snapshotId: string
    entityType: AuditableEntityType
    entityId: string
  } | null>(null)

  const { data, isLoading, error, refetch } = useSnapshots(filters)
  const restoreMutation = useRestoreMutation()

  function setFilter<K extends keyof SnapshotFilters>(key: K, value: SnapshotFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value, page: 0 }))
  }

  if (isLoading) return <AdminTableSkeleton rows={8} cols={5} />
  if (error) return <ErrorState title="Error al cargar snapshots" onRetry={() => refetch()} />

  const snapshots = data?.content ?? []

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filters.entityType ?? ''}
          onChange={(e) => setFilter('entityType', (e.target.value as AuditableEntityType) || undefined)}
          className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Todos los tipos</option>
          {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={filters.reason ?? ''}
          onChange={(e) => setFilter('reason', (e.target.value as SnapshotReason) || undefined)}
          className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Todos los motivos</option>
          {Object.entries(REASON_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={filters.from?.slice(0, 16) ?? ''}
          onChange={(e) => setFilter('from', e.target.value ? `${e.target.value}:00Z` : undefined)}
          className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <input
          type="datetime-local"
          value={filters.to?.slice(0, 16) ?? ''}
          onChange={(e) => setFilter('to', e.target.value ? `${e.target.value}:00Z` : undefined)}
          className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['Tipo', 'Motivo', 'Entity ID', 'Datos', 'Fecha', 'Acciones', ''].map((h) => (
                <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {snapshots.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                  No hay snapshots disponibles.
                </td>
              </tr>
            )}
            {snapshots.map((snap) => {
              const isRestorable = RESTORABLE_REASONS.includes(snap.snapshotReason)
              return (
                <>
                  <tr
                    key={snap.id}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <EntityTypeBadge entityType={snap.entityType} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full',
                        REASON_CLASSES[snap.snapshotReason]
                      )}>
                        {REASON_LABELS[snap.snapshotReason]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-muted-foreground truncate block max-w-[140px]">
                        {snap.entityId}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {snap.hasBeforeData && <span className="text-yellow-400 mr-1">◀ antes</span>}
                      {snap.hasAfterData && <span className="text-green-400">▶ después</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(snap.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {isRestorable && (
                        <button
                          onClick={() => setRestoreTarget({
                            snapshotId: snap.id,
                            entityType: snap.entityType,
                            entityId: snap.entityId,
                          })}
                          className="flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restaurar
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpandedId(expandedId === snap.id ? null : snap.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {expandedId === snap.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {expandedId === snap.id && (
                    <tr key={`${snap.id}-detail`} className="border-b border-border bg-muted/10">
                      <td colSpan={7} className="px-4 py-4">
                        <SnapshotDetailRow id={snap.id} />
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{data.totalElements} snapshots total</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('page', (filters.page ?? 0) - 1)}
              disabled={(filters.page ?? 0) === 0}
              className="px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-muted transition-colors"
            >Anterior</button>
            <span className="px-3 py-1.5">{(filters.page ?? 0) + 1} / {data.totalPages}</span>
            <button
              onClick={() => setFilter('page', (filters.page ?? 0) + 1)}
              disabled={(filters.page ?? 0) >= data.totalPages - 1}
              className="px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-muted transition-colors"
            >Siguiente</button>
          </div>
        </div>
      )}

      {/* Restore dialog */}
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

function SnapshotDetailRow({ id }: { id: string }) {
  const { data, isLoading } = useSnapshot(id)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Cargando datos del snapshot...
      </div>
    )
  }

  if (!data) return <p className="text-sm text-muted-foreground">No se pudo cargar el snapshot.</p>

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        ID: <code className="font-mono text-primary">{data.id}</code> ·
        AuditLog: <code className="font-mono">{data.auditLogId ?? '—'}</code>
      </div>
      <SnapshotDiffViewer
        beforeData={data.beforeData}
        afterData={data.afterData}
      />
    </div>
  )
}
