/**
 * Servicios admin de productos — requieren autenticación.
 * Usa el cliente Axios con interceptors (lib/api.ts) que adjunta Bearer token.
 */
import api from '@/lib/api'
import type {
  AdminProductFilters,
  ApiResponse,
  CreateProductRequest,
  PageResponse,
  Product,
  ProductSummary,
  UpdateProductRequest,
  UpdateProductStatusRequest,
  UpdateProductStockRequest,
  UpdateProductVisibilityRequest,
} from '@/types'

/** Lista admin: incluye DRAFT/HIDDEN. Solo ADMIN+ */
export async function getAdminProducts(
  filters?: AdminProductFilters
): Promise<PageResponse<ProductSummary>> {
  const params: Record<string, string | number | boolean> = {
    page: filters?.page ?? 0,
    size: filters?.size ?? 20,
  }
  if (filters?.includeDeleted) params.includeDeleted = true
  if (filters?.search && filters.search.trim()) params.search = filters.search.trim()
  if (filters?.categorySlug) params.categorySlug = filters.categorySlug
  if (filters?.stockStatus) params.stockStatus = filters.stockStatus
  if (filters?.isNew !== undefined) params.isNew = filters.isNew
  if (filters?.isFeatured !== undefined) params.isFeatured = filters.isFeatured
  if (filters?.isOnSale !== undefined) params.isOnSale = filters.isOnSale
  if (filters?.status) params.status = filters.status
  if (filters?.sort) params.sort = filters.sort

  const { data } = await api.get<ApiResponse<PageResponse<ProductSummary>>>(
    '/products/admin',
    { params }
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al cargar productos')
  }
  return data.data
}

/** Detalle completo para el formulario de edición */
export async function getAdminProductById(id: string): Promise<Product> {
  const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`)
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Producto no encontrado')
  }
  return data.data
}

/** Crear producto — EDITOR+ */
export async function createProduct(
  request: CreateProductRequest
): Promise<Product> {
  const { data } = await api.post<ApiResponse<Product>>('/products', request)
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al crear el producto')
  }
  return data.data
}

/** Actualizar producto completo — EDITOR+ */
export async function updateProduct(
  id: string,
  request: UpdateProductRequest
): Promise<Product> {
  const { data } = await api.put<ApiResponse<Product>>(
    `/products/${id}`,
    request
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al actualizar el producto')
  }
  return data.data
}

/** Cambiar visibilidad — EDITOR+ */
export async function updateProductVisibility(
  id: string,
  request: UpdateProductVisibilityRequest
): Promise<Product> {
  const { data } = await api.patch<ApiResponse<Product>>(
    `/products/${id}/visibility`,
    request
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al cambiar visibilidad')
  }
  return data.data
}

/** Cambiar stock status — EDITOR+ */
export async function updateProductStock(
  id: string,
  request: UpdateProductStockRequest
): Promise<Product> {
  const { data } = await api.patch<ApiResponse<Product>>(
    `/products/${id}/stock`,
    request
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al actualizar stock')
  }
  return data.data
}

/** Cambiar status (ACTIVE/DRAFT/HIDDEN) — ADMIN+ */
export async function updateProductStatus(
  id: string,
  request: UpdateProductStatusRequest
): Promise<Product> {
  const { data } = await api.patch<ApiResponse<Product>>(
    `/products/${id}/status`,
    request
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al cambiar estado')
  }
  return data.data
}

/** Soft delete — OWNER+ */
export async function deleteProduct(id: string): Promise<void> {
  const { data } = await api.delete<ApiResponse<null>>(`/products/${id}`)
  if (!data.success) {
    throw new Error(data.message ?? 'Error al eliminar el producto')
  }
}

/** Restore — OWNER+ */
export async function restoreProduct(id: string): Promise<Product> {
  const { data } = await api.post<ApiResponse<Product>>(
    `/products/${id}/restore`
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al restaurar el producto')
  }
  return data.data
}
