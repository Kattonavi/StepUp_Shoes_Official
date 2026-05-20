'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAdminMessage } from '@/hooks/admin/useAdminMessage'
import MessageDetailPanel from '@/components/admin/messages/MessageDetailPanel'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import ErrorState from '@/components/common/ErrorState'

interface Props {
  params: Promise<{ id: string }>
}

export default function MessageDetailPage({ params }: Props) {
  const { id } = use(params)
  const { user } = useAuth()
  const { data: message, isLoading, error, refetch } = useAdminMessage(id)

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/mensajes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mensajes
        </Link>
      </div>

      {isLoading && <AdminTableSkeleton rows={6} cols={2} />}

      {error && (
        <ErrorState title="Error al cargar el mensaje" onRetry={() => refetch()} />
      )}

      {message && user && (
        <div className="bg-card border border-border rounded-xl p-6">
          <MessageDetailPanel message={message} userRole={user.role} />
        </div>
      )}
    </div>
  )
}
