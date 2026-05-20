'use client'

import { useState } from 'react'
import type { ProductSize } from '@/types'
import { cn } from '@/lib/utils'

interface SizeSelectorProps {
  sizes: ProductSize[]
}

export default function SizeSelector({ sizes }: SizeSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">
          Talla{selected ? `: ${selected}` : ''}
        </p>
        {selected && (
          <button
            onClick={() => setSelected(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Quitar selección
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => {
          const hasStock = s.stockQuantity > 0
          return (
            <button
              key={s.id}
              onClick={() => hasStock && setSelected(s.size)}
              disabled={!hasStock}
              aria-label={`Talla ${s.size}${!hasStock ? ' (sin stock)' : ''}`}
              className={cn(
                'min-w-[3rem] px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                !hasStock
                  ? 'border-border text-muted-foreground/40 cursor-not-allowed line-through'
                  : selected === s.size
                  ? 'bg-primary text-primary-foreground border-primary'
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
