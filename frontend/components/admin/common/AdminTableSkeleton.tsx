interface AdminTableSkeletonProps {
  rows?: number
  cols?: number
}

export default function AdminTableSkeleton({
  rows = 8,
  cols = 5,
}: AdminTableSkeletonProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid gap-4 px-4 py-3 border-b border-border bg-muted/30"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded animate-pulse" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid gap-4 px-4 py-4 border-b border-border last:border-0"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className={`h-4 bg-muted rounded animate-pulse ${j === 0 ? 'w-3/4' : j === cols - 1 ? 'w-1/2' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
