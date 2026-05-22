import type { Metadata } from 'next'
import { Suspense } from 'react'
import PromocionesClient from './PromocionesClient'

export const metadata: Metadata = {
  title: 'Promociones',
  robots: { index: false, follow: false },
}

export default function AdminPromocionesPage() {
  return (
    <Suspense fallback={
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted/40 rounded-xl animate-pulse" />
        ))}
      </div>
    }>
      <PromocionesClient />
    </Suspense>
  )
}
