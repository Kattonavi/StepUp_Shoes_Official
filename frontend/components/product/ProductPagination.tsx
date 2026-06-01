'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductPaginationProps {
  page: number
  /** Tamaño de página real (no asumir 12). */
  size?: number
  totalPages: number
  totalElements: number
  /** Cuántos items hay en la página actual (para calcular "to" sin sobrepasar). */
  contentLength?: number
  onPageChange: (page: number) => void
}

export default function ProductPagination({
  page,
  size = 12,
  totalPages,
  totalElements,
  contentLength,
  onPageChange,
}: ProductPaginationProps) {
  // Coerción defensiva: ningún valor puede llegar como undefined/NaN a la UI.
  const safePage = Number.isFinite(page) && page >= 0 ? Math.trunc(page) : 0
  const safeSize = Number.isFinite(size) && size > 0 ? Math.trunc(size) : 12
  const safeTotal =
    Number.isFinite(totalElements) && totalElements >= 0
      ? Math.trunc(totalElements)
      : 0
  const safeTotalPages =
    Number.isFinite(totalPages) && totalPages >= 0 ? Math.trunc(totalPages) : 0
  const inPage =
    Number.isFinite(contentLength) && (contentLength as number) >= 0
      ? Math.trunc(contentLength as number)
      : safeSize

  if (safeTotalPages <= 1) return null

  const start = safeTotal === 0 ? 0 : safePage * safeSize + 1
  const end =
    safeTotal === 0 ? 0 : Math.min(start + inPage - 1, safeTotal)

  // Show at most 5 page buttons centred around current page
  const delta = 2
  const pages: (number | 'ellipsis')[] = []
  const left = Math.max(0, safePage - delta)
  const right = Math.min(safeTotalPages - 1, safePage + delta)

  if (left > 0) {
    pages.push(0)
    if (left > 1) pages.push('ellipsis')
  }

  for (let i = left; i <= right; i++) pages.push(i)

  if (right < safeTotalPages - 1) {
    if (right < safeTotalPages - 2) pages.push('ellipsis')
    pages.push(safeTotalPages - 1)
  }

  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      <p className="text-sm text-muted-foreground">
        Mostrando {start}–{end} de {safeTotal} productos
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 0}
          className="p-2 rounded-lg border border-border hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'w-9 h-9 rounded-lg text-sm font-medium transition-colors border',
                p === safePage
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:border-primary/50 text-foreground'
              )}
            >
              {p + 1}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= safeTotalPages - 1}
          className="p-2 rounded-lg border border-border hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
