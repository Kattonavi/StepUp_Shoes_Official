'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreatePromotionRequest, Promotion } from '@/types'

const promotionSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255),
  subtitle: z.string().max(500).optional().or(z.literal('')),
  imageUrl: z.string().max(1000).optional().or(z.literal('')),
  linkUrl: z.string().max(1000).optional().or(z.literal('')),
  linkLabel: z.string().max(100).optional().or(z.literal('')),
  badgeText: z.string().max(50).optional().or(z.literal('')),
  active: z.boolean().default(true),
  position: z.coerce.number().int().min(0).default(0),
  startsAt: z.string().optional().or(z.literal('')),
  endsAt: z.string().optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.startsAt && data.endsAt) {
      return new Date(data.startsAt) < new Date(data.endsAt)
    }
    return true
  },
  {
    message: 'La fecha de inicio debe ser anterior a la fecha de finalización.',
    path: ['endsAt'],
  }
)

type PromotionFormValues = z.infer<typeof promotionSchema>

interface PromotionFormProps {
  promotion?: Promotion
  onSubmit: (data: CreatePromotionRequest) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export default function PromotionForm({
  promotion,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: PromotionFormProps) {
  const isEdit = !!promotion

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      title: promotion?.title ?? '',
      subtitle: promotion?.subtitle ?? '',
      imageUrl: promotion?.imageUrl ?? '',
      linkUrl: promotion?.linkUrl ?? '',
      linkLabel: promotion?.linkLabel ?? '',
      badgeText: promotion?.badgeText ?? '',
      active: promotion?.active ?? true,
      position: promotion?.position ?? 0,
      startsAt: promotion?.startsAt ? promotion.startsAt.slice(0, 16) : '',
      endsAt: promotion?.endsAt ? promotion.endsAt.slice(0, 16) : '',
    },
  })

  const handleFormSubmit = async (values: PromotionFormValues) => {
    const request: CreatePromotionRequest = {
      title: values.title,
      subtitle: values.subtitle || null,
      imageUrl: values.imageUrl || null,
      linkUrl: values.linkUrl || null,
      linkLabel: values.linkLabel || null,
      badgeText: values.badgeText || null,
      active: values.active,
      position: values.position,
      startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : null,
      endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : null,
    }
    await onSubmit(request)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
      <Field label="Título *" error={errors.title?.message}>
        <Input placeholder="Ej: 20% OFF en calzado deportivo" error={!!errors.title} {...register('title')} />
      </Field>

      <Field label="Subtítulo">
        <Input placeholder="Ej: Por tiempo limitado" {...register('subtitle')} />
      </Field>

      <Field label="URL de imagen" hint="URL de la imagen de fondo o destacada">
        <Input placeholder="https://..." {...register('imageUrl')} />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="URL del enlace" hint="¿A dónde lleva el CTA?">
          <Input placeholder="/catalogo?categorySlug=..." {...register('linkUrl')} />
        </Field>
        <Field label="Texto del botón CTA">
          <Input placeholder="Ver oferta" {...register('linkLabel')} />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Badge" hint="Etiqueta pequeña (ej: Flash Sale)">
          <Input placeholder="Flash Sale" {...register('badgeText')} />
        </Field>
        <Field label="Posición" hint="Orden de visualización (0 = primero)">
          <Input type="number" min={0} step={1} {...register('position')} />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Fecha de inicio" hint="Opcional — si se omite, la promoción puede mostrarse desde ya">
          <Input type="datetime-local" {...register('startsAt')} />
        </Field>
        <Field
          label="Fecha de finalización"
          hint="Opcional — promociones vencidas no aparecen en la tienda"
          error={errors.endsAt?.message}
        >
          <Input type="datetime-local" error={!!errors.endsAt} {...register('endsAt')} />
        </Field>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 accent-primary cursor-pointer"
          {...register('active')}
        />
        <span className="text-sm font-medium">Promoción activa</span>
      </label>

      <div className="flex items-center gap-3 justify-end pt-4 border-t border-border">
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
          {isEdit ? 'Guardar cambios' : 'Crear promoción'}
        </button>
      </div>
    </form>
  )
}

function Field({
  label, hint, error, children,
}: {
  label: string; hint?: string; error?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium block">
        {label}
        {hint && <span className="text-xs text-muted-foreground ml-2 font-normal">{hint}</span>}
      </label>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}

const Input = ({
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) => (
  <input
    className={cn(
      'w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
      error ? 'border-destructive' : 'border-border',
      className
    )}
    {...props}
  />
)
