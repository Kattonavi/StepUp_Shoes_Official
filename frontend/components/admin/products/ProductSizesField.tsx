'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useFieldArray, useWatch, type Control } from 'react-hook-form'
import type { ProductFormValues } from './ProductForm'
import { cn } from '@/lib/utils'

interface ProductSizesFieldProps {
  control: Control<ProductFormValues>
}

const CLOTHING_PRESET = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const SHOES_PRESET = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44']

export default function ProductSizesField({ control }: ProductSizesFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sizes',
  })

  const currentSizes = useWatch({ control, name: 'sizes' }) ?? []
  const [input, setInput] = useState('')

  // Normalize and collect current size values for de-duplication.
  const existing = new Set(
    currentSizes
      .map((s) => s?.size?.trim().toUpperCase())
      .filter((v): v is string => !!v)
  )

  function addSize(rawValue: string) {
    const normalized = rawValue.trim().toUpperCase()
    if (!normalized) return
    if (existing.has(normalized)) return
    append({ size: normalized })
    existing.add(normalized)
  }

  function addFromInput() {
    if (!input.trim()) return
    // Allow comma-separated bulk add: "38, 39, 40"
    const parts = input.split(',').map((p) => p.trim()).filter(Boolean)
    parts.forEach((p) => addSize(p))
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addFromInput()
    }
  }

  function togglePreset(preset: string) {
    const normalized = preset.toUpperCase()
    const index = currentSizes.findIndex(
      (s) => s?.size?.trim().toUpperCase() === normalized
    )
    if (index >= 0) {
      remove(index)
    } else {
      append({ size: normalized })
    }
  }

  function removeByIndex(index: number) {
    remove(index)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Tallas disponibles</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Cada talla es una opción que el cliente puede elegir antes de consultar por WhatsApp.
        </p>
      </div>

      {/* Quick presets */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Atajos
        </p>
        <PresetRow
          label="Ropa"
          options={CLOTHING_PRESET}
          existing={existing}
          onToggle={togglePreset}
        />
        <PresetRow
          label="Zapatos"
          options={SHOES_PRESET}
          existing={existing}
          onToggle={togglePreset}
        />
      </div>

      {/* Manual input */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Agregar talla personalizada
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ej: 41 o XL — separa varias con coma"
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary/50"
            style={{ textTransform: 'uppercase' }}
            maxLength={10}
          />
          <button
            type="button"
            onClick={addFromInput}
            disabled={!input.trim()}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar
          </button>
        </div>
      </div>

      {/* Current sizes as chips */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
          Tallas seleccionadas ({fields.length})
        </p>
        {fields.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
            Sin tallas configuradas. El producto no tendrá selector de talla en la tienda.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {fields.map((field, index) => (
              <span
                key={field.id}
                className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full pl-3 pr-1 py-1 text-sm font-semibold"
              >
                {currentSizes[index]?.size?.toUpperCase() ?? ''}
                <button
                  type="button"
                  onClick={() => removeByIndex(index)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Quitar talla ${currentSizes[index]?.size ?? ''}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PresetRow({
  label,
  options,
  existing,
  onToggle,
}: {
  label: string
  options: string[]
  existing: Set<string>
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium w-16 shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isActive = existing.has(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={cn(
                'min-w-[2.5rem] px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
