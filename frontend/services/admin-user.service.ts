/**
 * Servicios admin de usuarios — requieren autenticación OWNER o SUPER_ADMIN.
 * Usa el cliente Axios con interceptors (lib/api.ts).
 */
import api from '@/lib/api'
import type {
  AdminUser,
  AdminUserFilters,
  ApiResponse,
  CreateUserRequest,
  PageResponse,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
} from '@/types'

/** Lista de usuarios (filtrada por rol del caller en el backend) */
export async function getAdminUsers(
  filters?: AdminUserFilters
): Promise<PageResponse<AdminUser>> {
  const params: Record<string, number> = {
    page: filters?.page ?? 0,
    size: filters?.size ?? 50,
  }

  const { data } = await api.get<ApiResponse<PageResponse<AdminUser>>>(
    '/users',
    { params }
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al cargar usuarios')
  }
  return data.data
}

export async function getAdminUser(id: string): Promise<AdminUser> {
  const { data } = await api.get<ApiResponse<AdminUser>>(`/users/${id}`)
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Usuario no encontrado')
  }
  return data.data
}

/** Crear usuario — SUPER_ADMIN o OWNER según jerarquía */
export async function createAdminUser(
  request: CreateUserRequest
): Promise<AdminUser> {
  const { data } = await api.post<ApiResponse<AdminUser>>('/users', request)
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al crear usuario')
  }
  return data.data
}

/** Actualizar solo fullName — PATCH separados para rol y estado */
export async function updateAdminUser(
  id: string,
  request: UpdateUserRequest
): Promise<AdminUser> {
  const { data } = await api.put<ApiResponse<AdminUser>>(
    `/users/${id}`,
    request
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al actualizar usuario')
  }
  return data.data
}

export async function updateAdminUserRole(
  id: string,
  request: UpdateUserRoleRequest
): Promise<AdminUser> {
  const { data } = await api.patch<ApiResponse<AdminUser>>(
    `/users/${id}/role`,
    request
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al cambiar rol')
  }
  return data.data
}

export async function updateAdminUserStatus(
  id: string,
  request: UpdateUserStatusRequest
): Promise<AdminUser> {
  const { data } = await api.patch<ApiResponse<AdminUser>>(
    `/users/${id}/status`,
    request
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al cambiar estado')
  }
  return data.data
}
