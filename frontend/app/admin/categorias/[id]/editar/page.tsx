import type { Metadata } from 'next'
import EditarCategoriaClient from './EditarCategoriaClient'

export const metadata: Metadata = { title: 'Editar categoría' }

export default function EditarCategoriaPage() {
  return <EditarCategoriaClient />
}
