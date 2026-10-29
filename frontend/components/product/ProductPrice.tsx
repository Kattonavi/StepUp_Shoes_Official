import { formatPrice } from '@/lib/utils'
import type { Product, ProductSummary } from '@/types'
import { cn } from '@/lib/utils'

type PriceProduct = Pick<
  Product | ProductSummary,
  'price' | 'oldPrice' | 'isOnSale'
>

interface ProductPriceProps {
  product: PriceProduct
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ProductPrice({
  product,
  size = 'md',
  className,
}: ProductPriceProps) {
  const currentSize =
    size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base'
  const oldSize =
    size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'

  if (product.isOnSale && product.oldPrice) {
    return (
      <div className={cn('flex flex-wrap items-baseline gap-x-2 tabular-nums', className)}>
        <span className={cn('font-bold text-primary', currentSize)}>
          {formatPrice(product.price)}
        </span>
        <span className={cn('text-muted-foreground line-through', oldSize)}>
          {formatPrice(product.oldPrice)}
        </span>
      </div>
    )
  }

  return (
    <span className={cn('font-bold text-foreground tabular-nums', currentSize, className)}>
      {formatPrice(product.price)}
    </span>
  )
}
