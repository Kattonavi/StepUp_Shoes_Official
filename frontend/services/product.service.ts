/**
 * Servicios de productos para el storefront público.
 * Usa el cliente Axios con interceptors (lib/api.ts).
 */
import api from '@/lib/api'
import type {
  ApiResponse,
  PageResponse,
  Product,
  ProductFilters,
  ProductSummary,
} from '@/types'

function buildProductParams(
  filters?: ProductFilters
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}
  if (!filters) return params

  if (filters.categorySlug) params.categorySlug = filters.categorySlug
  if (filters.search) params.search = filters.search
  if (filters.minPrice !== undefined) params.minPrice = filters.minPrice
  if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice
  if (filters.stockStatus) params.stockStatus = filters.stockStatus
  if (filters.isNew === true) params.isNew = true
  if (filters.isOnSale === true) params.isOnSale = true
  if (filters.isFeatured === true) params.isFeatured = true
  if (filters.sort) params.sort = filters.sort
  if (filters.page !== undefined) params.page = filters.page
  if (filters.size !== undefined) params.size = filters.size

  return params
}

/** Listado público — devuelve ProductSummary (sin imágenes completas, solo mainImageUrl) */
export async function getProducts(
  filters?: ProductFilters
): Promise<PageResponse<ProductSummary>> {
  const { data } = await api.get<ApiResponse<PageResponse<ProductSummary>>>(
    '/products',
    { params: buildProductParams(filters) }
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al cargar productos')
  }
  return data.data
}

/** Detalle completo por slug — devuelve Product con images[], sizes[] */
export async function getProductBySlug(slug: string): Promise<Product> {
  const { data } = await api.get<ApiResponse<Product>>(
    `/products/slug/${slug}`
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Producto no encontrado')
  }
  return data.data
}

/** Detalle completo por ID */
export async function getProductById(id: string): Promise<Product> {
  const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`)
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Producto no encontrado')
  }
  return data.data
}
