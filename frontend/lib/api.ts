/**
 * Cliente Axios centralizado para el frontend de StepUp.
 * Solo para uso en Client Components (browser). No usar en Server Components.
 * Para Server Components: usar lib/server-api.ts (native fetch).
 *
 * SESIÓN POR COOKIES httpOnly:
 *  - `withCredentials: true` hace que el navegador envíe automáticamente las
 *    cookies de sesión (access_token / refresh_token) en cada request.
 *  - El frontend NO lee ni adjunta tokens: el access token es httpOnly.
 *  - En 401 sobre un endpoint PROTEGIDO, se intenta UNA renovación vía
 *    POST /auth/refresh y se reintenta el request original.
 *
 * RENDIMIENTO CROSS-SITE (frontend y backend en dominios distintos):
 *  - NO forzamos `Content-Type: application/json` como header por defecto.
 *    Axios ya lo añade automáticamente cuando hay body (POST/PUT/PATCH). En los
 *    GET, omitirlo mantiene la petición como "simple request" CORS, evitando un
 *    preflight OPTIONS extra por cada GET (catálogo, categorías, productos…).
 */
import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1'

// ── Main client — con interceptor de refresh ───────────────
// Sin Content-Type por defecto a propósito (ver nota de rendimiento arriba).
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  withCredentials: true, // envía cookies httpOnly de sesión
})

// ── Refresh client — sin interceptors para evitar bucles ────
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
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

/**
 * Endpoints que NO deben disparar un intento de refresh ante un 401:
 *  - Los propios de auth (login/refresh/logout) → evita bucles.
 *  - Públicos del storefront (productos, categorías, promociones, settings,
 *    health, analytics). Un 401 transitorio aquí no significa "sesión expirada"
 *    y no debe entrelazar estas peticiones con la maquinaria de refresh.
 *
 * Solo los endpoints protegidos (admin, /auth/me, cloudinary, etc.) intentan
 * refrescar la sesión.
 */
function shouldSkipRefresh(url: string | undefined): boolean {
  if (!url) return true
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout') ||
    url.includes('/public/') ||
    url.includes('/analytics/events') ||
    url.includes('/health') ||
    // GET públicos del catálogo (listados y detalle por slug). Nota: las rutas
    // admin usan /products/admin u otros verbos, que sí deben refrescar.
    url === '/products' ||
    url.startsWith('/products?') ||
    url.includes('/products/slug/') ||
    url === '/categories' ||
    url.startsWith('/categories?') ||
    url.includes('/categories/slug/') ||
    url.includes('/settings')
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
      shouldSkipRefresh(originalRequest?.url)
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
