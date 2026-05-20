import type { Metadata } from 'next'
import { Suspense } from 'react'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import AnalyticsClient from './AnalyticsClient'

export const metadata: Metadata = {
  title: 'Analytics',
  robots: { index: false, follow: false },
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton rows={6} cols={3} />}>
      <AnalyticsClient />
    </Suspense>
  )
}
