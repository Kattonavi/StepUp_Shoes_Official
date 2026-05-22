'use client'

import { CheckCheck, RotateCcw, Archive, Trash2, Mail, Phone } from 'lucide-react'
import type { MessageDetail, Role } from '@/types'
import MessageStatusBadge from './MessageStatusBadge'
import MessageSourceBadge from './MessageSourceBadge'
import MessageNotesForm from './MessageNotesForm'
import { formatDistanceToNow } from '@/components/admin/users/date-utils'
import {
  useMarkReadMutation,
  useMarkUnreadMutation,
  useArchiveMessageMutation,
  useDeleteMessageMutation,
  useRestoreMessageMutation,
} from '@/hooks/admin/useMessageMutations'

interface Props {
  message: MessageDetail
  userRole: Role
}

export default function MessageDetailPanel({ message, userRole }: Props) {
  const markRead = useMarkReadMutation()
  const markUnread = useMarkUnreadMutation()
  const archive = useArchiveMessageMutation()
  const del = useDeleteMessageMutation()
  const restore = useRestoreMessageMutation()

  const canManage = ['SUPER_ADMIN', 'OWNER', 'ADMIN'].includes(userRole)
  const canDelete = ['SUPER_ADMIN', 'OWNER'].includes(userRole)

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{message.fullName}</h2>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <MessageStatusBadge status={message.status} />
            <MessageSourceBadge source={message.source} />
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(message.createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {canManage && message.status === 'UNREAD' && (
            <button
              onClick={() => markRead.mutate(message.id)}
              disabled={markRead.isPending}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Marcar leído
            </button>
          )}
          {canManage && message.status === 'READ' && (
            <button
              onClick={() => markUnread.mutate(message.id)}
              disabled={markUnread.isPending}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> No leído
            </button>
          )}
          {canManage && message.status !== 'ARCHIVED' && message.status !== 'DELETED' && (
            <button
              onClick={() => archive.mutate(message.id)}
              disabled={archive.isPending}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Archive className="w-3.5 h-3.5" /> Archivar
            </button>
          )}
          {canDelete && message.status !== 'DELETED' && (
            <button
              onClick={() => del.mutate(message.id)}
              disabled={del.isPending}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          )}
          {canDelete && message.status === 'DELETED' && (
            <button
              onClick={() => restore.mutate(message.id)}
              disabled={restore.isPending}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restaurar
            </button>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {message.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <a href={`mailto:${message.email}`} className="text-primary hover:underline truncate">
              {message.email}
            </a>
          </div>
        )}
        {message.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-foreground">{message.phone}</span>
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}?text=Hola ${encodeURIComponent(message.fullName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:underline ml-1"
              >
                WhatsApp →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Subject + product */}
      {(message.subject || message.productName) && (
        <div className="space-y-1">
          {message.subject && (
            <p className="text-sm">
              <span className="text-muted-foreground">Asunto: </span>
              <span className="font-medium">{message.subject}</span>
            </p>
          )}
          {message.productName && (
            <p className="text-sm">
              <span className="text-muted-foreground">Producto: </span>
              <span className="font-medium">{message.productName}</span>
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="bg-muted/20 rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Mensaje</p>
        <p className="text-sm text-foreground whitespace-pre-wrap break-words overflow-y-auto max-h-[480px] leading-relaxed">{message.content}</p>
      </div>

      {/* Meta */}
      <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-4">
        {message.readAt && (
          <p>Leído: {formatDistanceToNow(message.readAt)}</p>
        )}
        {message.archivedAt && (
          <p>Archivado: {formatDistanceToNow(message.archivedAt)}</p>
        )}
        <p>ID: <code className="font-mono text-primary/80">{message.id}</code></p>
      </div>

      {/* Internal notes */}
      {canManage && (
        <MessageNotesForm messageId={message.id} currentNotes={message.internalNotes} />
      )}
    </div>
  )
}
