import apiClient from '@/lib/api'
import type { ApiResponse, PublicStoreSettings, StoreSettings, UpdateStoreSettingsRequest } from '@/types'

/** Client-side: fetch public settings (no auth needed) */
export async function getPublicSettings(): Promise<PublicStoreSettings> {
  const res = await apiClient.get<ApiResponse<PublicStoreSettings>>('/settings')
  return res.data.data!
}

/** Client-side: fetch full admin settings */
export async function getAdminSettings(): Promise<StoreSettings> {
  const res = await apiClient.get<ApiResponse<StoreSettings>>('/settings/admin')
  return res.data.data!
}

/** Client-side: update settings (OWNER+) */
export async function updateSettings(payload: UpdateStoreSettingsRequest): Promise<StoreSettings> {
  const res = await apiClient.put<ApiResponse<StoreSettings>>('/settings', payload)
  return res.data.data!
}
