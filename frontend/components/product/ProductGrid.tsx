import type { ProductSummary } from '@/types'
import ProductCard from './ProductCard'
import { cn } from '@/lib/utils'

interface ProductGridProps {
  products: ProductSummary[]
  className?: string
}

export default function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5',
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
