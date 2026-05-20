/**
 * Cliente Axios centralizado para el frontend de StepUp.
 * Solo para uso en Client Components (browser). No usar en Server Components.
 * Para Server Components: usar lib/server-api.ts (native fetch).
 */
import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from './auth-storage'
import type { ApiResponse, LoginResponse } from '@/types'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1'

// ── Main client — con interceptors de auth ──────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// ── Refresh client — sin interceptors para evitar bucles ────
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// ── Cola de peticiones fallidas mientras se refresca el token ──
type FailedRequestCallback = (newToken: string | null) => void

let isRefreshing = false
let failedQueue: FailedRequestCallback[] = []

function processQueue(newToken: string | null) {
  failedQueue.forEach((cb) => cb(newToken))
  failedQueue = []
}

// ── Request interceptor — adjunta Authorization si hay token ──
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// ── Response interceptor — manejo de 401 con refresh automático ──
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Solo intentamos refresh en 401 y una sola vez por request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    const storedRefreshToken = getRefreshToken()

    if (!storedRefreshToken) {
      clearTokens()
      dispatchLogoutEvent()
      return Promise.reject(error)
    }

    // Si ya hay un refresh en curso, encolar esta petición
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push((newToken) => {
          if (!newToken) {
            reject(error)
            return
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          resolve(api(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await refreshClient.post<ApiResponse<LoginResponse>>(
        '/auth/refresh',
        { refreshToken: storedRefreshToken }
      )

      if (!data.success || !data.data) {
        throw new Error('Refresh response inválido')
      }

      const newAccessToken = data.data.accessToken
      setAccessToken(newAccessToken)
      setRefreshToken(data.data.refreshToken)

      // Actualizar header por defecto y procesar cola
      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
      processQueue(newAccessToken)

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      clearTokens()
      processQueue(null)
      dispatchLogoutEvent()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

function dispatchLogoutEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:session-expired'))
  }
}

export default api
