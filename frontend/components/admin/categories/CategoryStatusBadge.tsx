import { cn } from '@/lib/utils'

export function CategoryStatusBadge({
  active,
  deleted,
  className,
}: {
  active: boolean
  deleted?: boolean
  className?: string
}) {
  if (deleted) {
    return (
      <span className={cn('inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-destructive/15 text-destructive', className)}>
        Eliminada
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full',
        active
          ? 'bg-green-500/15 text-green-400'
          : 'bg-muted text-muted-foreground',
        className
      )}
    >
      {active ? 'Activa' : 'Inactiva'}
    </span>
  )
}
