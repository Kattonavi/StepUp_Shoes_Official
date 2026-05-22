import axios from 'axios'
import type { ApiResponse } from '@/types'

/** Extrae un mensaje legible de cualquier tipo de error */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const apiData = err.response?.data as ApiResponse<unknown> | undefined
    if (apiData?.message) return apiData.message

    const status = err.response?.status
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
