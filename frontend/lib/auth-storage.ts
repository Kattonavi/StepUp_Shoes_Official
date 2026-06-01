/**
 * Sesión por cookies httpOnly.
 *
 * Los tokens JWT YA NO se guardan en localStorage (eran vulnerables a XSS).
 * El access_token y refresh_token viven en cookies httpOnly que el navegador
 * envía automáticamente con `withCredentials: true`. JS no puede leerlos.
 *
 * Este módulo solo conserva una utilidad de migración: limpiar tokens viejos
 * que pudieran haber quedado en localStorage de sesiones anteriores.
 */

const LEGACY_ACCESS_TOKEN_KEY = 'stepup_access_token'
const LEGACY_REFRESH_TOKEN_KEY = 'stepup_refresh_token'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Elimina cualquier token JWT legacy guardado en localStorage por versiones
 * anteriores de la app. Idempotente y seguro de llamar siempre al arrancar.
 */
export function clearLegacyAuthStorage(): void {
  if (!isBrowser()) return
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY)
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY)
}
