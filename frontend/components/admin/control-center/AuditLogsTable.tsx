'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useAuditLogs } from '@/hooks/admin/useAuditLogs'
import { useAuditLog } from '@/hooks/admin/useAuditLog'
import type { AuditAction, AuditableEntityType, AuditLogFilters } from '@/types'
import AuditActionBadge from './AuditActionBadge'
import EntityTypeBadge from './EntityTypeBadge'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import ErrorState from '@/components/common/ErrorState'
import { formatDistanceToNow } from '@/components/admin/users/date-utils'
import { cn } from '@/lib/utils'

const AUDIT_ACTIONS: AuditAction[] = [
  'CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE',
  'STATUS_CHANGE', 'ROLE_CHANGE', 'VISIBILITY_CHANGE', 'STOCK_CHANGE',
  'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'REFRESH_TOKEN', 'SYSTEM_SEED', 'SYSTEM_EVENT',
]

const ENTITY_TYPES: AuditableEntityType[] = [
  'USER', 'PRODUCT', 'CATEGORY', 'PRODUCT_IMAGE', 'PRODUCT_SIZE',
  'STORE_SETTINGS', 'MESSAGE', 'SYSTEM',
]

export default function AuditLogsTable() {
  const [filters, setFilters] = useState<AuditLogFilters>({ page: 0, size: 20 })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useAuditLogs(filters)

  function setFilter<K extends keyof AuditLogFilters>(key: K, value: AuditLogFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value, page: 0 }))
  }

  if (isLoading) return <AdminTableSkeleton rows={8} cols={6} />
  if (error) return <ErrorState title="Error al cargar audit logs" onRetry={() => refetch()} />

  const logs = data?.content ?? []

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filters.action ?? ''}
          onChange={(e) => setFilter('action', (e.target.value as AuditAction) || undefined)}
          className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Todas las acciones</option>
          {AUDIT_ACTIONS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <select
          value={filters.entityType ?? ''}
          onChange={(e) => setFilter('entityType', (e.target.value as AuditableEntityType) || undefined)}
          className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Todos los tipos</option>
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
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
              {['Acción', 'Entidad', 'Actor', 'Descripción', 'Fecha', ''].map((h) => (
                <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                  No hay eventos de auditoría para estos filtros.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <>
                <tr
                  key={log.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                >
                  <td className="px-4 py-3">
                    <AuditActionBadge action={log.action} />
                  </td>
                  <td className="px-4 py-3">
                    <EntityTypeBadge entityType={log.entityType} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-foreground">{log.actorEmail ?? 'Sistema'}</p>
                    {log.actorRole && (
                      <p className="text-[10px] text-muted-foreground">{log.actorRole}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                      {log.description ?? '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {expandedId === log.id
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </td>
                </tr>

                {/* Expandable detail row */}
                {expandedId === log.id && (
                  <tr key={`${log.id}-detail`} className="border-b border-border bg-muted/10">
                    <td colSpan={6} className="px-4 py-4">
                      <AuditLogDetailRow id={log.id} />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{data.totalElements} eventos total</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('page', (filters.page ?? 0) - 1)}
              disabled={(filters.page ?? 0) === 0}
              className="px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5">
              {(filters.page ?? 0) + 1} / {data.totalPages}
            </span>
            <button
              onClick={() => setFilter('page', (filters.page ?? 0) + 1)}
              disabled={(filters.page ?? 0) >= data.totalPages - 1}
              className="px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Inline detail panel loaded on demand */
function AuditLogDetailRow({ id }: { id: string }) {
  const { data, isLoading } = useAuditLog(id)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Cargando detalle...
      </div>
    )
  }

  if (!data) return <p className="text-sm text-muted-foreground">No se pudo cargar el detalle.</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div className="space-y-2">
        <DetailRow label="ID" value={data.id} mono />
        <DetailRow label="Entity ID" value={data.entityId ?? '—'} mono />
        <DetailRow label="Actor ID" value={data.actorUserId ?? 'Sistema'} mono />
        <DetailRow label="Descripción" value={data.description ?? '—'} />
      </div>
      <div className="space-y-2">
        <DetailRow label="IP Hash" value={data.ipAddressHash ?? '—'} mono />
        <DetailRow label="User Agent" value={data.userAgent ?? '—'} truncate />
        <DetailRow label="Fecha exacta" value={new Date(data.createdAt).toLocaleString('es-ES')} />
        {data.snapshots.length > 0 && (
          <div>
            <span className="text-xs text-muted-foreground">
              Snapshots asociados: {data.snapshots.length}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailRow({
  label, value, mono, truncate,
}: {
  label: string; value: string; mono?: boolean; truncate?: boolean
}) {
  return (
    <div>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}: </span>
      <span className={cn(
        'text-xs',
        mono && 'font-mono text-primary',
        truncate && 'block truncate max-w-xs'
      )}>
        {value}
      </span>
    </div>
  )
}
