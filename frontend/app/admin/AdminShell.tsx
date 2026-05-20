'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import AdminSidebar, { AdminSidebarHeader } from '@/components/admin/AdminSidebar'
import AdminTopbar from '@/components/admin/AdminTopbar'

interface AdminShellProps {
  children: React.ReactNode
}

export default function AdminShell({ children }: AdminShellProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Mientras valida la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Sin sesión — el useEffect ya redirige
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen flex flex-col">
      {/* Topbar */}
      <AdminTopbar
        showMenuButton={true}
        onMenuToggle={() => setSidebarOpen((v) => !v)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar desktop (fijo) ─────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 bg-card border-r border-border overflow-y-auto">
          <AdminSidebarHeader />
          <AdminSidebar />
        </aside>

        {/* ── Sidebar mobile (overlay) ───────────────────────────── */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-card border-r border-border overflow-y-auto lg:hidden">
              <AdminSidebarHeader />
              <AdminSidebar onNavClick={() => setSidebarOpen(false)} />
            </aside>
          </>
        )}

        {/* ── Contenido principal ────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
