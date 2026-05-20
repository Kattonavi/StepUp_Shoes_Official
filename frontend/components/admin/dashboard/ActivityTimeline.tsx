'use client'

import type { RecentAuditLogItem } from '@/types'
import AuditActionBadge from '@/components/admin/control-center/AuditActionBadge'
import EntityTypeBadge from '@/components/admin/control-center/EntityTypeBadge'
import { formatDistanceToNow } from '@/components/admin/users/date-utils'

interface Props {
  logs: RecentAuditLogItem[]
  showControlCenterLink?: boolean
}

export default function ActivityTimeline({ logs, showControlCenterLink }: Props) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Sin actividad reciente.
      </p>
    )
  }

  return (
    <div className="space-y-1">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <AuditActionBadge action={log.action} />
              <EntityTypeBadge entityType={log.entityType} />
              {log.actorEmail && (
                <span className="text-xs text-muted-foreground truncate">
                  {log.actorEmail}
                </span>
              )}
            </div>
            {log.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {log.description}
              </p>
            )}
          </div>
          <span className="text-xs text-muted-foreground/60 whitespace-nowrap shrink-0 mt-0.5">
            {formatDistanceToNow(log.createdAt)}
          </span>
        </div>
      ))}
      {showControlCenterLink && (
        <div className="pt-2 border-t border-border">
          <a
            href="/admin/control-center?tab=audit-logs"
            className="text-xs text-primary hover:underline"
          >
            Ver todos los logs →
          </a>
        </div>
      )}
    </div>
  )
}
