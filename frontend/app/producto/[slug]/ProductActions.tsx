'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import type { ProductSize, StockStatus } from '@/types'
import SizeSelector from './SizeSelector'
import { buildProductWhatsAppMessage, buildWhatsAppUrl } from '@/lib/utils'
import { trackStorefrontEvent } from '@/services/storefront-event.service'

interface ProductActionsProps {
  sizes: ProductSize[]
  waNumber: string | null
  productId: string
  productSlug: string
  productName: string
  categoryId: string | null
  categoryName: string | null
  price: number
  stockStatus: StockStatus
}

export default function ProductActions({
  sizes,
  waNumber,
  productId,
  productSlug,
  productName,
  categoryId,
  categoryName,
  price,
  stockStatus,
}: ProductActionsProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  /**
   * Registra el WHATSAPP_CLICK SIN bloquear la apertura de WhatsApp.
   * El navegador sigue el href de inmediato; el tracking va fire-and-forget.
   */
  function handleWhatsAppClick() {
    trackStorefrontEvent({
      eventType: 'WHATSAPP_CLICK',
      productId,
      productSlug,
      productName,
      categoryId,
      categoryName,
      selectedSize,
      stockStatus,
      sourcePage: 'product_detail',
      metadata: { buttonLabel: getButtonLabel() },
    })
  }

  const activeSizes = sizes.filter((s) => s.available)
  const hasSizes = activeSizes.length > 0

  const waMessage = buildProductWhatsAppMessage({
    productName,
    categoryName,
    price,
    stockStatus,
    talla: selectedSize,
    hasSizes,
  })

  const whatsappUrl = waNumber ? buildWhatsAppUrl(waNumber, waMessage) : null

  // Texto del botón según reglas de stock y talla
  function getButtonLabel(): string {
    if (stockStatus === 'OUT_OF_STOCK') return 'Consultar disponibilidad'
    if (stockStatus === 'ON_REQUEST') return 'Encargar por WhatsApp'
    if (selectedSize) return `Consultar talla ${selectedSize} por WhatsApp`
    if (hasSizes) return 'Consultar disponibilidad'
    return 'Consultar por WhatsApp'
  }

  return (
    <div className="space-y-4">
      {hasSizes && (
        <SizeSelector
          sizes={activeSizes}
          selected={selectedSize}
          onSelect={setSelectedSize}
        />
      )}

      <div className="pt-2">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="flex items-center justify-center gap-3 w-full bg-green-500 text-white font-semibold py-4 rounded-xl hover:bg-green-600 active:scale-[0.98] transition-all text-base shadow-lg shadow-green-500/20"
          >
            <MessageCircle className="w-5 h-5" />
            {getButtonLabel()}
          </a>
        ) : (
          <div className="flex items-center justify-center gap-3 w-full bg-muted text-muted-foreground font-semibold py-4 rounded-xl text-base cursor-not-allowed">
            <MessageCircle className="w-5 h-5" />
            WhatsApp no configurado
          </div>
        )}
        {hasSizes && !selectedSize && stockStatus === 'AVAILABLE' && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Selecciona una talla para incluirla en el mensaje
          </p>
        )}
      </div>
    </div>
  )
}
