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
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from '@/lib/auth-storage'
import {
  login as loginService,
  logout as logoutService,
  refreshTokens,
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

  // Valida la sesión guardada al iniciar la app
  const validateSession = useCallback(async () => {
    const accessToken = getAccessToken()
    const storedRefresh = getRefreshToken()

    if (!accessToken) {
      setIsLoading(false)
      return
    }

    try {
      const userData = await getMe(accessToken)
      setUser(userData)
      setIsAuthenticated(true)
    } catch {
      // Token expirado — intentar refresh
      if (!storedRefresh) {
        clearTokens()
        setIsLoading(false)
        return
      }

      try {
        const freshTokens = await refreshTokens(storedRefresh)
        setAccessToken(freshTokens.accessToken)
        setRefreshToken(freshTokens.refreshToken)
        const userData = await getMe(freshTokens.accessToken)
        setUser(userData)
        setIsAuthenticated(true)
      } catch {
        clearTokens()
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
    const response = await loginService(credentials)
    setAccessToken(response.accessToken)
    setRefreshToken(response.refreshToken)
    setUser(response.user)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(async () => {
    const storedRefresh = getRefreshToken()
    if (storedRefresh) {
      await logoutService(storedRefresh)
    }
    clearTokens()
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
