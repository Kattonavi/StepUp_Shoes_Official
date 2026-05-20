'use client'

import { parseAndSanitizeSnapshot, prettyPrintSnapshot } from '@/lib/sanitize-snapshot'

interface SnapshotDiffViewerProps {
  beforeData: string | null
  afterData: string | null
}

export default function SnapshotDiffViewer({
  beforeData,
  afterData,
}: SnapshotDiffViewerProps) {
  const before = parseAndSanitizeSnapshot(beforeData)
  const after = parseAndSanitizeSnapshot(afterData)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <JsonPanel
        title="Antes"
        data={before}
        empty="Sin datos previos"
        colorClass="border-l-2 border-yellow-500/50"
      />
      <JsonPanel
        title="Después"
        data={after}
        empty="Sin datos posteriores"
        colorClass="border-l-2 border-green-500/50"
      />
    </div>
  )
}

function JsonPanel({
  title,
  data,
  empty,
  colorClass,
}: {
  title: string
  data: Record<string, unknown> | null
  empty: string
  colorClass: string
}) {
  return (
    <div className={`bg-muted/30 rounded-xl overflow-hidden ${colorClass}`}>
      <div className="px-4 py-2 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h3>
      </div>
      {data ? (
        <pre className="p-4 text-xs font-mono text-foreground leading-relaxed overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap break-words">
          {prettyPrintSnapshot(data)}
        </pre>
      ) : (
        <div className="p-4 text-sm text-muted-foreground italic">{empty}</div>
      )}
    </div>
  )
}
