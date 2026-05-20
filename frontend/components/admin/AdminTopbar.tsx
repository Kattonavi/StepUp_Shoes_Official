'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, ChevronDown, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  OWNER: 'Propietario',
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  VIEWER: 'Visor',
}

interface AdminTopbarProps {
  onMenuToggle?: () => void
  showMenuButton?: boolean
}

export default function AdminTopbar({
  onMenuToggle,
  showMenuButton,
}: AdminTopbarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setMenuOpen(false)
    try {
      await logout()
      router.replace('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
      {/* Left — mobile menu toggle */}
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <span className="text-sm text-muted-foreground lg:hidden font-medium">
          Panel Admin
        </span>
      </div>

      {/* Right — user menu */}
      {user && (
        <div className="relative ml-auto">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
            aria-label="Menú de usuario"
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-tight">{user.fullName}</p>
              <p className="text-xs text-muted-foreground leading-tight">
                {ROLE_LABELS[user.role] ?? user.role}
              </p>
            </div>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-muted-foreground transition-transform',
                menuOpen && 'rotate-180'
              )}
            />
          </button>

          {menuOpen && (
            <>
              {/* Click-away */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-xl shadow-black/30 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold truncate">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold bg-primary/15 text-primary px-2 py-0.5 rounded">
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </div>
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  )
}
