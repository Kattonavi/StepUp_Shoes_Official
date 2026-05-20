'use client'

import { Construction, Settings } from 'lucide-react'
import RoleGuard from '@/components/admin/RoleGuard'

export default function AdminConfiguracionPage() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'OWNER']} redirectTo="/admin">
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-1">
            Ajustes generales de la tienda
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Construction className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                TODO(phase-5C)
              </span>
            </div>
            <h2 className="text-lg font-semibold">Configuración de tienda</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Nombre de tienda, número de WhatsApp, redes sociales,
              textos SEO y modo mantenimiento.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 mt-4 w-full max-w-md text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Endpoints backend disponibles
            </p>
            <ul className="space-y-1 text-xs font-mono text-muted-foreground">
              <li>GET /api/v1/settings</li>
              <li>GET /api/v1/settings/admin</li>
              <li>PUT /api/v1/settings</li>
            </ul>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
