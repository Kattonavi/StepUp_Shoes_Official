'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Star, ImageOff } from 'lucide-react'
import { useFieldArray, useWatch, type Control } from 'react-hook-form'
import type { ProductFormValues } from './ProductForm'
import { isSafeUrl } from '@/lib/url-validation'
import { cn } from '@/lib/utils'

interface ProductImagesFieldProps {
  control: Control<ProductFormValues>
}

export default function ProductImagesField({ control }: ProductImagesFieldProps) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'images',
  })

  // Watch images so previews update live as the URL field changes.
  const current = useWatch({ control, name: 'images' }) ?? []

  function setMainImage(index: number) {
    fields.forEach((_, i) => {
      const item = current[i] ?? fields[i]
      update(i, {
        url: item.url ?? '',
        altText: item.altText ?? '',
        position: item.position ?? i,
        mainImage: i === index,
      })
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Imágenes</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pega una URL directa de imagen (http/https). Más adelante se podrá subir imágenes directamente.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            append({
              url: '',
              altText: '',
              position: fields.length,
              mainImage: fields.length === 0,
            })
          }
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar imagen
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
          Sin imágenes. Agrega al menos una URL para que el producto se vea en la tienda.
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const live = current[index]
          const url = live?.url ?? ''
          const isMain = live?.mainImage ?? false
          const hasSafeUrl = !!url && isSafeUrl(url) && /^https?:\/\//i.test(url)
          return (
            <div key={field.id} className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                  Imagen {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMainImage(index)}
                    title="Marcar como principal"
                    className={cn(
                      'flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors',
                      isMain
                        ? 'bg-yellow-500/20 text-yellow-400 font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Star className="w-3.5 h-3.5" fill={isMain ? 'currentColor' : 'none'} />
                    {isMain ? 'Principal' : 'Hacer principal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                    title="Eliminar imagen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <ImagePreview url={hasSafeUrl ? url : null} />

                <div className="flex-1 space-y-2">
                  <ControlledInput
                    control={control}
                    name={`images.${index}.url`}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    label="URL de imagen *"
                  />
                  <ControlledInput
                    control={control}
                    name={`images.${index}.altText`}
                    placeholder="Descripción de la imagen para accesibilidad"
                    label="Texto alternativo"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ImagePreview({ url }: { url: string | null }) {
  const [failed, setFailed] = useState(false)

  if (!url) {
    return (
      <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted border border-dashed border-border flex items-center justify-center">
        <ImageOff className="w-5 h-5 text-muted-foreground/40" />
      </div>
    )
  }

  if (failed) {
    return (
      <div
        title="No pudimos cargar esta URL. Verifica que el enlace apunte a una imagen pública."
        className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-destructive/10 border border-destructive/30 flex items-center justify-center"
      >
        <ImageOff className="w-5 h-5 text-destructive" />
      </div>
    )
  }

  return (
    <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
      <Image
        key={url}
        src={url}
        alt="Preview"
        fill
        sizes="80px"
        className="object-cover"
        onError={() => setFailed(true)}
        unoptimized
      />
    </div>
  )
}

function ControlledInput({
  control,
  name,
  placeholder,
  label,
}: {
  control: Control<ProductFormValues>
  name: `images.${number}.url` | `images.${number}.altText`
  placeholder: string
  label: string
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <input
        placeholder={placeholder}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        {...control.register(name)}
      />
    </div>
  )
}
