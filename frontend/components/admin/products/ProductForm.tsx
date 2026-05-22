'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category, CreateProductRequest, Product } from '@/types'
import ProductImagesField from './ProductImagesField'
import ProductSizesField from './ProductSizesField'

// ─── Zod schema ──────────────────────────────────────────────────────────────

const imageSchema = z.object({
  url: z.string().min(1, 'La URL es requerida').max(1000),
  altText: z.string().max(255).optional().or(z.literal('')),
  position: z.number().int().min(0).optional(),
  mainImage: z.boolean().default(false),
})

const sizeSchema = z.object({
  size: z.string().min(1, 'La talla es requerida').max(50),
})

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  description: z.string().optional().or(z.literal('')),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  price: z.coerce.number().min(0, 'El precio debe ser >= 0'),
  oldPrice: z.coerce.number().min(0).optional().or(z.literal('')),
  discountPercentage: z.number().optional(),
  stockStatus: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'ON_REQUEST'] as const),
  isNew: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  images: z.array(imageSchema).default([]),
  sizes: z.array(sizeSchema).default([]),
})

export type ProductFormValues = z.infer<typeof productSchema>

// ─── Component ───────────────────────────────────────────────────────────────

interface ProductFormProps {
  product?: Product
  categories: Category[]
  onSubmit: (data: CreateProductRequest) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export default function ProductForm({
  product,
  categories,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProductFormProps) {
  const isEdit = !!product

  const defaultValues: ProductFormValues = {
    name: product?.name ?? '',
    description: product?.description ?? '',
    categoryId: product?.categoryId ?? '',
    price: product?.price ?? 0,
    oldPrice: product?.oldPrice ?? '',
    discountPercentage: product?.discountPercentage ?? undefined,
    stockStatus: product?.stockStatus ?? 'AVAILABLE',
    isNew: product?.isNew ?? false,
    isFeatured: product?.isFeatured ?? false,
    images: product?.images.map((img) => ({
      url: img.url,
      altText: img.altText ?? '',
      position: img.position,
      mainImage: img.mainImage,
    })) ?? [],
    sizes: product?.sizes.map((s) => ({ size: s.size })) ?? [],
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  useEffect(() => {
    if (product) reset(defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id])

  // ─── Auto-calcular descuento ──────────────────────────────────────────────
  const price = useWatch({ control, name: 'price' })
  const oldPrice = useWatch({ control, name: 'oldPrice' })

  useEffect(() => {
    const p = Number(price) || 0
    const op = oldPrice !== '' && oldPrice !== undefined ? Number(oldPrice) : 0
    if (op > 0 && op > p && p > 0) {
      const discount = Math.round(((op - p) / op) * 100 * 100) / 100
      setValue('discountPercentage', discount)
    } else {
      setValue('discountPercentage', undefined)
    }
  }, [price, oldPrice, setValue])

  const discountPercentage = watch('discountPercentage')

  const handleFormSubmit = async (values: ProductFormValues) => {
    const request: CreateProductRequest = {
      name: values.name,
      description: values.description || undefined,
      categoryId: values.categoryId,
      price: values.price,
      oldPrice: values.oldPrice !== '' && values.oldPrice !== undefined
        ? Number(values.oldPrice)
        : undefined,
      stockStatus: values.stockStatus,
      isNew: values.isNew,
      isFeatured: values.isFeatured,
      // En edit: conservar status y visible; en create: ACTIVE + visible=true
      status: isEdit ? product?.status ?? 'ACTIVE' : 'ACTIVE',
      visible: isEdit ? product?.visible ?? true : true,
      images: values.images.length > 0
        ? values.images.map((img, i) => ({
            url: img.url,
            altText: img.altText || undefined,
            position: img.position ?? i,
            mainImage: img.mainImage,
          }))
        : undefined,
      sizes: values.sizes.length > 0
        ? values.sizes.map((s) => ({
            size: s.size.trim().toUpperCase(),
          }))
        : undefined,
    }
    await onSubmit(request)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8" noValidate>

      {/* A — Información básica */}
      <FormSection title="Información básica">
        <Field label="Nombre del producto *" error={errors.name?.message}>
          <Input
            placeholder="Ej: Nike Air Max 90"
            error={!!errors.name}
            {...register('name')}
          />
        </Field>

        <Field label="Descripción">
          <textarea
            rows={3}
            placeholder="Descripción del producto..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
            {...register('description')}
          />
        </Field>

        <Field label="Categoría *" error={errors.categoryId?.message}>
          <select
            className={cn(
              'w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
              errors.categoryId ? 'border-destructive' : 'border-border'
            )}
            {...register('categoryId')}
          >
            <option value="">Seleccionar categoría...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon ? `${cat.icon} ` : ''}{cat.name}
              </option>
            ))}
          </select>
        </Field>
      </FormSection>

      {/* B — Precio */}
      <FormSection title="Precio">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Precio actual *" error={errors.price?.message}>
            <Input
              type="number"
              step="1"
              min={0}
              placeholder="120000"
              error={!!errors.price}
              {...register('price')}
            />
          </Field>

          <Field label="Precio anterior" hint="Solo si hay rebaja">
            <Input
              type="number"
              step="1"
              min={0}
              placeholder="150000"
              {...register('oldPrice')}
            />
          </Field>

          <Field label="Descuento" hint="Calculado automáticamente">
            <div className={cn(
              'w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-muted',
              discountPercentage ? 'text-primary font-semibold' : 'text-muted-foreground'
            )}>
              {discountPercentage ? `${discountPercentage}% OFF` : 'Sin descuento'}
            </div>
          </Field>
        </div>
      </FormSection>

      {/* C — Estado comercial */}
      <FormSection title="Estado comercial">
        <Field label="Estado de stock">
          <select
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            {...register('stockStatus')}
          >
            <option value="AVAILABLE">Disponible</option>
            <option value="OUT_OF_STOCK">Sin stock</option>
            <option value="ON_REQUEST">Por pedido</option>
          </select>
        </Field>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-primary cursor-pointer"
              {...register('isNew')}
            />
            <span className="text-sm">Nuevo ingreso</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-primary cursor-pointer"
              {...register('isFeatured')}
            />
            <span className="text-sm">Destacado</span>
          </label>
        </div>
      </FormSection>

      {/* D — Tallas */}
      <FormSection title="Tallas">
        <ProductSizesField control={control} />
      </FormSection>

      {/* E — Imágenes */}
      <FormSection title="Imágenes">
        <ProductImagesField control={control} />
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
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border pb-3">
        {title}
      </h2>
      {children}
    </div>
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
