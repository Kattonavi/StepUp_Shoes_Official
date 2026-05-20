import { serverGet } from '@/lib/server-api'
import type { PublicStoreSettings } from '@/types'

/** Server-side fetch — safe to call from Server Components. Returns null on error. */
export async function getPublicSettingsServer(): Promise<PublicStoreSettings | null> {
  return serverGet<PublicStoreSettings>('/settings', undefined, { revalidate: 60 })
}
