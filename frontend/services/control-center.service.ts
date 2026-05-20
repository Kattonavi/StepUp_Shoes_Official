/**
 * Servicios del Control Center — exclusivos para SUPER_ADMIN.
 * Usa el cliente Axios con interceptors (lib/api.ts).
 */
import api from '@/lib/api'
import type {
  ApiResponse,
  AuditLog,
  AuditLogDetail,
  AuditLogFilters,
  DeletedItem,
  DeletedItemFilters,
  EntitySnapshot,
  EntitySnapshotDetail,
  PageResponse,
  RestoreAction,
  SnapshotFilters,
} from '@/types'

// ─── Audit Logs ────────────────────────────────────────────────────────────

export async function getAuditLogs(
  filters?: AuditLogFilters
): Promise<PageResponse<AuditLog>> {
  const params: Record<string, string | number> = {
    page: filters?.page ?? 0,
    size: filters?.size ?? 20,
  }
  if (filters?.action) params.action = filters.action
  if (filters?.entityType) params.entityType = filters.entityType
  if (filters?.entityId) params.entityId = filters.entityId
  if (filters?.actorUserId) params.actorUserId = filters.actorUserId
  if (filters?.from) params.from = filters.from
  if (filters?.to) params.to = filters.to

  const { data } = await api.get<ApiResponse<PageResponse<AuditLog>>>(
    '/control-center/audit-logs',
    { params }
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al cargar audit logs')
  }
  return data.data
}

export async function getAuditLog(id: string): Promise<AuditLogDetail> {
  const { data } = await api.get<ApiResponse<AuditLogDetail>>(
    `/control-center/audit-logs/${id}`
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Audit log no encontrado')
  }
  return data.data
}

// ─── Snapshots ─────────────────────────────────────────────────────────────

export async function getSnapshots(
  filters?: SnapshotFilters
): Promise<PageResponse<EntitySnapshot>> {
  const params: Record<string, string | number> = {
    page: filters?.page ?? 0,
    size: filters?.size ?? 20,
  }
  if (filters?.entityType) params.entityType = filters.entityType
  if (filters?.entityId) params.entityId = filters.entityId
  if (filters?.reason) params.reason = filters.reason
  if (filters?.from) params.from = filters.from
  if (filters?.to) params.to = filters.to

  const { data } = await api.get<ApiResponse<PageResponse<EntitySnapshot>>>(
    '/control-center/snapshots',
    { params }
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al cargar snapshots')
  }
  return data.data
}

export async function getSnapshot(id: string): Promise<EntitySnapshotDetail> {
  const { data } = await api.get<ApiResponse<EntitySnapshotDetail>>(
    `/control-center/snapshots/${id}`
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Snapshot no encontrado')
  }
  return data.data
}

// ─── Deleted Items ──────────────────────────────────────────────────────────

export async function getDeletedItems(
  filters?: DeletedItemFilters
): Promise<PageResponse<DeletedItem>> {
  const params: Record<string, string | number> = {
    page: filters?.page ?? 0,
    size: filters?.size ?? 20,
  }
  if (filters?.entityType) params.entityType = filters.entityType

  const { data } = await api.get<ApiResponse<PageResponse<DeletedItem>>>(
    '/control-center/deleted-items',
    { params }
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al cargar elementos eliminados')
  }
  return data.data
}

// ─── Restore Actions ────────────────────────────────────────────────────────

export async function getRestoreActions(filters?: {
  page?: number
  size?: number
}): Promise<PageResponse<RestoreAction>> {
  const params = {
    page: filters?.page ?? 0,
    size: filters?.size ?? 20,
  }

  const { data } = await api.get<ApiResponse<PageResponse<RestoreAction>>>(
    '/control-center/restore-actions',
    { params }
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al cargar restauraciones')
  }
  return data.data
}

// ─── Restore from Snapshot ──────────────────────────────────────────────────

export async function restoreFromSnapshot(
  snapshotId: string,
  reason?: string
): Promise<RestoreAction> {
  const { data } = await api.post<ApiResponse<RestoreAction>>(
    `/control-center/restore/${snapshotId}`,
    { reason: reason ?? null }
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al restaurar')
  }
  return data.data
}
