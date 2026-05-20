'use client'

import { Activity, MousePointer, Search, MessageCircle, Package, Globe } from 'lucide-react'
import { useAnalyticsSummary } from '@/hooks/admin/useAnalyticsSummary'
import AdminPageHeader from '@/components/admin/common/AdminPageHeader'
import AdminTableSkeleton from '@/components/admin/common/AdminTableSkeleton'
import ErrorState from '@/components/common/ErrorState'
import DashboardMetricCard from '@/components/admin/dashboard/DashboardMetricCard'
import DashboardChartCard from '@/components/admin/dashboard/DashboardChartCard'
import ActivityChart from '@/components/admin/dashboard/ActivityChart'
import EventsByTypeChart from '@/components/admin/analytics/EventsByTypeChart'
import TopItemsTable from '@/components/admin/analytics/TopItemsTable'

export default function AnalyticsClient() {
  const { data, isLoading, error, refetch } = useAnalyticsSummary()

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Analytics"
        description="Eventos registrados en la tienda pública (usuarios anónimos)."
      />

      {isLoading && <AdminTableSkeleton rows={6} cols={3} />}
      {error && <ErrorState title="Error al cargar analytics" onRetry={() => refetch()} />}

      {data && (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashboardMetricCard label="Total eventos" value={data.totalEvents} icon={Activity} />
            <DashboardMetricCard label="Hoy" value={data.eventsToday} icon={Globe} highlight="success" />
            <DashboardMetricCard label="Últimos 7 días" value={data.eventsLast7Days} icon={Activity} />
            <DashboardMetricCard label="Vistas de producto" value={data.productViews} icon={Package} />
            <DashboardMetricCard label="WhatsApp clicks" value={data.whatsappClicks} icon={MessageCircle} highlight="success" />
            <DashboardMetricCard label="Búsquedas" value={data.searches} icon={Search} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DashboardChartCard title="Actividad — últimos 7 días" description="Eventos totales por día">
              <ActivityChart data={data.eventsLast7DaysChart} />
            </DashboardChartCard>
            <DashboardChartCard title="Eventos por tipo">
              <EventsByTypeChart data={data.eventsByType} />
            </DashboardChartCard>
          </div>

          {/* Top tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Top productos
              </h3>
              <TopItemsTable items={data.topProducts} emptyLabel="Sin vistas de producto aún." />
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Top categorías
              </h3>
              <TopItemsTable items={data.topCategories} emptyLabel="Sin vistas de categoría aún." />
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" /> Top búsquedas
              </h3>
              <TopItemsTable items={data.topSearches} emptyLabel="Sin búsquedas registradas aún." showName={false} />
            </div>
          </div>

          {/* Contact + catalog stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DashboardMetricCard
              label="Envíos de contacto"
              value={data.contactSubmits}
              icon={MousePointer}
              description="CONTACT_FORM_SUBMIT"
            />
            <DashboardMetricCard
              label="Vistas de catálogo"
              value={data.catalogViews}
              icon={Activity}
            />
          </div>
        </>
      )}
    </div>
  )
}
