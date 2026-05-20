'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductPaginationProps {
  page: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
}

export default function ProductPagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
}: ProductPaginationProps) {
  if (totalPages <= 1) return null

  const start = page * 12 + 1
  const end = Math.min((page + 1) * 12, totalElements)

  // Show at most 5 page buttons centred around current page
  const delta = 2
  const pages: (number | 'ellipsis')[] = []
  const left = Math.max(0, page - delta)
  const right = Math.min(totalPages - 1, page + delta)

  if (left > 0) {
    pages.push(0)
    if (left > 1) pages.push('ellipsis')
  }

  for (let i = left; i <= right; i++) pages.push(i)

  if (right < totalPages - 1) {
    if (right < totalPages - 2) pages.push('ellipsis')
    pages.push(totalPages - 1)
  }

  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      <p className="text-sm text-muted-foreground">
        Mostrando {start}–{end} de {totalElements} productos
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
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
                p === page
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:border-primary/50 text-foreground'
              )}
            >
              {p + 1}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="p-2 rounded-lg border border-border hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
