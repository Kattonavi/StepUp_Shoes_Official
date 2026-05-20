/**
 * Servicios de categorías para el storefront público.
 */
import api from '@/lib/api'
import type { ApiResponse, Category, PageResponse } from '@/types'

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiResponse<PageResponse<Category> | Category[]>>(
    '/categories'
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error al cargar categorías')
  }
  if (Array.isArray(data.data)) return data.data
  return (data.data as PageResponse<Category>).content
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const { data } = await api.get<ApiResponse<Category>>(
    `/categories/slug/${slug}`
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Categoría no encontrada')
  }
  return data.data
}

export async function getCategoryById(id: string): Promise<Category> {
  const { data } = await api.get<ApiResponse<Category>>(
    `/categories/${id}`
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Categoría no encontrada')
  }
  return data.data
}
