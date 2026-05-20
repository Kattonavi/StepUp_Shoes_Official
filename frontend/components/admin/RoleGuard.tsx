'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldX } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types'
import LoadingState from '@/components/common/LoadingState'

interface RoleGuardProps {
  allowedRoles: Role[]
  /** Si no tiene el rol, redirigir a esta ruta. Si no se pasa, muestra 403. */
  redirectTo?: string
  children: React.ReactNode
}

export default function RoleGuard({
  allowedRoles,
  redirectTo,
  children,
}: RoleGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  const hasAccess = isAuthenticated && user && allowedRoles.includes(user.role)

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasAccess && redirectTo) {
      router.replace(redirectTo)
    }
  }, [isLoading, isAuthenticated, hasAccess, redirectTo, router])

  if (isLoading) {
    return <LoadingState message="Verificando permisos..." className="py-20" />
  }

  if (!hasAccess) {
    if (redirectTo) return null // El useEffect hace el redirect

    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldX className="w-8 h-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Acceso denegado</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            No tienes permisos para acceder a esta sección.
          </p>
          {user && (
            <p className="text-xs text-muted-foreground mt-2">
              Tu rol actual: <span className="font-medium">{user.role}</span>
            </p>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
