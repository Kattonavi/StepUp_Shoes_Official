'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createPromotion,
  updatePromotion,
  togglePromotionActive,
  deletePromotion,
} from '@/services/admin-promotion.service'
import { getErrorMessage } from '@/lib/error-utils'
import type { CreatePromotionRequest, UpdatePromotionRequest } from '@/types'

export function usePromotionMutations() {
  const qc = useQueryClient()

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['admin-promotions'] })
    qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
  }

  const create = useMutation({
    mutationFn: (data: CreatePromotionRequest) => createPromotion(data),
    onSuccess: () => {
      invalidate()
      toast.success('Promoción creada correctamente')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromotionRequest }) =>
      updatePromotion(id, data),
    onSuccess: () => {
      invalidate()
      toast.success('Promoción actualizada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      togglePromotionActive(id, active),
    onSuccess: (_, { active }) => {
      invalidate()
      toast.success(active ? 'Promoción activada' : 'Promoción desactivada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deletePromotion(id),
    onSuccess: () => {
      invalidate()
      toast.success('Promoción eliminada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return { create, update, toggleActive, remove }
}
