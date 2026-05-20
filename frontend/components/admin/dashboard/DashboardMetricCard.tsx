'use client'

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardMetricCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  description?: string
  highlight?: 'default' | 'warning' | 'danger' | 'success'
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
}: DashboardMetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          {label}
        </p>
        <Icon className={cn('w-4 h-4', HIGHLIGHT_CLASSES[highlight])} />
      </div>
      <p className={cn('text-3xl font-bold', HIGHLIGHT_CLASSES[highlight])}>
        {value}
      </p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  )
}
