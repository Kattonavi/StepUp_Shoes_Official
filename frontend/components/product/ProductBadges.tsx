import type { Product, ProductSummary } from '@/types'
import { cn } from '@/lib/utils'

type BadgeProduct = Pick<
  Product | ProductSummary,
  'stockStatus' | 'isNew' | 'isOnSale' | 'discountPercentage' | 'isFeatured'
>

interface ProductBadgesProps {
  product: BadgeProduct
  className?: string
  /**
   * `stack` (default): vertical, used on product cards over the image.
   * `inline`: horizontal pills, used on the product detail page header.
   */
  layout?: 'stack' | 'inline'
}

interface Badge {
  label: string
  classes: string
}

export default function ProductBadges({
  product,
  className,
  layout = 'stack',
}: ProductBadgesProps) {
  const badges: Badge[] = []

  if (product.stockStatus === 'OUT_OF_STOCK') {
    badges.push({
      label: 'Agotado',
      classes: 'bg-destructive/95 text-destructive-foreground',
    })
  } else if (product.stockStatus === 'ON_REQUEST') {
    badges.push({
      label: 'Por pedido',
      classes: 'bg-amber-500/95 text-black',
    })
  }

  if (product.isOnSale && product.discountPercentage) {
    const pct = Number(product.discountPercentage)
    const label = Number.isInteger(pct) ? `${pct}` : pct.toFixed(2).replace(/\.?0+$/, '')
    badges.push({
      label: `-${label}%`,
      classes: 'bg-primary text-primary-foreground',
    })
  }

  if (product.isNew) {
    badges.push({ label: 'Nuevo', classes: 'bg-blue-600 text-white' })
  }

  if (product.isFeatured) {
    badges.push({
      label: 'Destacado',
      classes: 'bg-yellow-400 text-black',
    })
  }

  if (badges.length === 0) return null

  return (
    <div
      className={cn(
        layout === 'stack' ? 'flex flex-col gap-1' : 'flex flex-wrap gap-1.5',
        className
      )}
    >
      {badges.map((badge) => (
        <span
          key={badge.label}
          className={cn(
            'font-bold tracking-wide leading-none rounded-md shadow-sm backdrop-blur-sm',
            layout === 'stack'
              ? 'text-[10px] uppercase px-2 py-1'
              : 'text-[11px] uppercase px-2.5 py-1',
            badge.classes
          )}
        >
          {badge.label}
        </span>
      ))}
    </div>
  )
}
