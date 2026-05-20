import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  markMessageRead,
  markMessageUnread,
  archiveMessage,
  deleteMessage,
  restoreMessage,
  updateMessageNotes,
} from '@/services/admin-message.service'
import type { UpdateMessageNotesRequest } from '@/types'
import { getErrorMessage } from '@/lib/error-utils'
import { toast } from 'sonner'

function invalidateMessages(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['admin-messages'] })
  qc.invalidateQueries({ queryKey: ['admin-message'] })
  qc.invalidateQueries({ queryKey: ['messages-unread-count'] })
}

export function useMarkReadMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markMessageRead(id),
    onSuccess: () => { invalidateMessages(qc); toast.success('Marcado como leído') },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useMarkUnreadMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markMessageUnread(id),
    onSuccess: () => { invalidateMessages(qc); toast.success('Marcado como no leído') },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useArchiveMessageMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => archiveMessage(id),
    onSuccess: () => { invalidateMessages(qc); toast.success('Mensaje archivado') },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useDeleteMessageMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: () => { invalidateMessages(qc); toast.success('Mensaje eliminado') },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useRestoreMessageMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => restoreMessage(id),
    onSuccess: () => { invalidateMessages(qc); toast.success('Mensaje restaurado') },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useUpdateNotesMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMessageNotesRequest }) =>
      updateMessageNotes(id, payload),
    onSuccess: () => { invalidateMessages(qc); toast.success('Notas actualizadas') },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}
