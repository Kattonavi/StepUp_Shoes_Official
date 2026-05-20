import type { TopAnalyticsItem } from '@/types'

interface Props {
  items: TopAnalyticsItem[]
  emptyLabel: string
  showName?: boolean
}

export default function TopItemsTable({ items, emptyLabel, showName = true }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">{emptyLabel}</p>
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.slug ?? i} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{i + 1}.</span>
            <p className="text-sm truncate">
              {showName ? (item.name ?? item.slug ?? '—') : (item.slug ?? '—')}
            </p>
          </div>
          <span className="text-sm font-semibold text-primary shrink-0">{item.count}</span>
        </div>
      ))}
    </div>
  )
}
