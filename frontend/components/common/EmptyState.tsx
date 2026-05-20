import { cn } from '@/lib/utils'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  message?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export default function EmptyState({
  icon,
  title = 'No hay nada aquí',
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        {message && (
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>
        )}
      </div>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
