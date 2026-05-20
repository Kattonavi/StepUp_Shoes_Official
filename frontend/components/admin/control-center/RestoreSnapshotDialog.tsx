'use client'

import { useState } from 'react'
import { Loader2, X, RotateCcw, AlertTriangle } from 'lucide-react'
import type { AuditableEntityType } from '@/types'
import EntityTypeBadge from './EntityTypeBadge'

interface RestoreSnapshotDialogProps {
  open: boolean
  snapshotId: string
  entityType: AuditableEntityType
  entityId: string
  loading?: boolean
  onConfirm: (snapshotId: string, reason?: string) => void
  onCancel: () => void
}

export default function RestoreSnapshotDialog({
  open,
  snapshotId,
  entityType,
  entityId,
  loading = false,
  onConfirm,
  onCancel,
}: RestoreSnapshotDialogProps) {
  const [reason, setReason] = useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />

      <div className="relative bg-card border border-border rounded-2xl shadow-2xl shadow-black/50 w-full max-w-md p-6 space-y-5">
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-teal-500/15 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="font-bold text-base">Restaurar entidad</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <EntityTypeBadge entityType={entityType} />
              <code className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded truncate max-w-[200px]">
                {entityId}
              </code>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300 leading-relaxed">
            Al restaurar, los <strong>productos</strong> quedan en estado{' '}
            <strong>DRAFT</strong> con visibilidad desactivada. Las{' '}
            <strong>categorías</strong> quedan inactivas. Deberás activarlos
            manualmente.
          </p>
        </div>

        {/* Reason */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium block">
            Motivo{' '}
            <span className="text-xs text-muted-foreground font-normal">
              Opcional
            </span>
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={1000}
            placeholder="Explica por qué se restaura esta entidad..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">
            {reason.length}/1000
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(snapshotId, reason || undefined)}
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Restaurar
          </button>
        </div>
      </div>
    </div>
  )
}
