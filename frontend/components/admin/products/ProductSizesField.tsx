'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useWatch, type Control } from 'react-hook-form'
import type { ProductFormValues } from './ProductForm'

interface ProductSizesFieldProps {
  control: Control<ProductFormValues>
}

export default function ProductSizesField({ control }: ProductSizesFieldProps) {
  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: 'sizes',
  })

  const currentSizes = useWatch({ control, name: 'sizes' })

  const isDuplicate = (value: string, index: number) => {
    const normalized = value.trim().toUpperCase()
    return currentSizes.some(
      (s, i) => i !== index && s.size.trim().toUpperCase() === normalized
    )
  }

  const handleSizeBlur = (index: number) => (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    if (!value) return

    if (value.includes(',')) {
      const parts = value
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
      if (parts.length < 2) return
      remove(index)
      ;[...parts].reverse().forEach((part) => insert(index, { size: part }))
      return
    }

    // Uppercase single value in-place via the registered input
    const input = e.target
    const upper = value.toUpperCase()
    if (input.value !== upper) {
      input.value = upper
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Tallas disponibles</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Escribe varias separadas por coma (ej: <span className="font-mono">38,39,40</span> o <span className="font-mono">S,M,L</span>). Se guardan en mayúsculas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => append({ size: '' })}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar talla
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
          Sin tallas configuradas. El producto no tendrá selector de talla.
        </p>
      )}

      {fields.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {fields.map((field, index) => {
            const dup = isDuplicate(currentSizes[index]?.size ?? '', index)
            return (
              <div key={field.id} className="flex items-center gap-1">
                <input
                  placeholder="Ej: 40"
                  maxLength={10}
                  className={`w-20 bg-background border rounded-lg px-2 py-1.5 text-sm text-center font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary uppercase ${
                    dup ? 'border-destructive' : 'border-border'
                  }`}
                  style={{ textTransform: 'uppercase' }}
                  {...control.register(`sizes.${index}.size`)}
                  onBlur={handleSizeBlur(index)}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {fields.length > 0 && currentSizes.some((s, i) => isDuplicate(s.size, i)) && (
        <p className="text-xs text-destructive">
          Hay tallas duplicadas. Por favor elimina una de cada par.
        </p>
      )}
    </div>
  )
}
