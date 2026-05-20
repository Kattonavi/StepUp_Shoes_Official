'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category, CreateCategoryRequest } from '@/types'

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  slug: z.string().max(255).optional().or(z.literal('')),
  icon: z.string().max(100).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  position: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
  category?: Category
  onSubmit: (data: CreateCategoryRequest) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export default function CategoryForm({
  category,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CategoryFormProps) {
  const isEdit = !!category

  const defaultValues: CategoryFormValues = {
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    icon: category?.icon ?? '',
    description: category?.description ?? '',
    position: category?.position ?? 0,
    active: category?.active ?? true,
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  })

  useEffect(() => {
    if (category) reset(defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category?.id])

  const handleFormSubmit = async (values: CategoryFormValues) => {
    const request: CreateCategoryRequest = {
      name: values.name,
      slug: values.slug || undefined,
      icon: values.icon || undefined,
      description: values.description || undefined,
      position: values.position,
      active: values.active,
    }
    await onSubmit(request)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border pb-3">
          Información de categoría
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nombre *</label>
            <input
              placeholder="Zapatos"
              className={cn(
                'w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                errors.name ? 'border-destructive' : 'border-border'
              )}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Slug{' '}
              <span className="text-xs text-muted-foreground font-normal">Opcional</span>
            </label>
            <input
              placeholder="zapatos"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              {...register('slug')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Ícono{' '}
              <span className="text-xs text-muted-foreground font-normal">Emoji (opcional)</span>
            </label>
            <input
              placeholder="👟"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              {...register('icon')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Posición</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              {...register('position')}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Descripción</label>
          <textarea
            rows={2}
            placeholder="Descripción de la categoría..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
            {...register('description')}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-primary cursor-pointer"
            {...register('active')}
          />
          <span className="text-sm">Categoría activa (visible en el catálogo)</span>
        </label>
      </div>

      <div className="flex items-center gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </div>
    </form>
  )
}
