import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export default function ErrorState({
  title = 'Algo salió mal',
  message = 'No pudimos cargar la información. Intenta nuevamente.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12 text-center',
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-destructive" />
      </div>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Intentar nuevamente
        </button>
      )}
    </div>
  )
}
