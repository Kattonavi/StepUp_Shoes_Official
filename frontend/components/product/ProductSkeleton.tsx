import { cn } from '@/lib/utils'

interface ProductSkeletonProps {
  count?: number
  className?: string
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-muted" />
      <div className="p-3 sm:p-4 space-y-2">
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-4/5" />
        <div className="h-4 bg-muted rounded w-3/5" />
        <div className="h-5 bg-muted rounded w-2/5 mt-1" />
      </div>
    </div>
  )
}

export default function ProductSkeleton({
  count = 8,
  className,
}: ProductSkeletonProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
