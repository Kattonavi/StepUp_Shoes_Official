/**
 * Servicios admin de categorías — requieren autenticación.
 */
import api from '@/lib/api'
import type {
  AdminCategoryFilters,
  ApiResponse,
  Category,
  CreateCategoryRequest,
  PageResponse,
  UpdateCategoryRequest,
  UpdateCategoryStatusRequest,
} from '@/types'

/** Lista admin con activas e inactivas — ADMIN+ */
export async function getAdminCategories(
  filters?: AdminCategoryFilters
): Promise<PageResponse<Category>> {
  const params: Record<string, string | number | boolean> = {
    page: filters?.page ?? 0,
    size: filters?.size ?? 50,
    sortBy: filters?.sortBy ?? 'position',
    sortDir: filters?.sortDir ?? 'asc',
    includeInactive: filters?.includeInactive ?? true,
    includeDeleted: filters?.includeDeleted ?? false,
  }

  const { data } = await api.get<ApiResponse<PageResponse<Category>>>(
    '/categories',
    { params }
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al cargar categorías')
  }
  return data.data
}

export async function getAdminCategoryById(id: string): Promise<Category> {
  const { data } = await api.get<ApiResponse<Category>>(`/categories/${id}`)
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Categoría no encontrada')
  }
  return data.data
}

/** Crear categoría — ADMIN+ */
export async function createCategory(
  request: CreateCategoryRequest
): Promise<Category> {
  const { data } = await api.post<ApiResponse<Category>>('/categories', request)
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al crear categoría')
  }
  return data.data
}

/** Actualizar categoría — ADMIN+ */
export async function updateCategory(
  id: string,
  request: UpdateCategoryRequest
): Promise<Category> {
  const { data } = await api.put<ApiResponse<Category>>(
    `/categories/${id}`,
    request
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al actualizar categoría')
  }
  return data.data
}

/** Activar/desactivar categoría — ADMIN+ */
export async function updateCategoryStatus(
  id: string,
  request: UpdateCategoryStatusRequest
): Promise<Category> {
  const { data } = await api.patch<ApiResponse<Category>>(
    `/categories/${id}/status`,
    request
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al cambiar estado de categoría')
  }
  return data.data
}

/** Soft delete — OWNER+ */
export async function deleteCategory(id: string): Promise<void> {
  const { data } = await api.delete<ApiResponse<null>>(`/categories/${id}`)
  if (!data.success) {
    throw new Error(data.message ?? 'Error al eliminar categoría')
  }
}

/** Restore — OWNER+ */
export async function restoreCategory(id: string): Promise<Category> {
  const { data } = await api.post<ApiResponse<Category>>(
    `/categories/${id}/restore`
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al restaurar categoría')
  }
  return data.data
}
