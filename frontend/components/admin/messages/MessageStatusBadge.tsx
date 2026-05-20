import type { MessageStatus } from '@/types'

const STATUS_CONFIG: Record<MessageStatus, { label: string; classes: string }> = {
  UNREAD:   { label: 'No leído',  classes: 'bg-primary/15 text-primary' },
  READ:     { label: 'Leído',     classes: 'bg-muted text-muted-foreground' },
  ARCHIVED: { label: 'Archivado', classes: 'bg-yellow-500/15 text-yellow-400' },
  DELETED:  { label: 'Eliminado', classes: 'bg-destructive/15 text-destructive' },
}

export default function MessageStatusBadge({ status }: { status: MessageStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, classes: 'bg-muted text-muted-foreground' }
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.classes}`}>
      {cfg.label}
    </span>
  )
}
