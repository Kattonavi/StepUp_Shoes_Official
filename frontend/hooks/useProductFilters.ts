'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { ProductFilters, ProductSortOption, StockStatus } from '@/types'

const VALID_STOCK_STATUSES: StockStatus[] = [
  'AVAILABLE',
  'OUT_OF_STOCK',
  'ON_REQUEST',
]

const VALID_SORT_OPTIONS: ProductSortOption[] = [
  'newest',
  'price_asc',
  'price_desc',
  'name_asc',
  'featured',
]

export function useProductFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters: ProductFilters = {
    search: searchParams.get('search') ?? undefined,
    categorySlug: searchParams.get('categorySlug') ?? undefined,
    minPrice: searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : undefined,
    maxPrice: searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined,
    stockStatus: VALID_STOCK_STATUSES.includes(
      searchParams.get('stockStatus') as StockStatus
    )
      ? (searchParams.get('stockStatus') as StockStatus)
      : undefined,
    isNew: searchParams.get('isNew') === 'true' ? true : undefined,
    isOnSale: searchParams.get('isOnSale') === 'true' ? true : undefined,
    isFeatured: searchParams.get('isFeatured') === 'true' ? true : undefined,
    sort: VALID_SORT_OPTIONS.includes(
      searchParams.get('sort') as ProductSortOption
    )
      ? (searchParams.get('sort') as ProductSortOption)
      : undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
    size: 12,
  }

  function setFilter<K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) {
    const params = new URLSearchParams(searchParams.toString())

    // Reset to page 0 when any filter changes (except page itself)
    if (key !== 'page') params.delete('page')

    if (
      value === undefined ||
      value === null ||
      value === '' ||
      value === false
    ) {
      params.delete(key)
    } else if (typeof value === 'boolean') {
      params.set(key, String(value))
    } else {
      params.set(key, String(value))
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function setPage(page: number) {
    setFilter('page', page)
  }

  function clearFilters() {
    router.replace(pathname, { scroll: false })
  }

  const hasActiveFilters = !!(
    filters.search ||
    filters.categorySlug ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.stockStatus ||
    filters.isNew ||
    filters.isOnSale ||
    filters.isFeatured
  )

  return { filters, setFilter, setPage, clearFilters, hasActiveFilters }
}
