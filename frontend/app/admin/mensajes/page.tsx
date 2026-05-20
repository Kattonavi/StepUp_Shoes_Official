import type { Metadata } from 'next'
import { Suspense } from 'react'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import MessagesClient from './MessagesClient'

export const metadata: Metadata = {
  title: 'Mensajes',
  robots: { index: false, follow: false },
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton rows={8} cols={6} />}>
      <MessagesClient />
    </Suspense>
  )
}
