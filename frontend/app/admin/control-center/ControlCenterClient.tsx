'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ShieldAlert, ClipboardList, Camera, Trash2, RotateCcw } from 'lucide-react'
import AdminPageHeader from '@/components/admin/common/AdminPageHeader'
import AuditLogsTable from '@/components/admin/control-center/AuditLogsTable'
import SnapshotsTable from '@/components/admin/control-center/SnapshotsTable'
import DeletedItemsTable from '@/components/admin/control-center/DeletedItemsTable'
import RestoreActionsTable from '@/components/admin/control-center/RestoreActionsTable'
import RoleGuard from '@/components/admin/RoleGuard'
import { cn } from '@/lib/utils'

type TabKey = 'audit-logs' | 'snapshots' | 'deleted-items' | 'restore-actions'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'audit-logs',      label: 'Audit Logs',  icon: ClipboardList },
  { key: 'snapshots',       label: 'Snapshots',   icon: Camera },
  { key: 'deleted-items',   label: 'Eliminados',  icon: Trash2 },
  { key: 'restore-actions', label: 'Restauraciones', icon: RotateCcw },
]

function ControlCenterContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeTab = (searchParams.get('tab') as TabKey) ?? 'audit-logs'

  function setTab(tab: TabKey) {
    router.replace(`${pathname}?tab=${tab}`, { scroll: false })
  }

  return (
    <div>
      <AdminPageHeader
        title="Control Center"
        description="Módulo exclusivo de auditoría, snapshots y restauración para SUPER_ADMIN."
      />

      {/* SUPER_ADMIN badge */}
      <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-destructive/5 border border-destructive/20 rounded-xl">
        <ShieldAlert className="w-5 h-5 text-destructive shrink-0" />
        <p className="text-sm text-muted-foreground">
          Todo acceso y acción en este módulo queda registrado en el log de auditoría.
          Procede con cautela.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'audit-logs' && <AuditLogsTable />}
      {activeTab === 'snapshots' && <SnapshotsTable />}
      {activeTab === 'deleted-items' && <DeletedItemsTable />}
      {activeTab === 'restore-actions' && <RestoreActionsTable />}
    </div>
  )
}

export default function ControlCenterClient() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']} redirectTo="/admin">
      <ControlCenterContent />
    </RoleGuard>
  )
}
