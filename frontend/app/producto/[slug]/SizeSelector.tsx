'use client'

import type { ProductSize } from '@/types'
import { cn } from '@/lib/utils'

interface SizeSelectorProps {
  sizes: ProductSize[]
  selected?: string | null
  onSelect?: (size: string | null) => void
}

export default function SizeSelector({ sizes, selected, onSelect }: SizeSelectorProps) {
  const isControlled = onSelect !== undefined

  function handleSelect(size: string, hasStock: boolean) {
    if (!hasStock) return
    if (isControlled) {
      onSelect?.(selected === size ? null : size)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">
          Talla{selected ? `: ${selected}` : ''}
        </p>
        {selected && isControlled && (
          <button
            onClick={() => onSelect?.(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Quitar selección
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => {
          const hasStock = s.stockQuantity > 0
          const isSelected = selected === s.size
          return (
            <button
              key={s.id}
              onClick={() => handleSelect(s.size, hasStock)}
              disabled={!hasStock}
              aria-label={`Talla ${s.size}${!hasStock ? ' (sin stock)' : ''}`}
              className={cn(
                'min-w-[3rem] px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                !hasStock
                  ? 'border-border text-muted-foreground/40 cursor-not-allowed line-through'
                  : isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'border-border text-foreground hover:border-primary/60 hover:text-primary'
              )}
            >
              {s.size}
            </button>
          )
        })}
      </div>
      {sizes.some((s) => s.stockQuantity === 0) && (
        <p className="text-xs text-muted-foreground mt-2">
          Las tallas tachadas no tienen stock disponible.
        </p>
      )}
    </div>
  )
}
