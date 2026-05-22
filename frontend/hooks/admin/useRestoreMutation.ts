'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { restoreFromSnapshot } from '@/services/control-center.service'
import { getErrorMessage } from '@/lib/error-utils'

export function useRestoreMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      snapshotId,
      reason,
    }: {
      snapshotId: string
      reason?: string
    }) => restoreFromSnapshot(snapshotId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cc-deleted-items'] })
      qc.invalidateQueries({ queryKey: ['cc-restore-actions'] })
      qc.invalidateQueries({ queryKey: ['cc-snapshots'] })
      qc.invalidateQueries({ queryKey: ['cc-audit-logs'] })
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      qc.invalidateQueries({ queryKey: ['admin-promotions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
      toast.success(
        'Entidad restaurada. Quedará en estado DRAFT/inactivo hasta que se active manualmente.'
      )
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}
