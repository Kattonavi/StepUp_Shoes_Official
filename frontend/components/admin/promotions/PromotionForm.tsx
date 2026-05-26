'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Upload, Trash2, Eye, EyeOff, ExternalLink, Tag, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { isSafeUrl, SAFE_URL_MESSAGE } from '@/lib/url-validation'
import {
  uploadImage,
  deleteCloudinaryAsset,
  CloudinaryUploadError,
  ACCEPTED_IMAGE_MIME,
} from '@/lib/cloudinary'
import type { CreatePromotionRequest, Promotion } from '@/types'

// ─── Schema ────────────────────────────────────────────────────────────────

const safeUrlField = z
  .string()
  .max(1000)
  .refine((v) => !v || isSafeUrl(v), { message: SAFE_URL_MESSAGE })
  .optional()
  .or(z.literal(''))

const promotionSchema = z
  .object({
    title: z.string().min(1, 'El título es requerido').max(255),
    subtitle: z.string().max(500).optional().or(z.literal('')),
    imageUrl: safeUrlField,
    linkUrl: safeUrlField,
    linkLabel: z.string().max(100).optional().or(z.literal('')),
    badgeText: z.string().max(50).optional().or(z.literal('')),
    active: z.boolean().default(true),
    visible: z.boolean().default(true),
    position: z.coerce.number().int().min(0).default(0),
    startsAt: z.string().optional().or(z.literal('')),
    endsAt: z.string().optional().or(z.literal('')),
    cloudinaryPublicId: z.string().max(255).optional().or(z.literal('')).nullable(),
  })
  .refine(
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
    control,
    setValue,
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
      visible: promotion?.visible ?? true,
      position: promotion?.position ?? 0,
      startsAt: promotion?.startsAt ? promotion.startsAt.slice(0, 16) : '',
      endsAt: promotion?.endsAt ? promotion.endsAt.slice(0, 16) : '',
      cloudinaryPublicId: promotion?.cloudinaryPublicId ?? null,
    },
  })

  const watchAll = useWatch({ control })

  // ─── Image upload state ────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [deletingImage, setDeletingImage] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setImageError(null)
    setUploading(true)
    try {
      const uploaded = await uploadImage(file, 'promotion')
      setValue('imageUrl', uploaded.url, { shouldDirty: true, shouldValidate: true })
      setValue('cloudinaryPublicId', uploaded.publicId, { shouldDirty: true })
      toast.success('Imagen subida correctamente')
    } catch (err) {
      const message =
        err instanceof CloudinaryUploadError
          ? err.message
          : 'No pudimos subir la imagen. Intenta nuevamente.'
      setImageError(message)
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  async function handleRemoveImage() {
    const publicId = watchAll.cloudinaryPublicId
    if (publicId) {
      const ok =
        typeof window === 'undefined'
          ? true
          : window.confirm(
              'Esta imagen fue subida a Cloudinary. Si la eliminas, también se borrará del almacenamiento. ¿Continuar?'
            )
      if (!ok) return

      setDeletingImage(true)
      setImageError(null)
      try {
        const result = await deleteCloudinaryAsset(publicId)
        setValue('imageUrl', '', { shouldDirty: true, shouldValidate: true })
        setValue('cloudinaryPublicId', null, { shouldDirty: true })
        toast.success(
          result === 'not_found'
            ? 'La imagen ya no existía en Cloudinary, se quitó del formulario.'
            : 'Imagen eliminada de Cloudinary.'
        )
      } catch (err) {
        const message =
          err instanceof CloudinaryUploadError
            ? err.message
            : 'No pudimos eliminar la imagen.'
        setImageError(message)
        toast.error(message)
      } finally {
        setDeletingImage(false)
      }
    } else {
      // URL manual o sin imagen — solo limpia el campo, no toca Cloudinary.
      setValue('imageUrl', '', { shouldDirty: true, shouldValidate: true })
      setValue('cloudinaryPublicId', null, { shouldDirty: true })
    }
  }

  const handleFormSubmit = async (values: PromotionFormValues) => {
    const request: CreatePromotionRequest = {
      title: values.title,
      subtitle: values.subtitle || null,
      imageUrl: values.imageUrl || null,
      linkUrl: values.linkUrl || null,
      linkLabel: values.linkLabel || null,
      badgeText: values.badgeText || null,
      active: values.active,
      visible: values.visible,
      position: values.position,
      startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : null,
      endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : null,
      cloudinaryPublicId: values.cloudinaryPublicId || null,
    }
    await onSubmit(request)
  }

  const hasImage = !!watchAll.imageUrl && isSafeUrl(String(watchAll.imageUrl))
  const isCloudinary = !!watchAll.cloudinaryPublicId

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
      {/* ─── Preview ─── */}
      <FormSection
        title="Vista previa"
        hint="Así se verá la promoción en la home cuando esté visible y activa."
      >
        <PromotionPreview values={watchAll} />
      </FormSection>

      {/* ─── 1. Contenido ─── */}
      <FormSection
        title="1. Contenido"
        hint="Lo que el cliente lee en el banner."
      >
        <Field label="Título *" error={errors.title?.message}>
          <Input
            placeholder="Ej: 20% OFF en calzado urbano"
            error={!!errors.title}
            {...register('title')}
          />
        </Field>
        <Field label="Subtítulo">
          <Input placeholder="Ej: Por tiempo limitado · solo este fin de semana" {...register('subtitle')} />
        </Field>
        <Field label="Texto del badge" hint="Etiqueta corta (ej: Flash Sale, Nuevo Drop)">
          <Input placeholder="Flash Sale" {...register('badgeText')} />
        </Field>
      </FormSection>

      {/* ─── 2. Imagen ─── */}
      <FormSection
        title="2. Imagen"
        hint="Sube una imagen desde tu equipo o pega una URL directa."
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Preview thumbnail */}
          <div className="relative w-full sm:w-40 h-40 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
            {hasImage ? (
              <Image
                key={String(watchAll.imageUrl)}
                src={String(watchAll.imageUrl)}
                alt="Preview promoción"
                fill
                sizes="160px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50 text-xs gap-1">
                <Tag className="w-6 h-6" />
                Sin imagen
              </div>
            )}
            {isCloudinary && (
              <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-primary/90 text-primary-foreground px-1.5 py-0.5 rounded">
                Cloudinary
              </span>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_MIME.join(',')}
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || deletingImage}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                {uploading ? 'Subiendo…' : 'Subir imagen'}
              </button>
              {hasImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={uploading || deletingImage}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-destructive transition-colors disabled:opacity-60"
                >
                  {deletingImage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  {deletingImage ? 'Eliminando…' : 'Quitar imagen'}
                </button>
              )}
            </div>

            <Field label="O pega una URL" hint="http:// o https://" error={errors.imageUrl?.message}>
              <Input
                placeholder="https://..."
                error={!!errors.imageUrl}
                readOnly={isCloudinary}
                className={cn(isCloudinary && 'opacity-70 cursor-not-allowed')}
                {...register('imageUrl')}
              />
            </Field>

            {imageError && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                {imageError}
              </p>
            )}
          </div>
        </div>
      </FormSection>

      {/* ─── 3. CTA ─── */}
      <FormSection
        title="3. Botón de acción (CTA)"
        hint="Opcional. Si lo dejas vacío, la card de promoción no será clickeable."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="URL del enlace"
            hint="Ruta interna (/catalogo?...) o URL http/https"
            error={errors.linkUrl?.message}
          >
            <Input
              placeholder="/catalogo?categorySlug=zapatos"
              error={!!errors.linkUrl}
              {...register('linkUrl')}
            />
          </Field>
          <Field label="Texto del botón">
            <Input placeholder="Ver oferta" {...register('linkLabel')} />
          </Field>
        </div>
      </FormSection>

      {/* ─── 4. Visibilidad y fechas ─── */}
      <FormSection
        title="4. Visibilidad y fechas"
        hint="Una promoción solo aparece en la página de inicio cuando está activa, visible y dentro de sus fechas."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Controller
            control={control}
            name="visible"
            render={({ field }) => (
              <ToggleCard
                title="Visible en home"
                description="Muestra u oculta la promoción de la página de inicio sin eliminarla."
                value={!!field.value}
                onChange={field.onChange}
                onIcon={Eye}
                offIcon={EyeOff}
              />
            )}
          />
          <Controller
            control={control}
            name="active"
            render={({ field }) => (
              <ToggleCard
                title="Campaña activa"
                description="Pausa o reanuda la campaña. Si está inactiva, no aparece aunque esté visible."
                value={!!field.value}
                onChange={field.onChange}
                onIcon={Sparkles}
                offIcon={Sparkles}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Fecha de inicio"
            hint="Opcional — si la dejas vacía, empieza apenas la guardes"
          >
            <Input type="datetime-local" {...register('startsAt')} />
          </Field>
          <Field
            label="Fecha de finalización"
            hint="Opcional — promociones vencidas no aparecen en home"
            error={errors.endsAt?.message}
          >
            <Input type="datetime-local" error={!!errors.endsAt} {...register('endsAt')} />
          </Field>
        </div>
      </FormSection>

      {/* ─── 5. Prioridad ─── */}
      <FormSection
        title="5. Prioridad"
        hint="Define qué promoción aparece primero cuando hay varias visibles. Menor = primero."
      >
        <Field label="Prioridad" hint="0 = primero, 1 = segundo, etc.">
          <Input type="number" min={0} step={1} {...register('position')} />
        </Field>
      </FormSection>

      {/* Actions */}
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
          disabled={isSubmitting || uploading || deletingImage}
          className="px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Guardar cambios' : 'Crear promoción'}
        </button>
      </div>
    </form>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function FormSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-muted/15 border border-border rounded-xl p-5 sm:p-6 space-y-4">
      <div className="border-b border-border pb-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h3>
        {hint && <p className="text-xs text-muted-foreground/80 mt-1">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
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

function ToggleCard({
  title,
  description,
  value,
  onChange,
  onIcon: OnIcon,
  offIcon: OffIcon,
}: {
  title: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
  onIcon: React.ElementType
  offIcon: React.ElementType
}) {
  const Icon = value ? OnIcon : OffIcon
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        'text-left flex items-start gap-3 p-4 rounded-xl border transition-all',
        value
          ? 'bg-primary/10 border-primary/30 hover:border-primary/50'
          : 'bg-card border-border hover:border-muted-foreground/30'
      )}
    >
      <span
        className={cn(
          'mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border',
          value
            ? 'bg-primary/15 text-primary border-primary/30'
            : 'bg-muted text-muted-foreground border-border'
        )}
      >
        <Icon className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-foreground">{title}</p>
          <span
            className={cn(
              'text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded',
              value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {value ? 'Sí' : 'No'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
      </div>
    </button>
  )
}

// ─── Preview card (small) ───────────────────────────────────────────────────

function PromotionPreview({ values }: { values: Partial<PromotionFormValues> }) {
  const title = values.title?.trim() || 'Título de la promoción'
  const subtitle = values.subtitle?.trim() || null
  const badge = values.badgeText?.trim() || null
  const cta = values.linkLabel?.trim() || (values.linkUrl ? 'Ver productos' : null)
  const url = values.imageUrl?.trim()
  const hasSafeImage = !!url && isSafeUrl(url) && /^https?:\/\//i.test(url)

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border min-h-[180px] sm:min-h-[220px]">
      {hasSafeImage ? (
        <Image
          key={url}
          src={url!}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover"
          unoptimized
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #150803 0%, #29130A 35%, #F26A21 110%)',
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/50 to-transparent" />
      <div className="relative h-full p-5 sm:p-7 flex flex-col justify-end min-h-[180px] sm:min-h-[220px]">
        {badge && (
          <span className="inline-flex items-center self-start gap-1 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-2.5 py-1 rounded-full mb-3">
            <Sparkles className="w-3 h-3" />
            {badge}
          </span>
        )}
        <h4 className="text-white font-black text-2xl sm:text-3xl leading-tight max-w-md">
          {title}
        </h4>
        {subtitle && (
          <p className="text-white/85 text-sm mt-2 max-w-md line-clamp-2">{subtitle}</p>
        )}
        {cta && (
          <div className="mt-4 inline-flex items-center gap-1.5 self-start bg-white/95 text-foreground font-bold text-xs px-3.5 py-2 rounded-full">
            {cta}
            <ExternalLink className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  )
}
