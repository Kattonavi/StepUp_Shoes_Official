import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateSettings } from '@/services/settings.service'
import type { UpdateStoreSettingsRequest } from '@/types'
import { getErrorMessage } from '@/lib/error-utils'
import { toast } from 'sonner'

export function useUpdateSettingsMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateStoreSettingsRequest) => updateSettings(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
      qc.invalidateQueries({ queryKey: ['public-settings'] })
      toast.success('Configuración guardada correctamente')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}
