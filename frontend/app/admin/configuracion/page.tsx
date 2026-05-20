import type { Metadata } from 'next'
import { Suspense } from 'react'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import SettingsClient from './SettingsClient'

export const metadata: Metadata = {
  title: 'Configuración',
  robots: { index: false, follow: false },
}

export default function AdminConfiguracionPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton rows={10} cols={2} />}>
      <SettingsClient />
    </Suspense>
  )
}
