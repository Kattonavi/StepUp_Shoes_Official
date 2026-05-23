import axios from 'axios'
import type { ApiResponse } from '@/types'

/** Extrae un mensaje legible de cualquier tipo de error */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const apiData = err.response?.data as ApiResponse<unknown> | undefined
    const status = err.response?.status

    // Prefer backend message when it exists, but special-case the statuses
    // where we want a guaranteed user-friendly fallback even if the backend
    // didn't return a body.
    if (status === 429) {
      return (
        apiData?.message ??
        'Has realizado muchas solicitudes. Intenta nuevamente en unos minutos.'
      )
    }

    if (apiData?.message) return apiData.message

    if (status === 401) return 'Sesión expirada. Vuelve a iniciar sesión.'
    if (status === 403) return 'No tienes permisos para esta acción.'
    if (status === 404) return 'El recurso no fue encontrado.'
    if (status === 409) return 'Conflicto: el elemento ya existe o está en uso.'
    if (status === 422) return 'Datos inválidos. Revisa el formulario.'
    if (!err.response) return 'Sin conexión al servidor. Verifica tu red.'
  }

  if (err instanceof Error) return err.message
  return 'Error inesperado. Intenta nuevamente.'
}

/** True if the error is an HTTP 429 (rate-limited). */
export function isRateLimitError(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 429
}
