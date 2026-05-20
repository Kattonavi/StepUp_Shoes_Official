'use client'

import { useAuth } from '@/hooks/useAuth'
import { useAdminSettings } from '@/hooks/admin/useAdminSettings'
import AdminPageHeader from '@/components/admin/common/AdminPageHeader'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import ErrorState from '@/components/common/ErrorState'
import SettingsForm from '@/components/admin/settings/SettingsForm'

export default function SettingsClient() {
  const { user } = useAuth()
  const { data: settings, isLoading, error, refetch } = useAdminSettings()

  if (!user) return null

  const canEdit = user.role === 'SUPER_ADMIN' || user.role === 'OWNER'

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Configuración de tienda"
        description="Gestiona nombre, contacto, redes, SEO, home y operación de la tienda."
      />

      {!canEdit && (
        <div className="px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm text-muted-foreground">
          Solo OWNER y SUPER_ADMIN pueden editar la configuración. Modo solo lectura.
        </div>
      )}

      {isLoading && <AdminTableSkeleton rows={10} cols={2} />}

      {error && (
        <ErrorState title="Error al cargar la configuración" onRetry={() => refetch()} />
      )}

      {settings && (
        <SettingsForm settings={settings} canEdit={canEdit} />
      )}
    </div>
  )
}
