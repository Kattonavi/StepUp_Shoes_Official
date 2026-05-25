'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Star, ImageOff, Upload, Loader2 } from 'lucide-react'
import { useFieldArray, useWatch, type Control } from 'react-hook-form'
import type { ProductFormValues } from './ProductForm'
import { isSafeUrl } from '@/lib/url-validation'
import {
  uploadProductImage,
  CloudinaryUploadError,
  ACCEPTED_IMAGE_MIME,
} from '@/lib/cloudinary'
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

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function setMainImage(index: number) {
    fields.forEach((_, i) => {
      const item = current[i] ?? fields[i]
      update(i, {
        url: item.url ?? '',
        altText: item.altText ?? '',
        position: item.position ?? i,
        mainImage: i === index,
        cloudinaryPublicId: item.cloudinaryPublicId ?? null,
      })
    })
  }

  function addManualUrl() {
    append({
      url: '',
      altText: '',
      position: fields.length,
      mainImage: fields.length === 0,
      cloudinaryPublicId: null,
    })
  }

  function triggerFileSelect() {
    setUploadError(null)
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return

    const files = Array.from(fileList)
    // Reset input so the same file can be picked again later.
    e.target.value = ''

    setUploadError(null)
    setUploading(true)
    try {
      // Sube en serie para que los errores sean claros y no peguen rate-limit.
      for (const file of files) {
        try {
          const uploaded = await uploadProductImage(file)
          append({
            url: uploaded.url,
            altText: '',
            position: fields.length,
            mainImage: fields.length === 0 && current.every((img) => !img?.mainImage),
            cloudinaryPublicId: uploaded.publicId,
          })
        } catch (err) {
          const message =
            err instanceof CloudinaryUploadError
              ? err.message
              : 'No pudimos subir la imagen. Intenta nuevamente.'
          setUploadError(message)
          // Si falla una, seguimos con las demás — no bloqueamos todo.
        }
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Imágenes del producto</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Puedes subir imágenes desde tu equipo o pegar una URL directa.
            Recomendado: imágenes cuadradas o verticales, mínimo 800px.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_MIME.join(',')}
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={triggerFileSelect}
            disabled={uploading}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            {uploading ? 'Subiendo…' : 'Subir imagen'}
          </button>
          <button
            type="button"
            onClick={addManualUrl}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Pegar URL
          </button>
        </div>
      </div>

      {uploadError && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
          {uploadError}
        </p>
      )}

      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
          Sin imágenes. Agrega al menos una para que el producto se vea en la tienda.
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const live = current[index]
          const url = live?.url ?? ''
          const isMain = live?.mainImage ?? false
          const isCloudinary = !!live?.cloudinaryPublicId
          const hasSafeUrl = !!url && isSafeUrl(url) && /^https?:\/\//i.test(url)
          return (
            <div key={field.id} className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                  Imagen {index + 1}
                  {isCloudinary && (
                    <span className="text-[10px] uppercase tracking-wide bg-primary/15 text-primary px-1.5 py-0.5 rounded">
                      Cloudinary
                    </span>
                  )}
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
                    readOnly={isCloudinary}
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
  readOnly,
}: {
  control: Control<ProductFormValues>
  name: `images.${number}.url` | `images.${number}.altText`
  placeholder: string
  label: string
  readOnly?: boolean
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <input
        placeholder={placeholder}
        readOnly={readOnly}
        className={cn(
          'w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
          readOnly && 'opacity-70 cursor-not-allowed'
        )}
        {...control.register(name)}
      />
    </div>
  )
}
