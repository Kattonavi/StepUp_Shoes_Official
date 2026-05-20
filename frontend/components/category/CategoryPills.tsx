import Link from 'next/link'
import type { Category } from '@/types'
import { cn } from '@/lib/utils'

interface CategoryPillsProps {
  categories: Category[]
  activeCategorySlug?: string
  className?: string
}

export default function CategoryPills({
  categories,
  activeCategorySlug,
  className,
}: CategoryPillsProps) {
  if (categories.length === 0) return null

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <Link
        href="/catalogo"
        className={cn(
          'text-sm font-medium px-4 py-2 rounded-full border transition-colors whitespace-nowrap',
          !activeCategorySlug
            ? 'bg-primary text-primary-foreground border-primary'
            : 'border-border text-foreground hover:border-primary/50 hover:text-primary'
        )}
      >
        Todo
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/catalogo?categorySlug=${cat.slug}`}
          className={cn(
            'text-sm font-medium px-4 py-2 rounded-full border transition-colors whitespace-nowrap',
            activeCategorySlug === cat.slug
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-foreground hover:border-primary/50 hover:text-primary'
          )}
        >
          {cat.icon ? `${cat.icon} ` : ''}{cat.name}
        </Link>
      ))}
    </div>
  )
}
