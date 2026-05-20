'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  onRetry?: () => void
}

export default function DashboardErrorState({ onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-destructive" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          No se pudo cargar el dashboard
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Verifica que el backend esté en línea e intenta nuevamente.
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-xl hover:bg-muted transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      )}
    </div>
  )
}
