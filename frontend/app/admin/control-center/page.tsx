import type { Metadata } from 'next'
import { Suspense } from 'react'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import ControlCenterClient from './ControlCenterClient'

export const metadata: Metadata = {
  title: 'Control Center',
  robots: { index: false, follow: false },
}

export default function ControlCenterPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton rows={8} cols={5} />}>
      <ControlCenterClient />
    </Suspense>
  )
}
