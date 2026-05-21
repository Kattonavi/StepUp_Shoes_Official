import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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

/** Genera el mensaje de WhatsApp para un producto. */
export function buildProductWhatsAppMessage(params: {
  productName: string
  referenceCode?: string
  price?: number
  talla?: string
  pageUrl: string
}): string {
  const lines = [
    `Hola, estoy interesado en: *${params.productName}*`,
    params.referenceCode ? `Referencia: ${params.referenceCode}` : '',
    params.price ? `Precio: ${formatPrice(params.price)}` : '',
    params.talla ? `Talla seleccionada: ${params.talla}` : '',
    `¿Me confirmas disponibilidad, tallas y forma de compra?`,
    `${params.pageUrl}`,
  ].filter(Boolean)

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
