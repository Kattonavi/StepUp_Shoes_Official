/**
 * Servicio de autenticación (sesión por cookies httpOnly).
 *
 * Usa un cliente Axios propio (sin interceptors) con `withCredentials: true`
 * para que el navegador envíe/reciba las cookies de sesión, y para evitar
 * bucles de refresh en las propias llamadas de auth.
 *
 * Ningún token se lee ni se guarda en el cliente: el backend gestiona la
 * sesión vía Set-Cookie. Estas funciones devuelven el `user`.
 */
import axios from 'axios'
import type { ApiResponse, AuthUser, LoginRequest, LoginResponse } from '@/types'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1'

const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
  withCredentials: true,
})

/**
 * Inicia sesión. El backend setea las cookies httpOnly; devolvemos solo el user.
 * (El body aún incluye tokens por compatibilidad, pero el frontend los ignora.)
 */
export async function login(credentials: LoginRequest): Promise<AuthUser> {
  const { data } = await authClient.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    credentials
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Error de autenticación')
  }
  return data.data.user
}

/**
 * Renueva la sesión. El refresh token viaja en cookie httpOnly, sin body.
 * El backend rota las cookies. Devuelve el user actualizado.
 */
export async function refreshSession(): Promise<AuthUser> {
  const { data } = await authClient.post<ApiResponse<LoginResponse>>(
    '/auth/refresh'
  )
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Sesión expirada')
  }
  return data.data.user
}

/** Cierra sesión: el backend revoca el refresh token y limpia las cookies. */
export async function logout(): Promise<void> {
  try {
    await authClient.post('/auth/logout')
  } catch {
    // Logout local aunque falle en backend.
  }
}

/** Valida la sesión actual usando la cookie access_token (vía withCredentials). */
export async function getMe(): Promise<AuthUser> {
  const { data } = await authClient.get<ApiResponse<AuthUser>>('/auth/me')
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'No autenticado')
  }
  return data.data
}
