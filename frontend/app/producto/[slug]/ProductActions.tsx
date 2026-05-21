'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import type { ProductSize } from '@/types'
import SizeSelector from './SizeSelector'
import { buildProductWhatsAppMessage, buildWhatsAppUrl } from '@/lib/utils'

interface ProductActionsProps {
  sizes: ProductSize[]
  waNumber: string | null
  productName: string
  referenceCode: string
  price: number
  pageUrl: string
}

export default function ProductActions({
  sizes,
  waNumber,
  productName,
  referenceCode,
  price,
  pageUrl,
}: ProductActionsProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const activeSizes = sizes.filter((s) => s.available)

  const waMessage = buildProductWhatsAppMessage({
    productName,
    referenceCode,
    price,
    talla: selectedSize ?? undefined,
    pageUrl,
  })

  const whatsappUrl = waNumber ? buildWhatsAppUrl(waNumber, waMessage) : null

  return (
    <div className="space-y-4">
      {activeSizes.length > 0 && (
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
            className="flex items-center justify-center gap-3 w-full bg-green-500 text-white font-semibold py-4 rounded-xl hover:bg-green-600 active:scale-[0.98] transition-all text-base shadow-lg shadow-green-500/20"
          >
            <MessageCircle className="w-5 h-5" />
            {selectedSize
              ? `Consultar talla ${selectedSize} por WhatsApp`
              : 'Preguntar por este producto'}
          </a>
        ) : (
          <div className="flex items-center justify-center gap-3 w-full bg-muted text-muted-foreground font-semibold py-4 rounded-xl text-base cursor-not-allowed">
            <MessageCircle className="w-5 h-5" />
            WhatsApp no configurado
          </div>
        )}
        {activeSizes.length > 0 && !selectedSize && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Selecciona una talla para incluirla en el mensaje
          </p>
        )}
      </div>
    </div>
  )
}
