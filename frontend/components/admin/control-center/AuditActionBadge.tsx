import type { AuditAction } from '@/types'
import { cn } from '@/lib/utils'

const ACTION_CONFIG: Record<
  AuditAction,
  { label: string; classes: string }
> = {
  CREATE:            { label: 'CREAR',        classes: 'bg-green-500/15 text-green-400 border-green-500/30' },
  UPDATE:            { label: 'EDITAR',        classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  DELETE:            { label: 'ELIMINAR',      classes: 'bg-destructive/15 text-destructive border-destructive/30' },
  SOFT_DELETE:       { label: 'SOFT DELETE',   classes: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  RESTORE:           { label: 'RESTAURAR',     classes: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
  STATUS_CHANGE:     { label: 'CAMBIO ESTADO', classes: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  ROLE_CHANGE:       { label: 'CAMBIO ROL',    classes: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  VISIBILITY_CHANGE: { label: 'VISIBILIDAD',   classes: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  STOCK_CHANGE:      { label: 'STOCK',         classes: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
  LOGIN:             { label: 'LOGIN',         classes: 'bg-green-500/10 text-green-500/70 border-green-500/20' },
  LOGOUT:            { label: 'LOGOUT',        classes: 'bg-muted text-muted-foreground border-border' },
  FAILED_LOGIN:      { label: 'FAIL LOGIN',    classes: 'bg-destructive/20 text-destructive border-destructive/30' },
  REFRESH_TOKEN:     { label: 'REFRESH',       classes: 'bg-muted text-muted-foreground border-border' },
  SYSTEM_SEED:       { label: 'SEED',          classes: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  SYSTEM_EVENT:      { label: 'SISTEMA',       classes: 'bg-muted text-muted-foreground border-border' },
}

export default function AuditActionBadge({
  action,
  className,
}: {
  action: AuditAction
  className?: string
}) {
  const config = ACTION_CONFIG[action] ?? {
    label: action,
    classes: 'bg-muted text-muted-foreground border-border',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  )
}
