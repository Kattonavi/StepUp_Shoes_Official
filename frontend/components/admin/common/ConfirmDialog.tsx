'use client'

import { AlertTriangle, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl shadow-black/50 w-full max-w-md p-6">
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
              variant === 'danger' ? 'bg-destructive/15' : 'bg-yellow-500/15'
            )}
          >
            <AlertTriangle
              className={cn(
                'w-5 h-5',
                variant === 'danger' ? 'text-destructive' : 'text-yellow-500'
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base mb-1">{title}</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-60',
              variant === 'danger'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
