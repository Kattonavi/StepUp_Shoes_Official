'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { AuthUser, LoginRequest, Role } from '@/types'
import { clearLegacyAuthStorage } from '@/lib/auth-storage'
import {
  login as loginService,
  logout as logoutService,
  refreshSession,
  getMe,
} from '@/services/auth.service'

// Roles con acceso al panel admin
const ADMIN_ROLES: Role[] = ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'EDITOR', 'VIEWER']

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  hasRole: (roles: Role[]) => boolean
  canAccessAdmin: () => boolean
  canAccessControlCenter: () => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Valida la sesión al iniciar la app usando la cookie access_token.
  const validateSession = useCallback(async () => {
    // Migración: limpia tokens legacy de localStorage de versiones anteriores.
    clearLegacyAuthStorage()

    try {
      const userData = await getMe()
      setUser(userData)
      setIsAuthenticated(true)
    } catch {
      // Access token ausente/expirado — intentar renovar con el refresh cookie.
      try {
        await refreshSession()
        const userData = await getMe()
        setUser(userData)
        setIsAuthenticated(true)
      } catch {
        setUser(null)
        setIsAuthenticated(false)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    validateSession()
  }, [validateSession])

  // Escucha eventos de sesión expirada desde el interceptor de Axios
  useEffect(() => {
    const handleExpired = () => {
      setUser(null)
      setIsAuthenticated(false)
    }
    window.addEventListener('auth:session-expired', handleExpired)
    return () => window.removeEventListener('auth:session-expired', handleExpired)
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    // El backend setea las cookies httpOnly; solo guardamos el user en memoria.
    const loggedUser = await loginService(credentials)
    setUser(loggedUser)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(async () => {
    // El backend revoca el refresh token y limpia las cookies.
    await logoutService()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const hasRole = useCallback(
    (roles: Role[]) => {
      if (!user) return false
      return roles.includes(user.role)
    },
    [user]
  )

  const canAccessAdmin = useCallback(() => {
    if (!user) return false
    return ADMIN_ROLES.includes(user.role)
  }, [user])

  const canAccessControlCenter = useCallback(
    () => user?.role === 'SUPER_ADMIN',
    [user]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        hasRole,
        canAccessAdmin,
        canAccessControlCenter,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
