import type { AuditableEntityType } from '@/types'
import { cn } from '@/lib/utils'

const TYPE_CONFIG: Record<AuditableEntityType, { label: string; classes: string }> = {
  USER:          { label: 'Usuario',      classes: 'bg-purple-500/15 text-purple-400' },
  PRODUCT:       { label: 'Producto',     classes: 'bg-primary/15 text-primary' },
  CATEGORY:      { label: 'Categoría',    classes: 'bg-blue-500/15 text-blue-400' },
  PRODUCT_IMAGE: { label: 'Imagen',       classes: 'bg-cyan-500/15 text-cyan-400' },
  PRODUCT_SIZE:  { label: 'Talla',        classes: 'bg-teal-500/15 text-teal-400' },
  STORE_SETTINGS:{ label: 'Configuración',classes: 'bg-yellow-500/15 text-yellow-400' },
  MESSAGE:       { label: 'Mensaje',      classes: 'bg-green-500/15 text-green-400' },
  PROMOTION:     { label: 'Promoción',    classes: 'bg-orange-500/15 text-orange-400' },
  SYSTEM:        { label: 'Sistema',      classes: 'bg-muted text-muted-foreground' },
}

export default function EntityTypeBadge({
  entityType,
  className,
}: {
  entityType: AuditableEntityType
  className?: string
}) {
  const config = TYPE_CONFIG[entityType] ?? {
    label: entityType,
    classes: 'bg-muted text-muted-foreground',
  }

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
