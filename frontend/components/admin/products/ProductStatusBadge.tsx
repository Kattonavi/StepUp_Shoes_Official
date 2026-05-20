import type { ProductStatus, StockStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<
  ProductStatus,
  { label: string; classes: string }
> = {
  ACTIVE: { label: 'Activo', classes: 'bg-green-500/15 text-green-400' },
  DRAFT: { label: 'Borrador', classes: 'bg-yellow-500/15 text-yellow-400' },
  HIDDEN: { label: 'Oculto', classes: 'bg-muted text-muted-foreground' },
  DELETED: { label: 'Eliminado', classes: 'bg-destructive/15 text-destructive' },
}

const STOCK_CONFIG: Record<StockStatus, { label: string; classes: string }> = {
  AVAILABLE: { label: 'Disponible', classes: 'bg-green-500/15 text-green-400' },
  OUT_OF_STOCK: { label: 'Sin stock', classes: 'bg-destructive/15 text-destructive' },
  ON_REQUEST: { label: 'Por pedido', classes: 'bg-blue-500/15 text-blue-400' },
}

export function ProductStatusBadge({
  status,
  className,
}: {
  status: ProductStatus
  className?: string
}) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  )
}

export function StockStatusBadge({
  status,
  className,
}: {
  status: StockStatus
  className?: string
}) {
  const config = STOCK_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  )
}

export function VisibilityBadge({
  visible,
  className,
}: {
  visible: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full',
        visible
          ? 'bg-green-500/15 text-green-400'
          : 'bg-muted text-muted-foreground',
        className
      )}
    >
      {visible ? 'Visible' : 'Oculto'}
    </span>
  )
}
