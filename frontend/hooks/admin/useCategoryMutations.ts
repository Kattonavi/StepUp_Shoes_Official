'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
  restoreCategory,
} from '@/services/admin-category.service'
import { getErrorMessage } from '@/lib/error-utils'
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  UpdateCategoryStatusRequest,
} from '@/types'

export function useCategoryMutations() {
  const qc = useQueryClient()

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['admin-categories'] })
    qc.invalidateQueries({ queryKey: ['categories'] })
  }

  const create = useMutation({
    mutationFn: (data: CreateCategoryRequest) => createCategory(data),
    onSuccess: () => {
      invalidate()
      toast.success('Categoría creada correctamente')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      updateCategory(id, data),
    onSuccess: () => {
      invalidate()
      toast.success('Categoría actualizada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const toggleStatus = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryStatusRequest }) =>
      updateCategoryStatus(id, data),
    onSuccess: () => {
      invalidate()
      toast.success('Estado de categoría actualizado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      invalidate()
      toast.success('Categoría eliminada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const restore = useMutation({
    mutationFn: (id: string) => restoreCategory(id),
    onSuccess: () => {
      invalidate()
      toast.success('Categoría restaurada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return { create, update, toggleStatus, remove, restore }
}
