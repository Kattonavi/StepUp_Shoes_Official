'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Package, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductImage } from '@/types'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => {
    if (a.mainImage && !b.mainImage) return -1
    if (!a.mainImage && b.mainImage) return 1
    return a.position - b.position
  })

  const [selected, setSelected] = useState(0)
  const current = sorted[selected]

  if (sorted.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center">
        <Package className="w-20 h-20 text-muted-foreground/30" />
      </div>
    )
  }

  function prev() {
    setSelected((s) => (s - 1 + sorted.length) % sorted.length)
  }

  function next() {
    setSelected((s) => (s + 1) % sorted.length)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square rounded-2xl bg-muted overflow-hidden group">
        <Image
          src={current.url}
          alt={current.altText ?? productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />

        {sorted.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {sorted.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                aria-label={`Imagen ${i + 1}`}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-colors',
                  i === selected ? 'bg-white' : 'bg-white/40'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {sorted.length > 1 && (
        <div className="hidden md:flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelected(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={cn(
                'relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors',
                i === selected
                  ? 'border-primary'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `Imagen ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
