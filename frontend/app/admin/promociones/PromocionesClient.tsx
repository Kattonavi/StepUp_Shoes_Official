'use client'

import { useState } from 'react'
import { Plus, Megaphone } from 'lucide-react'
import { useAdminPromotions } from '@/hooks/admin/useAdminPromotions'
import { usePromotionMutations } from '@/hooks/admin/usePromotionMutations'
import AdminPromotionsTable from '@/components/admin/promotions/AdminPromotionsTable'
import PromotionForm from '@/components/admin/promotions/PromotionForm'
import { useAuth } from '@/hooks/useAuth'
import type { CreatePromotionRequest, Promotion } from '@/types'

export default function PromocionesClient() {
  const { user } = useAuth()
  const { data: promotions = [], isLoading } = useAdminPromotions()
  const { create, update, toggleActive, remove } = usePromotionMutations()

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Promotion | null>(null)

  const isFormOpen = showForm || !!editTarget
  const isSubmitting = create.isPending || update.isPending

  const handleSubmit = async (data: CreatePromotionRequest) => {
    if (editTarget) {
      await update.mutateAsync({ id: editTarget.id, data })
    } else {
      await create.mutateAsync(data)
    }
    setShowForm(false)
    setEditTarget(null)
  }

  const handleEdit = (promo: Promotion) => {
    setEditTarget(promo)
    setShowForm(false)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditTarget(null)
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Promociones</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Banners y destacados que aparecen en la tienda pública.
          </p>
        </div>
        {['SUPER_ADMIN', 'OWNER', 'ADMIN'].includes(user.role) && !isFormOpen && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva promoción
          </button>
        )}
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border pb-3 mb-5">
            {editTarget ? 'Editar promoción' : 'Nueva promoción'}
          </h2>
          <PromotionForm
            key={editTarget?.id ?? 'new'}
            promotion={editTarget ?? undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : promotions.length === 0 && !isFormOpen ? (
        <div className="bg-card border border-dashed border-border rounded-xl py-16 flex flex-col items-center gap-4 text-center">
          <Megaphone className="w-10 h-10 text-muted-foreground/30" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">No hay promociones todavía</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Crea banners y destacados para la tienda pública.
            </p>
          </div>
          {['SUPER_ADMIN', 'OWNER', 'ADMIN'].includes(user.role) && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear primera promoción
            </button>
          )}
        </div>
      ) : (
        <AdminPromotionsTable
          promotions={promotions}
          userRole={user.role}
          onToggleActive={(id, active) => toggleActive.mutate({ id, active })}
          onEdit={handleEdit}
          onDelete={(id) => remove.mutate(id)}
          isLoading={toggleActive.isPending || remove.isPending}
        />
      )}
    </div>
  )
}
