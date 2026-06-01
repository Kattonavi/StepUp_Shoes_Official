'use client'

import Link from 'next/link'
import { Eye, CheckCheck, RotateCcw, Archive, Trash2 } from 'lucide-react'
import type { Message, Role } from '@/types'
import MessageStatusBadge from './MessageStatusBadge'
import MessageSourceBadge from './MessageSourceBadge'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import { formatDistanceToNow } from '@/components/admin/users/date-utils'
import {
  useMarkReadMutation,
  useMarkUnreadMutation,
  useArchiveMessageMutation,
  useDeleteMessageMutation,
} from '@/hooks/admin/useMessageMutations'

interface Props {
  messages: Message[]
  isLoading: boolean
  userRole: Role
}

export default function AdminMessagesTable({ messages, isLoading, userRole }: Props) {
  const markRead = useMarkReadMutation()
  const markUnread = useMarkUnreadMutation()
  const archive = useArchiveMessageMutation()
  const del = useDeleteMessageMutation()

  const canManage = ['SUPER_ADMIN', 'OWNER', 'ADMIN'].includes(userRole)
  const canDelete = ['SUPER_ADMIN', 'OWNER'].includes(userRole)

  if (isLoading) return <AdminTableSkeleton rows={8} cols={6} />

  if (messages.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        No hay mensajes para mostrar.
      </div>
    )
  }

  // Botonera de acciones compartida por la tabla (desktop) y las cards (mobile).
  function actions(msg: Message) {
    return (
      <>
        <Link
          href={`/admin/mensajes/${msg.id}`}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Ver detalle"
        >
          <Eye className="w-4 h-4" />
        </Link>
        {canManage && (
          <>
            {msg.status === 'UNREAD' ? (
              <button
                onClick={() => markRead.mutate(msg.id)}
                disabled={markRead.isPending}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Marcar leído"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            ) : msg.status === 'READ' ? (
              <button
                onClick={() => markUnread.mutate(msg.id)}
                disabled={markUnread.isPending}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Marcar no leído"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            ) : null}
            {msg.status !== 'ARCHIVED' && msg.status !== 'DELETED' && (
              <button
                onClick={() => archive.mutate(msg.id)}
                disabled={archive.isPending}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Archivar"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}
          </>
        )}
        {canDelete && msg.status !== 'DELETED' && (
          <button
            onClick={() => del.mutate(msg.id)}
            disabled={del.isPending}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* ── Desktop: tabla (md+). Igual que antes. ───────────── */}
      <table className="w-full hidden md:table">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {['Estado', 'Fuente', 'De', 'Contacto', 'Asunto', 'Fecha', ''].map((h) => (
              <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {messages.map((msg) => (
            <tr
              key={msg.id}
              className={`border-b border-border last:border-0 transition-colors ${
                msg.status === 'UNREAD' ? 'bg-primary/3 hover:bg-primary/5' : 'hover:bg-muted/20'
              }`}
            >
              <td className="px-4 py-3">
                <MessageStatusBadge status={msg.status} />
              </td>
              <td className="px-4 py-3">
                <MessageSourceBadge source={msg.source} />
              </td>
              <td className="px-4 py-3">
                <p className={`text-sm ${msg.status === 'UNREAD' ? 'font-semibold' : 'font-medium'}`}>
                  {msg.fullName}
                </p>
                {msg.productName && (
                  <p className="text-xs text-muted-foreground">📦 {msg.productName}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {msg.email ?? msg.phone ?? '—'}
                </p>
              </td>
              <td className="px-4 py-3 max-w-[200px]">
                <p className="text-sm text-muted-foreground truncate">
                  {msg.subject ?? '(sin asunto)'}
                </p>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(msg.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">{actions(msg)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Mobile: cards apiladas (< md). Sin scroll horizontal. ── */}
      <ul className="md:hidden divide-y divide-border">
        {messages.map((msg) => (
          <li
            key={msg.id}
            className={`p-4 ${msg.status === 'UNREAD' ? 'bg-primary/5' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <MessageStatusBadge status={msg.status} />
                <MessageSourceBadge source={msg.source} />
              </div>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                {formatDistanceToNow(msg.createdAt)}
              </span>
            </div>

            <Link href={`/admin/mensajes/${msg.id}`} className="block mt-2">
              <p className={`text-sm ${msg.status === 'UNREAD' ? 'font-semibold' : 'font-medium'}`}>
                {msg.fullName}
              </p>
              {msg.productName && (
                <p className="text-xs text-muted-foreground mt-0.5 break-words">
                  📦 {msg.productName}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5 break-all">
                {msg.email ?? msg.phone ?? '—'}
              </p>
              <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 break-words">
                {msg.subject ?? '(sin asunto)'}
              </p>
            </Link>

            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/60">
              {actions(msg)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
