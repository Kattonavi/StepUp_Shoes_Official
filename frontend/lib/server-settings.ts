import { serverGet } from '@/lib/server-api'
import type { PublicStoreSettings } from '@/types'

/**
 * Server-side fetch — safe to call from Server Components. Returns null on error.
 *
 * Sin caché: los cambios guardados en /admin/configuracion (hero, WhatsApp,
 * etc.) deben reflejarse casi de inmediato en el home al navegar/refrescar.
 * Es un singleton barato; no afecta el rendimiento general.
 */
export async function getPublicSettingsServer(): Promise<PublicStoreSettings | null> {
  return serverGet<PublicStoreSettings>('/settings', undefined, { noCache: true })
}
