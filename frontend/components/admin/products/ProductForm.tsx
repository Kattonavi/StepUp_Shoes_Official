'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
  stockQuantity: z.coerce.number().int().min(0).default(0),
  available: z.boolean().default(true),
})

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  slug: z.string().max(255).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  price: z.coerce.number().min(0, 'El precio debe ser >= 0'),
  oldPrice: z.coerce.number().min(0).optional().or(z.literal('')),
  discountPercentage: z.coerce.number().int().min(0).max(100).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'DRAFT', 'HIDDEN'] as const),
  stockStatus: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'ON_REQUEST'] as const),
  isNew: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  visible: z.boolean().default(true),
  seoTitle: z.string().max(255).optional().or(z.literal('')),
  seoDescription: z.string().max(500).optional().or(z.literal('')),
  displayOrder: z.coerce.number().int().min(0).optional().or(z.literal('')),
  images: z.array(imageSchema).default([]),
  sizes: z.array(sizeSchema).default([]),
})

export type ProductFormValues = z.infer<typeof productSchema>

// ─── Component ───────────────────────────────────────────────────────────────

interface ProductFormProps {
  /** Producto existente (modo edición) */
  product?: Product
  /** Lista de categorías para el selector */
  categories: Category[]
  /** Función de envío */
  onSubmit: (data: CreateProductRequest) => Promise<void>
  /** Ruta de cancelar */
  onCancel: () => void
  /** Si está enviando */
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
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    categoryId: product?.categoryId ?? '',
    price: product?.price ?? 0,
    oldPrice: product?.oldPrice ?? '',
    discountPercentage: product?.discountPercentage ?? '',
    status: (product?.status === 'DELETED' ? 'DRAFT' : product?.status) ?? 'DRAFT',
    stockStatus: product?.stockStatus ?? 'AVAILABLE',
    isNew: product?.isNew ?? false,
    isOnSale: product?.isOnSale ?? false,
    isFeatured: product?.isFeatured ?? false,
    visible: product?.visible ?? false,
    seoTitle: product?.seoTitle ?? '',
    seoDescription: product?.seoDescription ?? '',
    displayOrder: product?.displayOrder ?? '',
    images: product?.images.map((img) => ({
      url: img.url,
      altText: img.altText ?? '',
      position: img.position,
      mainImage: img.mainImage,
    })) ?? [],
    sizes: product?.sizes.map((s) => ({
      size: s.size,
      stockQuantity: s.stockQuantity,
      available: s.available,
    })) ?? [],
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  // Reset when product changes (e.g., after loading)
  useEffect(() => {
    if (product) reset(defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id])

  const handleFormSubmit = async (values: ProductFormValues) => {
    const request: CreateProductRequest = {
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || undefined,
      categoryId: values.categoryId,
      price: values.price,
      oldPrice: values.oldPrice !== '' && values.oldPrice !== undefined ? Number(values.oldPrice) : undefined,
      discountPercentage: values.discountPercentage !== '' && values.discountPercentage !== undefined ? Number(values.discountPercentage) : undefined,
      status: values.status,
      stockStatus: values.stockStatus,
      isNew: values.isNew,
      isOnSale: values.isOnSale,
      isFeatured: values.isFeatured,
      visible: values.visible,
      seoTitle: values.seoTitle || undefined,
      seoDescription: values.seoDescription || undefined,
      displayOrder: values.displayOrder !== '' && values.displayOrder !== undefined ? Number(values.displayOrder) : undefined,
      images: values.images.length > 0 ? values.images.map((img, i) => ({
        url: img.url,
        altText: img.altText || undefined,
        position: img.position ?? i,
        mainImage: img.mainImage,
      })) : undefined,
      sizes: values.sizes.length > 0 ? values.sizes.map((s) => ({
        size: s.size,
        stockQuantity: s.stockQuantity,
        available: s.available,
      })) : undefined,
    }
    await onSubmit(request)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8" noValidate>
      {/* Section 1 — Información básica */}
      <FormSection title="Información básica">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Nombre *" error={errors.name?.message}>
            <Input
              placeholder="Nike Air Max 90"
              error={!!errors.name}
              {...register('name')}
            />
          </Field>

          <Field label="Slug" hint="Opcional — se genera automáticamente si está vacío">
            <Input placeholder="nike-air-max-90" {...register('slug')} />
          </Field>
        </div>

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

      {/* Section 2 — Precios */}
      <FormSection title="Precio">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Precio actual *" error={errors.price?.message}>
            <Input
              type="number"
              step="0.01"
              min={0}
              placeholder="0.00"
              error={!!errors.price}
              {...register('price')}
            />
          </Field>

          <Field label="Precio anterior" hint="Solo si está en rebaja">
            <Input
              type="number"
              step="0.01"
              min={0}
              placeholder="0.00"
              {...register('oldPrice')}
            />
          </Field>

          <Field label="% Descuento" hint="0-100">
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="0"
              {...register('discountPercentage')}
            />
          </Field>
        </div>
      </FormSection>

      {/* Section 3 — Estado y etiquetas */}
      <FormSection title="Estado y visibilidad">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Estado del producto">
            <select
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              {...register('status')}
            >
              <option value="DRAFT">Borrador</option>
              <option value="ACTIVE">Activo</option>
              <option value="HIDDEN">Oculto</option>
            </select>
          </Field>

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
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'visible' as const, label: 'Visible en catálogo' },
            { name: 'isNew' as const, label: 'Nuevo ingreso' },
            { name: 'isOnSale' as const, label: 'En rebaja' },
            { name: 'isFeatured' as const, label: 'Destacado' },
          ].map(({ name, label }) => (
            <label key={name} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary cursor-pointer"
                {...register(name)}
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </FormSection>

      {/* Section 4 — SEO */}
      <FormSection title="SEO (opcional)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Título SEO" hint="Máx 255 caracteres">
            <Input placeholder="Nombre optimizado para buscadores" {...register('seoTitle')} />
          </Field>
          <Field label="Orden de display">
            <Input type="number" min={0} placeholder="0" {...register('displayOrder')} />
          </Field>
        </div>
        <Field label="Descripción SEO" hint="Máx 500 caracteres">
          <textarea
            rows={2}
            placeholder="Descripción para resultados de búsqueda..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
            {...register('seoDescription')}
          />
        </Field>
      </FormSection>

      {/* Section 5 — Imágenes */}
      <FormSection title="Imágenes">
        <ProductImagesField control={control} />
      </FormSection>

      {/* Section 6 — Tallas */}
      <FormSection title="Tallas e inventario">
        <ProductSizesField control={control} />
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
