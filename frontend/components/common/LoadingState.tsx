import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingState({
  message = 'Cargando...',
  className,
  size = 'md',
}: LoadingStateProps) {
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground',
        className
      )}
    >
      <Loader2 className={cn('animate-spin', iconSize)} />
      <p className="text-sm">{message}</p>
    </div>
  )
}
