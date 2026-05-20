import type { UserStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<UserStatus, { label: string; classes: string }> = {
  ACTIVE: {
    label: 'Activo',
    classes: 'bg-green-500/15 text-green-400',
  },
  INACTIVE: {
    label: 'Inactivo',
    classes: 'bg-muted text-muted-foreground',
  },
  BLOCKED: {
    label: 'Bloqueado',
    classes: 'bg-destructive/15 text-destructive',
  },
  DELETED: {
    label: 'Eliminado',
    classes: 'bg-destructive/10 text-destructive/70',
  },
}

export default function UserStatusBadge({
  status,
  className,
}: {
  status: UserStatus
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
