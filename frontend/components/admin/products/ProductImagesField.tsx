'use client'

import Image from 'next/image'
import { Plus, Trash2, Star } from 'lucide-react'
import { useFieldArray, type Control } from 'react-hook-form'
import type { ProductFormValues } from './ProductForm'
import { cn } from '@/lib/utils'

interface ProductImagesFieldProps {
  control: Control<ProductFormValues>
}

export default function ProductImagesField({ control }: ProductImagesFieldProps) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'images',
  })

  function setMainImage(index: number) {
    fields.forEach((_, i) => {
      update(i, { ...fields[i], mainImage: i === index })
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Imágenes</h3>
        <button
          type="button"
          onClick={() => append({ url: '', altText: '', position: fields.length, mainImage: fields.length === 0 })}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar imagen
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
          Sin imágenes. Agrega URLs de imágenes del producto.
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
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
                    field.mainImage
                      ? 'bg-yellow-500/20 text-yellow-400 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Star className="w-3.5 h-3.5" fill={field.mainImage ? 'currentColor' : 'none'} />
                  {field.mainImage ? 'Principal' : 'Hacer principal'}
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
              {/* Preview */}
              {field.url && (
                <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
                  <Image
                    src={field.url}
                    alt="Preview"
                    fill
                    sizes="64px"
                    className="object-cover"
                    onError={() => {}} // Silently fail on bad URLs
                  />
                </div>
              )}

              <div className="flex-1 space-y-2">
                {/* URL field — using register through control */}
                <ControlledInput
                  control={control}
                  name={`images.${index}.url`}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  label="URL de imagen *"
                />
                <ControlledInput
                  control={control}
                  name={`images.${index}.altText`}
                  placeholder="Descripción de la imagen"
                  label="Texto alternativo"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple controlled input helper
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
  // We use a plain uncontrolled approach through register
  // This is just a display wrapper — the actual register happens in ProductForm
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
