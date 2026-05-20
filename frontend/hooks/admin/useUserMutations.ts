'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createAdminUser,
  updateAdminUser,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '@/services/admin-user.service'
import { getErrorMessage } from '@/lib/error-utils'
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
} from '@/types'

export function useUserMutations() {
  const qc = useQueryClient()

  function invalidate(id?: string) {
    qc.invalidateQueries({ queryKey: ['admin-users'] })
    if (id) qc.invalidateQueries({ queryKey: ['admin-user', id] })
  }

  const create = useMutation({
    mutationFn: (data: CreateUserRequest) => createAdminUser(data),
    onSuccess: () => {
      invalidate()
      toast.success('Usuario creado correctamente')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const updateName = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      updateAdminUser(id, data),
    onSuccess: (_, { id }) => {
      invalidate(id)
      toast.success('Nombre actualizado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const changeRole = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRoleRequest }) =>
      updateAdminUserRole(id, data),
    onSuccess: (_, { id }) => {
      invalidate(id)
      toast.success('Rol actualizado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const changeStatus = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateUserStatusRequest
    }) => updateAdminUserStatus(id, data),
    onSuccess: (_, { id }) => {
      invalidate(id)
      toast.success('Estado actualizado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return { create, updateName, changeRole, changeStatus }
}
