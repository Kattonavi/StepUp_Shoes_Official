import type { StorefrontEventType } from '@/types'

/** Convierte 0.18 → "18%". Tolera undefined/NaN → "0%". */
export function formatPct(value: number | null | undefined): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0%'
  return `${Math.round(n * 100)}%`
}

export const EVENT_LABELS: Record<StorefrontEventType, string> = {
  PRODUCT_VIEW: 'Vista',
  WHATSAPP_CLICK: 'WhatsApp',
  PROMOTION_VIEW: 'Promo',
  PROMOTION_CLICK: 'Promo',
  CATEGORY_VIEW: 'Categoría',
  CATALOG_VIEW: 'Catálogo',
  HOME_VIEW: 'Home',
}

/** Fecha/hora corta en es-CO. Seguro ante valores inválidos. */
export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
