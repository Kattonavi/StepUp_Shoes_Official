import type { Role } from '@/types'
import { cn } from '@/lib/utils'

const ROLE_CONFIG: Record<Role, { label: string; classes: string }> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    classes: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  },
  OWNER: {
    label: 'Propietario',
    classes: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  },
  ADMIN: {
    label: 'Administrador',
    classes: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  },
  EDITOR: {
    label: 'Editor',
    classes: 'bg-green-500/20 text-green-400 border border-green-500/30',
  },
  VIEWER: {
    label: 'Visor',
    classes: 'bg-muted text-muted-foreground border border-border',
  },
}

export default function UserRoleBadge({
  role,
  className,
}: {
  role: Role
  className?: string
}) {
  const config = ROLE_CONFIG[role]
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  )
}
