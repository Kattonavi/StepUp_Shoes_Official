import type { Metadata } from 'next'
import EditarProductoClient from './EditarProductoClient'

export const metadata: Metadata = { title: 'Editar producto' }

export default function EditarProductoPage() {
  return <EditarProductoClient />
}
