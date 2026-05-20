import type { Metadata } from 'next'
import EditarUsuarioClient from './EditarUsuarioClient'

export const metadata: Metadata = { title: 'Editar usuario' }

export default function EditarUsuarioPage() {
  return <EditarUsuarioClient />
}
