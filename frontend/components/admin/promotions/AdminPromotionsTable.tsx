'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Edit2, Eye, EyeOff, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react'
import type { Promotion, Role } from '@/types'
import ConfirmDialog from '../common/ConfirmDialog'
import { cn } from '@/lib/utils'

interface AdminPromotionsTableProps {
  promotions: Promotion[]
  userRole: Role
  onToggleActive: (id: string, active: boolean) => void
  onEdit: (promotion: Promotion) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

export default function AdminPromotionsTable({
  promotions,
  userRole,
  onToggleActive,
  onEdit,
  onDelete,
  isLoading,
}: AdminPromotionsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null)

  const canEdit = ['SUPER_ADMIN', 'OWNER', 'ADMIN'].includes(userRole)
  const canDelete = ['SUPER_ADMIN', 'OWNER'].includes(userRole)

  if (promotions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl py-16 text-center text-muted-foreground text-sm">
        No hay promociones creadas todavía.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {promotions.map((promo) => (
        <div
          key={promo.id}
          className={cn(
            'bg-card border border-border rounded-xl p-4 flex items-start gap-4',
            !promo.active && 'opacity-60'
          )}
        >
          {/* Image thumbnail */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
            {promo.imageUrl ? (
              <Image
                src={promo.imageUrl}
                alt={promo.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <ImageIcon className="w-6 h-6 absolute inset-0 m-auto text-muted-foreground/40" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{promo.title}</p>
                  {promo.badgeText && (
                    <span className="text-[10px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded">
                      {promo.badgeText}
                    </span>
                  )}
                  <span className={cn(
                    'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                    promo.active
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {promo.active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                {promo.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{promo.subtitle}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span>Posición: {promo.position}</span>
                  {promo.startsAt && (
                    <span>Desde: {new Date(promo.startsAt).toLocaleDateString('es-CO')}</span>
                  )}
                  {promo.endsAt && (
                    <span>Hasta: {new Date(promo.endsAt).toLocaleDateString('es-CO')}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {promo.linkUrl && (
                  <a
                    href={promo.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Ver enlace"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {canEdit && (
                  <>
                    <button
                      onClick={() => onEdit(promo)}
                      disabled={isLoading}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleActive(promo.id, !promo.active)}
                      disabled={isLoading}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title={promo.active ? 'Desactivar' : 'Activar'}
                    >
                      {promo.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </>
                )}
                {canDelete && (
                  <button
                    onClick={() => setDeleteTarget(promo)}
                    disabled={isLoading}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar promoción"
        message={`¿Eliminar la promoción "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) {
            onDelete(deleteTarget.id)
            setDeleteTarget(null)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
