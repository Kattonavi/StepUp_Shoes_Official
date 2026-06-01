'use client'

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardMetricCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  description?: string
  highlight?: 'default' | 'warning' | 'danger' | 'success'
  /**
   * Para valores de texto largos (p.ej. el nombre de un producto): reduce el
   * tamaño y permite hasta 2 líneas con wrap, evitando que el texto se salga
   * de la card. No afecta a las métricas numéricas (que no pasan esta prop).
   */
  compactValue?: boolean
}

const HIGHLIGHT_CLASSES: Record<string, string> = {
  default: 'text-primary',
  warning: 'text-yellow-400',
  danger: 'text-destructive',
  success: 'text-emerald-400',
}

export default function DashboardMetricCard({
  label,
  value,
  icon: Icon,
  description,
  highlight = 'default',
  compactValue = false,
}: DashboardMetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest min-w-0 truncate">
          {label}
        </p>
        <Icon className={cn('w-4 h-4 shrink-0', HIGHLIGHT_CLASSES[highlight])} />
      </div>
      <p
        title={typeof value === 'string' ? value : undefined}
        className={cn(
          'font-bold break-words',
          HIGHLIGHT_CLASSES[highlight],
          compactValue ? 'text-lg leading-snug line-clamp-2' : 'text-3xl'
        )}
      >
        {value}
      </p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  )
}
