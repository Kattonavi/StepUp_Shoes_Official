/**
 * Cliente Axios centralizado para el frontend de StepUp.
 * Solo para uso en Client Components (browser). No usar en Server Components.
 * Para Server Components: usar lib/server-api.ts (native fetch).
 *
 * SESIÓN POR COOKIES httpOnly:
 *  - `withCredentials: true` hace que el navegador envíe automáticamente las
 *    cookies de sesión (access_token / refresh_token) en cada request.
 *  - El frontend NO lee ni adjunta tokens: no hay Authorization Bearer desde
 *    localStorage. El access token es httpOnly e invisible para JS.
 *  - En 401, se intenta UNA renovación vía POST /auth/refresh (que rota cookies)
 *    y se reintenta el request original.
 */
import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1'

// ── Main client — con interceptor de refresh ───────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
  withCredentials: true, // envía cookies httpOnly de sesión
})

// ── Refresh client — sin interceptors para evitar bucles ────
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
  withCredentials: true,
})

// ── Cola de peticiones fallidas mientras se refresca la sesión ──
type FailedRequestCallback = (refreshed: boolean) => void

let isRefreshing = false
let failedQueue: FailedRequestCallback[] = []

function processQueue(refreshed: boolean) {
  failedQueue.forEach((cb) => cb(refreshed))
  failedQueue = []
}

/** No intentamos refrescar cuando el endpoint que falló ES de auth. */
function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  )
}

// ── Response interceptor — 401 → refresh por cookie → retry ──
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      isAuthEndpoint(originalRequest?.url)
    ) {
      return Promise.reject(error)
    }

    // Si ya hay un refresh en curso, encolar este request hasta que termine.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push((refreshed) => {
          if (refreshed) {
            resolve(api(originalRequest))
          } else {
            reject(error)
          }
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // El refresh token viaja en cookie httpOnly; no enviamos body.
      await refreshClient.post('/auth/refresh')
      processQueue(true)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(false)
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
