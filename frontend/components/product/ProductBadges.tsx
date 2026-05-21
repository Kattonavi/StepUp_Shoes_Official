import type { Product, ProductSummary } from '@/types'

type BadgeProduct = Pick<
  Product | ProductSummary,
  'stockStatus' | 'isNew' | 'isOnSale' | 'discountPercentage' | 'isFeatured'
>

interface ProductBadgesProps {
  product: BadgeProduct
  className?: string
}

export default function ProductBadges({ product, className }: ProductBadgesProps) {
  const badges: { label: string; classes: string }[] = []

  if (product.stockStatus === 'OUT_OF_STOCK') {
    badges.push({ label: 'Agotado', classes: 'bg-destructive text-destructive-foreground' })
  } else if (product.stockStatus === 'ON_REQUEST') {
    badges.push({ label: 'Por pedido', classes: 'bg-secondary text-secondary-foreground' })
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
    badges.push({ label: '⭐ Destacado', classes: 'bg-yellow-500 text-black' })
  }

  if (badges.length === 0) return null

  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`}>
      {badges.map((badge) => (
        <span
          key={badge.label}
          className={`text-[10px] font-bold px-2 py-0.5 rounded leading-tight ${badge.classes}`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  )
}
