'use client'

import {
  Package,
  Tag,
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
  Eye,
  Star,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardSummary } from '@/hooks/admin/useDashboardSummary'
import DashboardMetricCard from '@/components/admin/dashboard/DashboardMetricCard'
import DashboardChartCard from '@/components/admin/dashboard/DashboardChartCard'
import ProductsByStatusChart from '@/components/admin/dashboard/ProductsByStatusChart'
import ProductsByStockChart from '@/components/admin/dashboard/ProductsByStockChart'
import UsersByRoleChart from '@/components/admin/dashboard/UsersByRoleChart'
import ActivityChart from '@/components/admin/dashboard/ActivityChart'
import ActivityTimeline from '@/components/admin/dashboard/ActivityTimeline'
import RecentProductsTable from '@/components/admin/dashboard/RecentProductsTable'
import QuickActions from '@/components/admin/dashboard/QuickActions'
import DashboardSkeleton from '@/components/admin/dashboard/DashboardSkeleton'
import DashboardErrorState from '@/components/admin/dashboard/DashboardErrorState'

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  OWNER:       'Propietario',
  ADMIN:       'Administrador',
  EDITOR:      'Editor',
  VIEWER:      'Visor',
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, error, refetch } = useDashboardSummary()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {user && (
          <p className="text-muted-foreground mt-1">
            Bienvenido,{' '}
            <span className="text-foreground font-medium">{user.fullName}</span>
            {' '}—{' '}
            <span className="text-primary font-medium">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </p>
        )}
      </div>

      {isLoading && <DashboardSkeleton />}

      {error && (
        <DashboardErrorState onRetry={() => refetch()} />
      )}

      {data && (
        <>
          {/* === Metric cards — products === */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Productos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardMetricCard
                label="Total productos"
                value={data.products.total}
                icon={Package}
                description={`${data.products.deleted} eliminados`}
              />
              <DashboardMetricCard
                label="Activos"
                value={data.products.active}
                icon={TrendingUp}
                highlight="success"
              />
              <DashboardMetricCard
                label="Sin stock"
                value={data.products.outOfStock}
                icon={AlertTriangle}
                highlight={data.products.outOfStock > 0 ? 'danger' : 'default'}
                description="OUT_OF_STOCK"
              />
              <DashboardMetricCard
                label="Destacados"
                value={data.products.featured}
                icon={Star}
                highlight="warning"
              />
            </div>
          </section>

          {/* === Metric cards — operations === */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Operaciones
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardMetricCard
                label="Categorías activas"
                value={data.categories.active}
                icon={Tag}
                description={`${data.categories.total} total`}
              />
              <DashboardMetricCard
                label="Usuarios activos"
                value={data.users.active}
                icon={Users}
                description={`${data.users.total} total`}
              />
              <DashboardMetricCard
                label="No visibles"
                value={data.products.notVisible}
                icon={Eye}
                highlight={data.products.notVisible > 0 ? 'warning' : 'default'}
                description="visible=false"
              />
              <DashboardMetricCard
                label="Bajo pedido"
                value={data.products.onRequest}
                icon={Activity}
              />
            </div>
          </section>

          {/* === Charts === */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Gráficas
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <DashboardChartCard
                title="Productos por estado"
                description="Distribución actual del catálogo"
              >
                <ProductsByStatusChart data={data.productsByStatus} />
              </DashboardChartCard>

              <DashboardChartCard
                title="Productos por stock"
                description="Estado de inventario"
              >
                <ProductsByStockChart data={data.productsByStockStatus} />
              </DashboardChartCard>

              <DashboardChartCard
                title="Usuarios por rol"
                description="Distribución del equipo"
              >
                <UsersByRoleChart data={data.usersByRole} />
              </DashboardChartCard>
            </div>
          </section>

          {/* === Activity chart === */}
          <DashboardChartCard
            title="Actividad — últimos 7 días"
            description="Eventos de auditoría registrados por día"
          >
            <ActivityChart data={data.auditLogsLast7Days} />
          </DashboardChartCard>

          {/* === Recent activity + products === */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4">Actividad reciente</h3>
                <ActivityTimeline
                  logs={data.activity.recentLogs}
                  showControlCenterLink={user?.role === 'SUPER_ADMIN'}
                />
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">Productos recientes</h3>
                  <a
                    href="/admin/productos"
                    className="text-xs text-primary hover:underline"
                  >
                    Ver todos →
                  </a>
                </div>
                <RecentProductsTable products={data.activity.recentProducts} />
              </div>
            </div>
          </section>

          {/* === Alerts === */}
          {(data.products.outOfStock > 0 || data.products.draft > 0 || data.users.blocked > 0) && (
            <section className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-yellow-400 mb-2">
                Alertas operativas
              </h3>
              {data.products.outOfStock > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span className="text-muted-foreground">
                    <span className="text-yellow-400 font-medium">{data.products.outOfStock}</span>
                    {' '}producto{data.products.outOfStock > 1 ? 's' : ''} sin stock
                  </span>
                </div>
              )}
              {data.products.draft > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span className="text-muted-foreground">
                    <span className="text-yellow-400 font-medium">{data.products.draft}</span>
                    {' '}producto{data.products.draft > 1 ? 's' : ''} en borrador (no visibles en tienda)
                  </span>
                </div>
              )}
              {data.users.blocked > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span className="text-muted-foreground">
                    <span className="text-yellow-400 font-medium">{data.users.blocked}</span>
                    {' '}usuario{data.users.blocked > 1 ? 's' : ''} bloqueado{data.users.blocked > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </section>
          )}

          {/* === Quick actions === */}
          {user && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Acciones rápidas
              </h2>
              <QuickActions role={user.role} />
            </section>
          )}
        </>
      )}
    </div>
  )
}
