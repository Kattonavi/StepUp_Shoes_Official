/**
 * Servicio de autenticación.
 * Usa un cliente Axios propio (sin interceptors) para evitar
 * bucles infinitos de refresh en las llamadas de auth.
 */
import axios from 'axios'
import type { ApiResponse, AuthUser, LoginRequest, LoginResponse } from '@/types'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1'

const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await authClient.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    credentials
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error de autenticación')
  }
  return data.data
}

export async function refreshTokens(
  refreshToken: string
): Promise<LoginResponse> {
  const { data } = await authClient.post<ApiResponse<LoginResponse>>(
    '/auth/refresh',
    { refreshToken }
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Sesión expirada')
  }
  return data.data
}

export async function logout(refreshToken: string): Promise<void> {
  try {
    await authClient.post('/auth/logout', { refreshToken })
  } catch {
    // Logout local aunque falle en backend
  }
}

export async function getMe(accessToken: string): Promise<AuthUser> {
  const { data } = await authClient.get<ApiResponse<AuthUser>>('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'No autenticado')
  }
  return data.data
}
