'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { LayoutGrid } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useProductFilters } from '@/hooks/useProductFilters'
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking'
import ProductGrid from '@/components/product/ProductGrid'
import ProductSkeleton from '@/components/product/ProductSkeleton'
import ProductEmptyState from '@/components/product/ProductEmptyState'
import ProductFilters from '@/components/product/ProductFilters'
import ProductSort from '@/components/product/ProductSort'
import ProductPagination from '@/components/product/ProductPagination'
import ErrorState from '@/components/common/ErrorState'
import type { ProductSortOption } from '@/types'

export default function CatalogoContent() {
  // useSearchParams is safe here — this component is wrapped in <Suspense>
  useSearchParams() // trigger re-render on URL change

  const { filters, setFilter, setPage, clearFilters, hasActiveFilters } =
    useProductFilters()

  const {
    data: productsPage,
    isLoading: productsLoading,
    error: productsError,
    refetch,
  } = useProducts(filters)

  const { data: categories = [] } = useCategories()
  const { track } = useAnalyticsTracking()

  // Track CATALOG_VIEW once on mount
  const didTrackView = useRef(false)
  useEffect(() => {
    if (!didTrackView.current) {
      didTrackView.current = true
      const eventType = filters.categorySlug ? 'CATEGORY_VIEW' : 'CATALOG_VIEW'
      track(eventType, {
        categorySlug: filters.categorySlug ?? undefined,
        source: 'catalog-page',
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track SEARCH with debounce when search query changes
  const searchRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    const q = filters.search
    if (q && q.trim().length > 1 && q !== searchRef.current) {
      searchRef.current = q
      const t = setTimeout(() => {
        track('SEARCH', { searchQuery: q, source: 'catalog-search' })
      }, 1200)
      return () => clearTimeout(t)
    }
  }, [filters.search, track])

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8">
      {/* Page title */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
          <span className="w-5 h-0.5 bg-primary rounded" />
          Catálogo
        </p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          Encuentra <span className="text-primary">tu próximo favorito</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          {productsPage
            ? buildCatalogCount(productsPage.totalElements, hasActiveFilters)
            : 'Explora zapatos, ropa y accesorios. Usa los filtros para afinar tu búsqueda.'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Filters sidebar ── */}
        <aside className="lg:w-64 lg:shrink-0">
          <div className="lg:sticky lg:top-24 bg-card border border-border rounded-xl p-5">
            <ProductFilters
              filters={filters}
              categories={categories}
              hasActiveFilters={hasActiveFilters}
              onFilterChange={setFilter}
              onClearFilters={clearFilters}
            />
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LayoutGrid className="w-4 h-4" />
              {!productsLoading && productsPage && (
                <span>
                  {productsPage.totalElements} resultado
                  {productsPage.totalElements !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <ProductSort
              value={filters.sort}
              onChange={(v: ProductSortOption) => setFilter('sort', v)}
            />
          </div>

          {/* States */}
          {productsLoading && <ProductSkeleton count={12} />}

          {productsError && !productsLoading && (
            <ErrorState
              title="No pudimos cargar el catálogo en este momento"
              message="Revisa tu conexión y vuelve a intentarlo. Si el problema persiste, escríbenos por WhatsApp."
              onRetry={() => refetch()}
            />
          )}

          {!productsLoading && !productsError && productsPage && (
            <>
              {productsPage.content.length === 0 ? (
                <ProductEmptyState
                  hasFilters={hasActiveFilters}
                  onClearFilters={clearFilters}
                />
              ) : (
                <>
                  <ProductGrid products={productsPage.content} />
                  <ProductPagination
                    page={filters.page ?? 0}
                    totalPages={productsPage.totalPages}
                    totalElements={productsPage.totalElements}
                    onPageChange={setPage}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Friendly counter copy:
 *  - filtered:    "5 referencias encontradas con tus filtros"
 *  - unfiltered:  "120 productos disponibles" / "1 producto disponible"
 *  - zero:        "Sin resultados — prueba otros filtros"
 */
function buildCatalogCount(total: number, hasFilters: boolean): string {
  if (total === 0) {
    return hasFilters
      ? 'Sin resultados con esos filtros — prueba otra combinación.'
      : 'Aún no hay productos publicados.'
  }
  if (hasFilters) {
    return total === 1
      ? '1 referencia encontrada con tus filtros'
      : `${total} referencias encontradas con tus filtros`
  }
  return total === 1
    ? '1 producto disponible para consultar'
    : `${total} productos disponibles para consultar`
}
