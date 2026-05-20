'use client'

import Link from 'next/link'
import { Plus, Tag, Users, ShieldAlert, ExternalLink } from 'lucide-react'
import type { Role } from '@/types'

interface Action {
  label: string
  href: string
  icon: React.ElementType
  description: string
  variant?: 'default' | 'danger'
}

function getActions(role: Role): Action[] {
  const actions: Action[] = []

  if (role === 'SUPER_ADMIN' || role === 'OWNER' || role === 'ADMIN' || role === 'EDITOR') {
    actions.push({
      label: 'Nuevo producto',
      href: '/admin/productos/nuevo',
      icon: Plus,
      description: 'Agregar producto al catálogo',
    })
  }

  if (role === 'SUPER_ADMIN' || role === 'OWNER' || role === 'ADMIN') {
    actions.push({
      label: 'Nueva categoría',
      href: '/admin/categorias/nueva',
      icon: Tag,
      description: 'Crear categoría de productos',
    })
  }

  if (role === 'SUPER_ADMIN' || role === 'OWNER') {
    actions.push({
      label: 'Crear usuario',
      href: '/admin/usuarios/nuevo',
      icon: Users,
      description: 'Agregar miembro al equipo',
    })
  }

  if (role === 'SUPER_ADMIN') {
    actions.push({
      label: 'Control Center',
      href: '/admin/control-center',
      icon: ShieldAlert,
      description: 'Auditoría y restauraciones',
      variant: 'danger',
    })
  }

  actions.push({
    label: 'Ver catálogo',
    href: '/catalogo',
    icon: ExternalLink,
    description: 'Tienda pública',
  })

  return actions
}

interface Props {
  role: Role
}

export default function QuickActions({ role }: Props) {
  const actions = getActions(role)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        const isDanger = action.variant === 'danger'
        return (
          <Link
            key={action.href}
            href={action.href}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-colors group ${
              isDanger
                ? 'border-destructive/30 bg-destructive/5 hover:bg-destructive/10'
                : 'border-border bg-card hover:bg-muted/30'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isDanger ? 'bg-destructive/15' : 'bg-primary/10'
            }`}>
              <Icon className={`w-4 h-4 ${isDanger ? 'text-destructive' : 'text-primary'}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-medium ${isDanger ? 'text-destructive' : 'text-foreground'}`}>
                {action.label}
              </p>
              <p className="text-xs text-muted-foreground truncate">{action.description}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
