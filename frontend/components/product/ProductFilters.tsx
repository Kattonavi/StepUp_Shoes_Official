'use client'

import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import type { Category, ProductFilters as Filters, StockStatus } from '@/types'
import { cn } from '@/lib/utils'

interface ProductFiltersProps {
  filters: Filters
  categories: Category[]
  hasActiveFilters: boolean
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  onClearFilters: () => void
}

export default function ProductFilters({
  filters,
  categories,
  hasActiveFilters,
  onFilterChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex items-center gap-2 text-sm font-medium border border-border rounded-lg px-4 py-2 hover:border-primary/50 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
        </button>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      <div className={cn('space-y-6', mobileOpen ? 'block' : 'hidden lg:block')}>
        <div className="hidden lg:flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">
            Filtros
          </h2>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>

        <FilterSection title="Buscar">
          <input
            type="search"
            value={filters.search ?? ''}
            onChange={(e) =>
              onFilterChange('search', e.target.value || undefined)
            }
            placeholder="Nombre del producto..."
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </FilterSection>

        {categories.length > 0 && (
          <FilterSection title="Categoría">
            <div className="flex flex-col gap-1.5">
              <FilterChip
                label="Todas"
                active={!filters.categorySlug}
                onClick={() => onFilterChange('categorySlug', undefined)}
              />
              {categories.map((cat) => (
                <FilterChip
                  key={cat.id}
                  label={`${cat.icon ?? ''} ${cat.name}`.trim()}
                  active={filters.categorySlug === cat.slug}
                  onClick={() =>
                    onFilterChange(
                      'categorySlug',
                      filters.categorySlug === cat.slug ? undefined : cat.slug
                    )
                  }
                />
              ))}
            </div>
          </FilterSection>
        )}

        <FilterSection title="Precio">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.minPrice ?? ''}
              onChange={(e) =>
                onFilterChange(
                  'minPrice',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="Mínimo"
              min={0}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            <span className="text-muted-foreground text-sm shrink-0">—</span>
            <input
              type="number"
              value={filters.maxPrice ?? ''}
              onChange={(e) =>
                onFilterChange(
                  'maxPrice',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="Máximo"
              min={0}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </FilterSection>

        <FilterSection title="Disponibilidad">
          <div className="flex flex-col gap-1.5">
            {(
              [
                { value: undefined, label: 'Todos' },
                { value: 'AVAILABLE' as StockStatus, label: 'En stock' },
                { value: 'OUT_OF_STOCK' as StockStatus, label: 'Agotado' },
                { value: 'ON_REQUEST' as StockStatus, label: 'Por pedido' },
              ] as const
            ).map((opt) => (
              <FilterChip
                key={opt.label}
                label={opt.label}
                active={filters.stockStatus === opt.value}
                onClick={() => onFilterChange('stockStatus', opt.value)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Etiquetas">
          <div className="flex flex-col gap-2">
            {[
              { key: 'isNew' as const, label: 'Nuevos ingresos' },
              { key: 'isOnSale' as const, label: 'En rebaja' },
              { key: 'isFeatured' as const, label: 'Destacados' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters[key] === true}
                  onChange={(e) =>
                    onFilterChange(key, e.target.checked ? true : undefined)
                  }
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  )
}

function FilterChip({
  label, active, onClick,
}: {
  label: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors',
        active ? 'bg-primary/20 text-primary font-medium' : 'text-foreground hover:bg-muted'
      )}
    >
      {label}
    </button>
  )
}
