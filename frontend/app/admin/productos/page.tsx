'use client'

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAdminProducts } from '@/hooks/admin/useAdminProducts'
import { useAdminCategories } from '@/hooks/admin/useAdminCategories'
import { useProductMutations } from '@/hooks/admin/useProductMutations'
import AdminPageHeader from '@/components/admin/common/AdminPageHeader'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import AdminProductsTable from '@/components/admin/products/AdminProductsTable'
import ErrorState from '@/components/common/ErrorState'
import { PRODUCT_PERMISSIONS } from '@/components/admin/common/PermissionGate'
import type {
  AdminProductFilters,
  ProductSortOption,
  StockStatus,
} from '@/types'

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'name_asc', label: 'Nombre A-Z' },
  { value: 'featured', label: 'Destacados primero' },
]

const STOCK_OPTIONS: { value: StockStatus | ''; label: string }[] = [
  { value: '', label: 'Todos los stocks' },
  { value: 'AVAILABLE', label: 'Disponibles' },
  { value: 'OUT_OF_STOCK', label: 'Agotados' },
  { value: 'ON_REQUEST', label: 'Bajo pedido' },
]

export default function AdminProductosPage() {
  const { user } = useAuth()

  // Filter state — all changes refetch via React Query key
  const [search, setSearch] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [stockStatus, setStockStatus] = useState<StockStatus | ''>('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [isOnSale, setIsOnSale] = useState(false)
  const [sort, setSort] = useState<ProductSortOption>('newest')
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const { data: categoriesPage } = useAdminCategories()
  const categories = categoriesPage?.content ?? []

  const filters: AdminProductFilters = useMemo(
    () => ({
      includeDeleted,
      search: search.trim() || undefined,
      categorySlug: categorySlug || undefined,
      stockStatus: stockStatus || undefined,
      isFeatured: isFeatured || undefined,
      isNew: isNew || undefined,
      isOnSale: isOnSale || undefined,
      sort,
      size: 50,
    }),
    [includeDeleted, search, categorySlug, stockStatus, isFeatured, isNew, isOnSale, sort]
  )

  const { data, isLoading, error, refetch, isFetching } = useAdminProducts(filters)

  const {
    toggleVisibility,
    changeStock,
    remove,
    restore,
    update,
  } = useProductMutations()

  if (!user) return null

  const perms = PRODUCT_PERMISSIONS
  const canCreate = perms.canCreate(user.role)
  const canSeeDeleted = ['SUPER_ADMIN', 'OWNER'].includes(user.role)

  const hasActiveFilters =
    !!search.trim() ||
    !!categorySlug ||
    !!stockStatus ||
    isFeatured ||
    isNew ||
    isOnSale ||
    sort !== 'newest' ||
    includeDeleted

  function clearFilters() {
    setSearch('')
    setCategorySlug('')
    setStockStatus('')
    setIsFeatured(false)
    setIsNew(false)
    setIsOnSale(false)
    setSort('newest')
    setIncludeDeleted(false)
  }

  return (
    <div>
      <AdminPageHeader
        title="Productos"
        description={buildTotalLabel({ data, isLoading })}
        action={canCreate ? { label: 'Nuevo producto', href: '/admin/productos/nuevo' } : undefined}
      />

      {/* ─── Filters bar ───────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-4 mb-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o descripción..."
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Category */}
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.icon ? `${c.icon} ` : ''}{c.name}
              </option>
            ))}
          </select>

          {/* Stock */}
          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value as StockStatus | '')}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {STOCK_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              Destacados
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              Nuevos
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isOnSale}
                onChange={(e) => setIsOnSale(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              En rebaja
            </label>
            {canSeeDeleted && (
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={(e) => setIncludeDeleted(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                Incluir eliminados
              </label>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ProductSortOption)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Content ──────────────────────────────────────────── */}
      {isLoading && <AdminTableSkeleton rows={8} cols={7} />}

      {error && !isLoading && (
        <ErrorState
          title="No pudimos cargar los productos"
          message="Verifica tu conexión e intenta nuevamente."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !error && data && (
        <AdminProductsTable
          products={data.content}
          userRole={user.role}
          isLoading={
            isFetching ||
            toggleVisibility.isPending ||
            remove.isPending ||
            restore.isPending ||
            changeStock.isPending ||
            update.isPending
          }
          hasActiveFilters={hasActiveFilters}
          onToggleVisibility={(id, visible) =>
            toggleVisibility.mutate({ id, data: { visible } })
          }
          onChangeStock={(id, stockStatus) =>
            changeStock.mutate({ id, data: { stockStatus } })
          }
          onToggleFeatured={(p) =>
            update.mutate({
              id: p.id,
              data: buildToggleRequest(p, { isFeatured: !p.isFeatured }),
            })
          }
          onToggleNew={(p) =>
            update.mutate({
              id: p.id,
              data: buildToggleRequest(p, { isNew: !p.isNew }),
            })
          }
          onDelete={(id) => remove.mutate(id)}
          onRestore={(id) => restore.mutate(id)}
        />
      )}
    </div>
  )
}

/**
 * Build a friendly label for the header. Defends against an undefined
 * `totalElements` (which would render "undefined productos en total")
 * by falling back through several shape variants and finally to 0.
 */
function buildTotalLabel({
  data,
  isLoading,
}: {
  data: import('@/types').PageResponse<import('@/types').ProductSummary> | undefined
  isLoading: boolean
}): string {
  if (isLoading && !data) return 'Cargando productos…'
  if (!data) return 'Gestión del catálogo'

  const maybeTotal = (data as { totalElements?: number; total?: number }).totalElements
    ?? (data as { totalElements?: number; total?: number }).total
    ?? data.content?.length
    ?? 0

  const total = Number.isFinite(maybeTotal) ? Number(maybeTotal) : 0
  return total === 1 ? '1 producto en total' : `${total} productos en total`
}

// Build a minimal UpdateProductRequest for quick toggle actions.
// Only the field being toggled changes; everything else echoes the existing product
// so the backend's @Valid pass succeeds.
function buildToggleRequest(
  p: import('@/types').ProductSummary,
  patch: { isFeatured?: boolean; isNew?: boolean }
): import('@/types').UpdateProductRequest {
  return {
    name: p.name,
    categoryId: p.categoryId ?? '',
    price: p.price,
    oldPrice: p.oldPrice ?? undefined,
    stockStatus: p.stockStatus,
    isNew: patch.isNew ?? p.isNew,
    isFeatured: patch.isFeatured ?? p.isFeatured,
    status: p.status,
    visible: p.visible,
  }
}
