'use client'

import type { ProductSortOption } from '@/types'

interface ProductSortProps {
  value?: ProductSortOption
  onChange: (value: ProductSortOption) => void
}

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: 'featured', label: 'Destacados' },
  { value: 'newest', label: 'Más nuevos' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'name_asc', label: 'Nombre A-Z' },
]

export default function ProductSort({ value, onChange }: ProductSortProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort-select"
        className="text-sm text-muted-foreground whitespace-nowrap"
      >
        Ordenar:
      </label>
      <select
        id="sort-select"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value as ProductSortOption)}
        className="bg-card border border-border text-foreground text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer"
      >
        <option value="">Relevancia</option>
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
