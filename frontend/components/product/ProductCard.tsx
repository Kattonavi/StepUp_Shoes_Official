import Image from 'next/image'
import Link from 'next/link'
import { Package, ArrowRight } from 'lucide-react'
import type { ProductSummary } from '@/types'
import ProductBadges from './ProductBadges'
import ProductPrice from './ProductPrice'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: ProductSummary
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK'
  const isOnRequest = product.stockStatus === 'ON_REQUEST'

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-2xl"
    >
      <article className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[4/5] bg-gradient-to-br from-muted/60 to-muted/20 overflow-hidden">
          {product.mainImageUrl ? (
            <Image
              src={product.mainImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'object-cover transition-transform duration-500 group-hover:scale-[1.04]',
                isOutOfStock && 'opacity-60 grayscale-[35%]'
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-14 h-14 text-muted-foreground/30" />
            </div>
          )}

          {/* Subtle bottom gradient — reads price area & CTA over photos */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

          {/* Badges top-left (state + new + featured) */}
          <div className="absolute top-2.5 left-2.5">
            <ProductBadges product={product} />
          </div>

          {/* Out-of-stock stamp — clearer than just opacity */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="rotate-[-8deg] bg-background/85 backdrop-blur text-foreground text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-border shadow-sm">
                Agotado
              </span>
            </div>
          )}

          {/* CTA hover overlay — disabled when out of stock to avoid raising expectations */}
          {!isOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg">
                {isOnRequest ? 'Consultar' : 'Ver producto'}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-1.5">
          {product.categoryName && (
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
              {product.categoryName}
            </p>
          )}
          <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>

          <ProductPrice product={product} size="sm" />
        </div>
      </article>
    </Link>
  )
}
