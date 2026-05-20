'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createProduct,
  updateProduct,
  updateProductVisibility,
  updateProductStatus,
  updateProductStock,
  deleteProduct,
  restoreProduct,
} from '@/services/admin-product.service'
import { getErrorMessage } from '@/lib/error-utils'
import type {
  CreateProductRequest,
  UpdateProductRequest,
  UpdateProductVisibilityRequest,
  UpdateProductStatusRequest,
  UpdateProductStockRequest,
} from '@/types'

export function useProductMutations() {
  const qc = useQueryClient()

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['admin-products'] })
  }

  const create = useMutation({
    mutationFn: (data: CreateProductRequest) => createProduct(data),
    onSuccess: () => {
      invalidate()
      toast.success('Producto creado correctamente')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      updateProduct(id, data),
    onSuccess: (_, { id }) => {
      invalidate()
      qc.invalidateQueries({ queryKey: ['admin-product', id] })
      toast.success('Producto actualizado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const toggleVisibility = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductVisibilityRequest }) =>
      updateProductVisibility(id, data),
    onSuccess: () => {
      invalidate()
      toast.success('Visibilidad actualizada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const changeStatus = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductStatusRequest }) =>
      updateProductStatus(id, data),
    onSuccess: () => {
      invalidate()
      toast.success('Estado actualizado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const changeStock = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductStockRequest }) =>
      updateProductStock(id, data),
    onSuccess: () => {
      invalidate()
      toast.success('Stock actualizado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      invalidate()
      toast.success('Producto eliminado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const restore = useMutation({
    mutationFn: (id: string) => restoreProduct(id),
    onSuccess: () => {
      invalidate()
      toast.success('Producto restaurado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return { create, update, toggleVisibility, changeStatus, changeStock, remove, restore }
}
