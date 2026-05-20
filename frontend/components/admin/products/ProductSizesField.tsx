'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, type Control } from 'react-hook-form'
import type { ProductFormValues } from './ProductForm'

interface ProductSizesFieldProps {
  control: Control<ProductFormValues>
}

export default function ProductSizesField({ control }: ProductSizesFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sizes',
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Tallas e inventario</h3>
        <button
          type="button"
          onClick={() => append({ size: '', stockQuantity: 0, available: true })}
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
        <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b border-border">
            <span>Talla</span>
            <span>Stock</span>
            <span>Activa</span>
            <span></span>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 items-center px-4 py-3 border-b border-border last:border-0"
            >
              <input
                placeholder="Ej: 40, M, XL"
                className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                {...control.register(`sizes.${index}.size`)}
              />
              <input
                type="number"
                min={0}
                placeholder="0"
                className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                {...control.register(`sizes.${index}.stockQuantity`, {
                  valueAsNumber: true,
                })}
              />
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary cursor-pointer"
                {...control.register(`sizes.${index}.available`)}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                title="Eliminar talla"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
