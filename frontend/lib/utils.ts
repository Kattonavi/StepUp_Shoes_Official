import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { StockStatus } from '@/types'

/** Combina clases de Tailwind de forma segura. Usado por componentes shadcn/ui. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Formatea un precio en pesos colombianos (COP). Sin decimales. */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Genera la URL de WhatsApp con mensaje predefinido. */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}

/** Mensaje general para botones WhatsApp sin contexto de producto (header, home, contacto). */
export const GENERAL_WA_MESSAGE =
  'Hola, estoy interesado en sus productos. ¿Me pueden dar más información?'

const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  AVAILABLE: 'En stock',
  OUT_OF_STOCK: 'Agotado',
  ON_REQUEST: 'Bajo pedido',
}

const PURCHASE_INTENT: Record<StockStatus, string> = {
  AVAILABLE: 'Quiero comprar este producto.',
  OUT_OF_STOCK: 'Quiero saber si volverá a estar disponible.',
  ON_REQUEST: 'Quiero reservar/encargar este producto.',
}

/**
 * Genera el mensaje de WhatsApp para un producto específico.
 * Incluye nombre, categoría, precio, talla y estado de inventario.
 */
export function buildProductWhatsAppMessage(params: {
  productName: string
  categoryName?: string | null
  price: number
  stockStatus: StockStatus
  talla?: string | null
  hasSizes?: boolean
}): string {
  const tallaLine =
    params.talla
      ? `Talla: ${params.talla}`
      : params.hasSizes
      ? 'Talla: Por confirmar'
      : null

  const lines = [
    'Hola, estoy interesado en este producto:',
    '',
    `Producto: ${params.productName}`,
    params.categoryName ? `Categoría: ${params.categoryName}` : null,
    `Precio: ${formatPrice(params.price)}`,
    tallaLine,
    `Estado: ${STOCK_STATUS_LABEL[params.stockStatus]}`,
    '',
    PURCHASE_INTENT[params.stockStatus],
  ].filter((l) => l !== null) as string[]

  return lines.join('\n')
}

/** Convierte un texto a slug URL-friendly. */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/** Calcula el porcentaje de descuento entre dos precios. */
export function calculateDiscount(original: number, current: number): number {
  if (original <= 0 || current >= original) return 0
  return Math.round(((original - current) / original) * 100)
}
