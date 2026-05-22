'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tag,
  Users,
  Settings,
  ShieldAlert,
  MessageSquare,
  BarChart2,
  Megaphone,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUnreadMessageCount } from '@/hooks/admin/useUnreadMessageCount'
import type { Role } from '@/types'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  roles: Role[]
  badge?: string
  unreadBadge?: boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'EDITOR', 'VIEWER'],
  },
  {
    href: '/admin/productos',
    label: 'Productos',
    icon: Package,
    roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'EDITOR'],
  },
  {
    href: '/admin/categorias',
    label: 'Categorías',
    icon: Tag,
    roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'],
  },
  {
    href: '/admin/promociones',
    label: 'Promociones',
    icon: Megaphone,
    roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'],
  },
  {
    href: '/admin/mensajes',
    label: 'Mensajes',
    icon: MessageSquare,
    roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'EDITOR', 'VIEWER'],
    unreadBadge: true,
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart2,
    roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'EDITOR', 'VIEWER'],
  },
  {
    href: '/admin/usuarios',
    label: 'Usuarios',
    icon: Users,
    roles: ['SUPER_ADMIN', 'OWNER'],
  },
  {
    href: '/admin/configuracion',
    label: 'Configuración',
    icon: Settings,
    roles: ['SUPER_ADMIN', 'OWNER'],
  },
]

const CONTROL_CENTER_ITEM: NavItem = {
  href: '/admin/control-center',
  label: 'Control Center',
  icon: ShieldAlert,
  roles: ['SUPER_ADMIN'],
  badge: 'SA',
}

interface AdminSidebarProps {
  onNavClick?: () => void
}

export default function AdminSidebar({ onNavClick }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { data: unreadData } = useUnreadMessageCount()
  const unreadCount = unreadData?.count ?? 0

  if (!user) return null

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role)
  )
  const showControlCenter = user.role === 'SUPER_ADMIN'

  return (
    <nav className="flex flex-col gap-0.5 p-2">
      {visibleItems.map((item) => (
        <SidebarLink
          key={item.href}
          item={item}
          isActive={
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
          }
          onClick={onNavClick}
          unreadCount={item.unreadBadge ? unreadCount : 0}
        />
      ))}

      {showControlCenter && (
        <>
          <div className="my-3 border-t border-border" />
          <SidebarLink
            item={CONTROL_CENTER_ITEM}
            isActive={pathname.startsWith(CONTROL_CENTER_ITEM.href)}
            onClick={onNavClick}
          />
        </>
      )}
    </nav>
  )
}

function SidebarLink({
  item,
  isActive,
  onClick,
  unreadCount = 0,
}: {
  item: NavItem
  isActive: boolean
  onClick?: () => void
  unreadCount?: number
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
        isActive
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      <Icon
        className={cn(
          'w-4 h-4 shrink-0',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )}
      />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="text-[10px] font-bold bg-destructive/15 text-destructive px-1.5 py-0.5 rounded">
          {item.badge}
        </span>
      )}
      {unreadCount > 0 && (
        <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}

export function AdminSidebarHeader() {
  return (
    <div className="px-4 py-4 border-b border-border">
      <Link
        href="/admin"
        className="flex items-center gap-2 font-bold text-base hover:text-primary transition-colors"
      >
        <Zap className="w-5 h-5 text-primary" />
        StepUp
        <span className="text-xs font-normal text-muted-foreground ml-1">
          Admin
        </span>
      </Link>
    </div>
  )
}
