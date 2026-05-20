import Image from 'next/image'
import Link from 'next/link'
import { Package } from 'lucide-react'
import type { ProductSummary } from '@/types'
import ProductBadges from './ProductBadges'
import ProductPrice from './ProductPrice'

interface ProductCardProps {
  product: ProductSummary
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/producto/${product.slug}`} className="group block">
      <article className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[4/5] bg-muted overflow-hidden">
          {product.mainImageUrl ? (
            <Image
              src={product.mainImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-14 h-14 text-muted-foreground/30" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />

          <div className="absolute top-2 left-2">
            <ProductBadges product={product} />
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-1.5">
          {product.categoryName && (
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
              {product.categoryName}
            </p>
          )}
          <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <ProductPrice product={product} size="sm" />
        </div>
      </article>
    </Link>
  )
}
