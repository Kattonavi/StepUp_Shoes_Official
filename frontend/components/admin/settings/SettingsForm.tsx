'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Loader2, RotateCcw } from 'lucide-react'
import type { StoreSettings } from '@/types'
import { useUpdateSettingsMutation } from '@/hooks/admin/useSettingsMutations'
import { isSafeUrl, SAFE_URL_MESSAGE } from '@/lib/url-validation'
import SettingsSection from './SettingsSection'

const urlOrEmpty = z
  .string()
  .max(1000)
  .refine((v) => isSafeUrl(v), { message: SAFE_URL_MESSAGE })
  .optional()
  .or(z.literal(''))
// heroCtaUrl también pasa por validación de URL segura, pero con max=500.
const ctaUrlOrEmpty = z
  .string()
  .max(500)
  .refine((v) => isSafeUrl(v), { message: SAFE_URL_MESSAGE })
  .optional()
  .or(z.literal(''))
const emailOrEmpty = z.string().email('Email inválido').max(255).optional().or(z.literal(''))

const schema = z.object({
  // Identidad
  storeName:            z.string().min(1, 'El nombre es obligatorio').max(255),
  storeSlogan:          z.string().max(500).optional().or(z.literal('')),
  logoUrl:              urlOrEmpty,
  faviconUrl:           urlOrEmpty,
  // Contacto
  whatsappNumber:       z.string().max(50).optional().or(z.literal('')),
  whatsappDefaultMessage: z.string().max(500).optional().or(z.literal('')),
  contactEmail:         emailOrEmpty,
  contactPhone:         z.string().max(50).optional().or(z.literal('')),
  address:              z.string().max(500).optional().or(z.literal('')),
  city:                 z.string().max(100).optional().or(z.literal('')),
  country:              z.string().max(100).optional().or(z.literal('')),
  // Redes
  instagramUrl:         urlOrEmpty,
  facebookUrl:          urlOrEmpty,
  tiktokUrl:            urlOrEmpty,
  youtubeUrl:           urlOrEmpty,
  // SEO
  seoTitle:             z.string().max(255).optional().or(z.literal('')),
  seoDescription:       z.string().max(500).optional().or(z.literal('')),
  seoKeywords:          z.string().max(500).optional().or(z.literal('')),
  ogImageUrl:           urlOrEmpty,
  // Home — Hero
  heroTitle:            z.string().max(255).optional().or(z.literal('')),
  heroSubtitle:         z.string().max(500).optional().or(z.literal('')),
  heroCtaText:          z.string().max(100).optional().or(z.literal('')),
  heroCtaUrl:           ctaUrlOrEmpty,
  heroEyebrowText:      z.string().max(80).optional().or(z.literal('')),
  heroBadgeText:        z.string().max(80).optional().or(z.literal('')),
  heroSecondaryCtaText: z.string().max(60).optional().or(z.literal('')),
  heroStatOneValue:     z.string().max(40).optional().or(z.literal('')),
  heroStatOneLabel:     z.string().max(100).optional().or(z.literal('')),
  heroStatTwoValue:     z.string().max(40).optional().or(z.literal('')),
  heroStatTwoLabel:     z.string().max(100).optional().or(z.literal('')),
  heroStatThreeValue:   z.string().max(40).optional().or(z.literal('')),
  heroStatThreeLabel:   z.string().max(100).optional().or(z.literal('')),
  featuredSectionTitle:     z.string().max(255).optional().or(z.literal('')),
  newArrivalsSectionTitle:  z.string().max(255).optional().or(z.literal('')),
  // Operación
  maintenanceMode:      z.boolean(),
  maintenanceMessage:   z.string().max(500).optional().or(z.literal('')),
  catalogEnabled:       z.boolean(),
  whatsappEnabled:      z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  settings: StoreSettings
  canEdit: boolean
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

const inputCls = (disabled: boolean) =>
  `w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
    disabled ? 'opacity-60 cursor-not-allowed' : ''
  }`

export default function SettingsForm({ settings, canEdit }: Props) {
  const mutation = useUpdateSettingsMutation()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      storeName:                settings.storeName,
      storeSlogan:              settings.storeSlogan ?? '',
      logoUrl:                  settings.logoUrl ?? '',
      faviconUrl:               settings.faviconUrl ?? '',
      whatsappNumber:           settings.whatsappNumber ?? '',
      whatsappDefaultMessage:   settings.whatsappDefaultMessage ?? '',
      contactEmail:             settings.contactEmail ?? '',
      contactPhone:             settings.contactPhone ?? '',
      address:                  settings.address ?? '',
      city:                     settings.city ?? '',
      country:                  settings.country ?? '',
      instagramUrl:             settings.instagramUrl ?? '',
      facebookUrl:              settings.facebookUrl ?? '',
      tiktokUrl:                settings.tiktokUrl ?? '',
      youtubeUrl:               settings.youtubeUrl ?? '',
      seoTitle:                 settings.seoTitle ?? '',
      seoDescription:           settings.seoDescription ?? '',
      seoKeywords:              settings.seoKeywords ?? '',
      ogImageUrl:               settings.ogImageUrl ?? '',
      heroTitle:                settings.heroTitle ?? '',
      heroSubtitle:             settings.heroSubtitle ?? '',
      heroCtaText:              settings.heroCtaText ?? '',
      heroCtaUrl:               settings.heroCtaUrl ?? '',
      heroEyebrowText:          settings.heroEyebrowText ?? '',
      heroBadgeText:            settings.heroBadgeText ?? '',
      heroSecondaryCtaText:     settings.heroSecondaryCtaText ?? '',
      heroStatOneValue:         settings.heroStatOneValue ?? '',
      heroStatOneLabel:         settings.heroStatOneLabel ?? '',
      heroStatTwoValue:         settings.heroStatTwoValue ?? '',
      heroStatTwoLabel:         settings.heroStatTwoLabel ?? '',
      heroStatThreeValue:       settings.heroStatThreeValue ?? '',
      heroStatThreeLabel:       settings.heroStatThreeLabel ?? '',
      featuredSectionTitle:     settings.featuredSectionTitle ?? '',
      newArrivalsSectionTitle:  settings.newArrivalsSectionTitle ?? '',
      maintenanceMode:          settings.maintenanceMode,
      maintenanceMessage:       settings.maintenanceMessage ?? '',
      catalogEnabled:           settings.catalogEnabled,
      whatsappEnabled:          settings.whatsappEnabled,
    },
  })

  // Sync form when settings reload after save
  useEffect(() => {
    reset({
      storeName:                settings.storeName,
      storeSlogan:              settings.storeSlogan ?? '',
      logoUrl:                  settings.logoUrl ?? '',
      faviconUrl:               settings.faviconUrl ?? '',
      whatsappNumber:           settings.whatsappNumber ?? '',
      whatsappDefaultMessage:   settings.whatsappDefaultMessage ?? '',
      contactEmail:             settings.contactEmail ?? '',
      contactPhone:             settings.contactPhone ?? '',
      address:                  settings.address ?? '',
      city:                     settings.city ?? '',
      country:                  settings.country ?? '',
      instagramUrl:             settings.instagramUrl ?? '',
      facebookUrl:              settings.facebookUrl ?? '',
      tiktokUrl:                settings.tiktokUrl ?? '',
      youtubeUrl:               settings.youtubeUrl ?? '',
      seoTitle:                 settings.seoTitle ?? '',
      seoDescription:           settings.seoDescription ?? '',
      seoKeywords:              settings.seoKeywords ?? '',
      ogImageUrl:               settings.ogImageUrl ?? '',
      heroTitle:                settings.heroTitle ?? '',
      heroSubtitle:             settings.heroSubtitle ?? '',
      heroCtaText:              settings.heroCtaText ?? '',
      heroCtaUrl:               settings.heroCtaUrl ?? '',
      heroEyebrowText:          settings.heroEyebrowText ?? '',
      heroBadgeText:            settings.heroBadgeText ?? '',
      heroSecondaryCtaText:     settings.heroSecondaryCtaText ?? '',
      heroStatOneValue:         settings.heroStatOneValue ?? '',
      heroStatOneLabel:         settings.heroStatOneLabel ?? '',
      heroStatTwoValue:         settings.heroStatTwoValue ?? '',
      heroStatTwoLabel:         settings.heroStatTwoLabel ?? '',
      heroStatThreeValue:       settings.heroStatThreeValue ?? '',
      heroStatThreeLabel:       settings.heroStatThreeLabel ?? '',
      featuredSectionTitle:     settings.featuredSectionTitle ?? '',
      newArrivalsSectionTitle:  settings.newArrivalsSectionTitle ?? '',
      maintenanceMode:          settings.maintenanceMode,
      maintenanceMessage:       settings.maintenanceMessage ?? '',
      catalogEnabled:           settings.catalogEnabled,
      whatsappEnabled:          settings.whatsappEnabled,
    })
  }, [settings, reset])

  function onSubmit(values: FormValues) {
    mutation.mutate({
      ...values,
      storeSlogan:              values.storeSlogan || undefined,
      logoUrl:                  values.logoUrl || undefined,
      faviconUrl:               values.faviconUrl || undefined,
      whatsappNumber:           values.whatsappNumber || undefined,
      whatsappDefaultMessage:   values.whatsappDefaultMessage || undefined,
      contactEmail:             values.contactEmail || undefined,
      contactPhone:             values.contactPhone || undefined,
      address:                  values.address || undefined,
      city:                     values.city || undefined,
      country:                  values.country || undefined,
      instagramUrl:             values.instagramUrl || undefined,
      facebookUrl:              values.facebookUrl || undefined,
      tiktokUrl:                values.tiktokUrl || undefined,
      youtubeUrl:               values.youtubeUrl || undefined,
      seoTitle:                 values.seoTitle || undefined,
      seoDescription:           values.seoDescription || undefined,
      seoKeywords:              values.seoKeywords || undefined,
      ogImageUrl:               values.ogImageUrl || undefined,
      heroTitle:                values.heroTitle || undefined,
      heroSubtitle:             values.heroSubtitle || undefined,
      heroCtaText:              values.heroCtaText || undefined,
      heroCtaUrl:               values.heroCtaUrl || undefined,
      heroEyebrowText:          values.heroEyebrowText || undefined,
      heroBadgeText:            values.heroBadgeText || undefined,
      heroSecondaryCtaText:     values.heroSecondaryCtaText || undefined,
      heroStatOneValue:         values.heroStatOneValue || undefined,
      heroStatOneLabel:         values.heroStatOneLabel || undefined,
      heroStatTwoValue:         values.heroStatTwoValue || undefined,
      heroStatTwoLabel:         values.heroStatTwoLabel || undefined,
      heroStatThreeValue:       values.heroStatThreeValue || undefined,
      heroStatThreeLabel:       values.heroStatThreeLabel || undefined,
      featuredSectionTitle:     values.featuredSectionTitle || undefined,
      newArrivalsSectionTitle:  values.newArrivalsSectionTitle || undefined,
      maintenanceMessage:       values.maintenanceMessage || undefined,
    })
  }

  const disabled = !canEdit

  const logoUrl = watch('logoUrl')
  const maintenanceMode = watch('maintenanceMode')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Maintenance alert */}
      {maintenanceMode && (
        <div className="flex items-center gap-3 px-4 py-3 bg-destructive/5 border border-destructive/20 rounded-xl text-sm text-muted-foreground">
          <span className="text-destructive font-medium">⚠ Modo mantenimiento activo</span>
          — El storefront muestra un banner de mantenimiento.
        </div>
      )}

      {/* ─── Identidad ─────────────────────────────── */}
      <SettingsSection title="Identidad" description="Nombre, eslogan y assets de la marca.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre de la tienda *" error={errors.storeName?.message}>
            <input {...register('storeName')} disabled={disabled} className={inputCls(disabled)} placeholder="Nómada" />
          </Field>
          <Field label="Eslogan">
            <input {...register('storeSlogan')} disabled={disabled} className={inputCls(disabled)} placeholder="Catálogo urbano de zapatos..." />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="URL del logo" error={errors.logoUrl?.message} hint="Solo URL http/https o ruta interna.">
            <input {...register('logoUrl')} disabled={disabled} className={inputCls(disabled)} placeholder="https://..." />
          </Field>
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo preview" className="h-12 object-contain rounded border border-border mt-5" />
          )}
        </div>
      </SettingsSection>

      {/* ─── Contacto ──────────────────────────────── */}
      <SettingsSection title="Contacto" description="Datos de contacto que aparecen en el storefront.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Número de WhatsApp" hint="Sin + ni espacios, ej: 573001234567">
            <input {...register('whatsappNumber')} disabled={disabled} className={inputCls(disabled)} placeholder="573001234567" />
          </Field>
          <Field label="Email de contacto" error={errors.contactEmail?.message}>
            <input {...register('contactEmail')} type="email" disabled={disabled} className={inputCls(disabled)} placeholder="contacto@tienda.com" />
          </Field>
          <Field label="Teléfono de contacto">
            <input {...register('contactPhone')} disabled={disabled} className={inputCls(disabled)} placeholder="+57 300 123 4567" />
          </Field>
          <Field label="Ciudad">
            <input {...register('city')} disabled={disabled} className={inputCls(disabled)} placeholder="Bogotá" />
          </Field>
          <Field label="País">
            <input {...register('country')} disabled={disabled} className={inputCls(disabled)} placeholder="Colombia" />
          </Field>
          <Field label="Dirección">
            <input {...register('address')} disabled={disabled} className={inputCls(disabled)} placeholder="Calle 123 # 45-67" />
          </Field>
        </div>
        <Field label="Mensaje por defecto de WhatsApp">
          <input {...register('whatsappDefaultMessage')} disabled={disabled} className={inputCls(disabled)} placeholder="Hola, me interesa..." />
        </Field>
      </SettingsSection>

      {/* ─── Redes sociales ────────────────────────── */}
      <SettingsSection title="Redes sociales" description="URLs de perfiles sociales.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Instagram" error={errors.instagramUrl?.message}>
            <input {...register('instagramUrl')} disabled={disabled} className={inputCls(disabled)} placeholder="https://instagram.com/..." />
          </Field>
          <Field label="Facebook" error={errors.facebookUrl?.message}>
            <input {...register('facebookUrl')} disabled={disabled} className={inputCls(disabled)} placeholder="https://facebook.com/..." />
          </Field>
          <Field label="TikTok" error={errors.tiktokUrl?.message}>
            <input {...register('tiktokUrl')} disabled={disabled} className={inputCls(disabled)} placeholder="https://tiktok.com/@..." />
          </Field>
          <Field label="YouTube" error={errors.youtubeUrl?.message}>
            <input {...register('youtubeUrl')} disabled={disabled} className={inputCls(disabled)} placeholder="https://youtube.com/..." />
          </Field>
        </div>
      </SettingsSection>

      {/* ─── SEO ───────────────────────────────────── */}
      <SettingsSection title="SEO global" description="Metadatos usados en toda la tienda como fallback.">
        <Field label="Título SEO">
          <input {...register('seoTitle')} disabled={disabled} className={inputCls(disabled)} placeholder="Nómada — Zapatos y accesorios" />
        </Field>
        <Field label="Descripción SEO">
          <textarea {...register('seoDescription')} disabled={disabled} rows={3} className={`${inputCls(disabled)} resize-none`} placeholder="Descubre nuestra colección..." />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Palabras clave (keywords)">
            <input {...register('seoKeywords')} disabled={disabled} className={inputCls(disabled)} placeholder="zapatos, gorras, accesorios" />
          </Field>
          <Field label="Imagen OG (og:image URL)" error={errors.ogImageUrl?.message}>
            <input {...register('ogImageUrl')} disabled={disabled} className={inputCls(disabled)} placeholder="https://..." />
          </Field>
        </div>
      </SettingsSection>

      {/* ─── Inicio / Hero principal ──────────────────── */}
      <SettingsSection
        title="Inicio / Hero principal"
        description="Textos del hero de la página de inicio. Deja un campo vacío para usar el valor por defecto."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Texto superior (eyebrow)" hint="Se muestra en mayúsculas.">
            <input {...register('heroEyebrowText')} disabled={disabled} className={inputCls(disabled)} placeholder="NUEVA TEMPORADA" />
          </Field>
          <Field label="Badge" hint="Acompaña al texto superior.">
            <input {...register('heroBadgeText')} disabled={disabled} className={inputCls(disabled)} placeholder="STOCK LIMITADO" />
          </Field>
          <Field label="Título principal">
            <input {...register('heroTitle')} disabled={disabled} className={inputCls(disabled)} placeholder="ENCUENTRA TU PRÓXIMO ESTILO" />
          </Field>
          <Field label="Subtítulo">
            <input {...register('heroSubtitle')} disabled={disabled} className={inputCls(disabled)} placeholder="PRODUCTOS SELECCIONADOS CON ATENCIÓN PERSONALIZADA" />
          </Field>
          <Field label="Botón principal (texto)">
            <input {...register('heroCtaText')} disabled={disabled} className={inputCls(disabled)} placeholder="VER CATÁLOGO" />
          </Field>
          <Field label="Botón principal (URL)" error={errors.heroCtaUrl?.message} hint="Ruta interna (/...) o URL http/https.">
            <input {...register('heroCtaUrl')} disabled={disabled} className={inputCls(disabled)} placeholder="/catalogo" />
          </Field>
          <Field label="Botón WhatsApp (texto)" hint="El enlace usa el número/mensaje de la sección Contacto.">
            <input {...register('heroSecondaryCtaText')} disabled={disabled} className={inputCls(disabled)} placeholder="PREGUNTA POR WHATSAPP" />
          </Field>
        </div>

        {/* Stats / highlights */}
        <div className="border-t border-border pt-4 mt-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Métricas debajo de los botones
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Métrica 1 — valor">
              <input {...register('heroStatOneValue')} disabled={disabled} className={inputCls(disabled)} placeholder="+50" />
            </Field>
            <Field label="Métrica 1 — descripción">
              <input {...register('heroStatOneLabel')} disabled={disabled} className={inputCls(disabled)} placeholder="REFERENCIAS ACTIVAS" />
            </Field>
            <Field label="Métrica 2 — valor">
              <input {...register('heroStatTwoValue')} disabled={disabled} className={inputCls(disabled)} placeholder="WHATSAPP" />
            </Field>
            <Field label="Métrica 2 — descripción">
              <input {...register('heroStatTwoLabel')} disabled={disabled} className={inputCls(disabled)} placeholder="ATENCIÓN RÁPIDA Y DIRECTA" />
            </Field>
            <Field label="Métrica 3 — valor">
              <input {...register('heroStatThreeValue')} disabled={disabled} className={inputCls(disabled)} placeholder="CURADOS" />
            </Field>
            <Field label="Métrica 3 — descripción">
              <input {...register('heroStatThreeLabel')} disabled={disabled} className={inputCls(disabled)} placeholder="SELECCIÓN CON ESTILO Y CONFIANZA" />
            </Field>
          </div>
        </div>

        {/* Section titles */}
        <div className="border-t border-border pt-4 mt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Título 'Productos destacados'">
              <input {...register('featuredSectionTitle')} disabled={disabled} className={inputCls(disabled)} placeholder="Productos destacados" />
            </Field>
            <Field label="Título 'Nuevos productos'">
              <input {...register('newArrivalsSectionTitle')} disabled={disabled} className={inputCls(disabled)} placeholder="Nuevos productos" />
            </Field>
          </div>
        </div>
      </SettingsSection>

      {/* ─── Operación ─────────────────────────────── */}
      <SettingsSection title="Operación" description="Controles de estado de la tienda.">
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium">Modo mantenimiento</p>
              <p className="text-xs text-muted-foreground">Muestra un banner en el storefront.</p>
            </div>
            <input type="checkbox" {...register('maintenanceMode')} disabled={disabled} className="w-4 h-4 accent-destructive" />
          </label>

          {maintenanceMode && (
            <Field label="Mensaje de mantenimiento">
              <input {...register('maintenanceMessage')} disabled={disabled} className={inputCls(disabled)} placeholder="Estamos realizando mejoras..." />
            </Field>
          )}

          <div className="border-t border-border pt-4 space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium">Catálogo habilitado</p>
                <p className="text-xs text-muted-foreground">Si está desactivado, el catálogo muestra mensaje de no disponible.</p>
              </div>
              <input type="checkbox" {...register('catalogEnabled')} disabled={disabled} className="w-4 h-4 accent-primary" />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium">WhatsApp habilitado</p>
                <p className="text-xs text-muted-foreground">Muestra u oculta los botones de WhatsApp en la tienda.</p>
              </div>
              <input type="checkbox" {...register('whatsappEnabled')} disabled={disabled} className="w-4 h-4 accent-primary" />
            </label>
          </div>
        </div>
      </SettingsSection>

      {/* ─── Actions ───────────────────────────────── */}
      {canEdit && (
        <div className="flex items-center gap-3 justify-end pt-2">
          {isDirty && (
            <button
              type="button"
              onClick={() => reset()}
              className="flex items-center gap-1.5 text-sm px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Descartar
            </button>
          )}
          <button
            type="submit"
            disabled={mutation.isPending || !isDirty}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}
    </form>
  )
}
