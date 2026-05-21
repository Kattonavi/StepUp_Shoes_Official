import Image from 'next/image'
import Link from 'next/link'
import { Package, ArrowRight } from 'lucide-react'
import type { ProductSummary } from '@/types'
import ProductBadges from './ProductBadges'
import ProductPrice from './ProductPrice'

interface ProductCardProps {
  product: ProductSummary
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK'

  return (
    <Link href={`/producto/${product.slug}`} className="group block">
      <article className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[4/5] bg-muted overflow-hidden">
          {product.mainImageUrl ? (
            <Image
              src={product.mainImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-70' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-14 h-14 text-muted-foreground/30" />
            </div>
          )}

          {/* Overlay oscuro en hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 pointer-events-none" />

          {/* Badges top-left */}
          <div className="absolute top-2 left-2">
            <ProductBadges product={product} />
          </div>

          {/* CTA hover overlay */}
          <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
              Ver producto
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
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

          {product.referenceCode && (
            <p className="text-[10px] text-muted-foreground/60 font-mono">
              Ref: {product.referenceCode}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
