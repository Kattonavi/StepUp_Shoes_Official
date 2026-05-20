'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAdminMessages } from '@/hooks/admin/useAdminMessages'
import type { MessageFilters } from '@/types'
import AdminPageHeader from '@/components/admin/common/AdminPageHeader'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import AdminMessagesTable from '@/components/admin/messages/AdminMessagesTable'
import MessageFiltersBar from '@/components/admin/messages/MessageFiltersBar'
import ErrorState from '@/components/common/ErrorState'

export default function MessagesClient() {
  const { user } = useAuth()
  const [filters, setFilters] = useState<MessageFilters>({ page: 0, size: 20 })
  const { data, isLoading, error, refetch } = useAdminMessages(filters)

  if (!user) return null

  const messages = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0
  const page = filters.page ?? 0

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Mensajes"
        description="Consultas y contactos recibidos desde el formulario público."
      />

      <MessageFiltersBar filters={filters} onChange={setFilters} />

      {error ? (
        <ErrorState title="Error al cargar mensajes" onRetry={() => refetch()} />
      ) : isLoading ? (
        <AdminTableSkeleton rows={8} cols={6} />
      ) : (
        <AdminMessagesTable
          messages={messages}
          isLoading={false}
          userRole={user.role}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{totalElements} mensajes</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters((f) => ({ ...f, page: page - 1 }))}
              disabled={page === 0}
              className="px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setFilters((f) => ({ ...f, page: page + 1 }))}
              disabled={page >= totalPages - 1}
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
