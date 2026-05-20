/**
 * Utilidades para almacenar tokens en localStorage.
 *
 * NOTA DE SEGURIDAD:
 * Los tokens se guardan en localStorage por compatibilidad con el backend
 * actual que devuelve tokens en JSON. Riesgos: vulnerable a XSS.
 * Mejora futura (Fase 6+): migrar a cookies httpOnly si el backend
 * implementa Set-Cookie con tokens.
 */

const ACCESS_TOKEN_KEY = 'stepup_access_token'
const REFRESH_TOKEN_KEY = 'stepup_refresh_token'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  if (!isBrowser()) return
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string): void {
  if (!isBrowser()) return
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function clearTokens(): void {
  if (!isBrowser()) return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function hasTokens(): boolean {
  return !!getAccessToken()
}
