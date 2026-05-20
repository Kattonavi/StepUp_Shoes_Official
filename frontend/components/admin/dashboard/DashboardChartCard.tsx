'use client'

interface DashboardChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export default function DashboardChartCard({
  title,
  description,
  children,
  className,
}: DashboardChartCardProps) {
  return (
    <div className={`bg-card border border-border rounded-xl p-5 ${className ?? ''}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
