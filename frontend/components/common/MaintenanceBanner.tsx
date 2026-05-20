'use client'

import { AlertTriangle } from 'lucide-react'
import type { PublicStoreSettings } from '@/types'

interface Props {
  settings: PublicStoreSettings | null
}

export default function MaintenanceBanner({ settings }: Props) {
  if (!settings?.maintenanceMode) return null

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-yellow-400">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          {settings.maintenanceMessage ?? 'Estamos realizando mejoras en la tienda. Vuelve pronto.'}
        </span>
      </div>
    </div>
  )
}
