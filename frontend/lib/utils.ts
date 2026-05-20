import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combina clases de Tailwind de forma segura. Usado por componentes shadcn/ui. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Formatea un precio en formato local. */
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
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
  talla?: string
  pageUrl: string
}): string {
  const lines = [
    `Hola! Me interesa el siguiente producto: *${params.productName}*`,
    params.talla ? `Talla: ${params.talla}` : '',
    `Ver producto: ${params.pageUrl}`,
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
