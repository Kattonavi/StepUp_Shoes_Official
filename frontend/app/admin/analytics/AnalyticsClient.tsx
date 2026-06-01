'use client'

import { useState } from 'react'
import {
  Eye,
  MessageCircle,
  Percent,
  Tag,
  Megaphone,
  Package,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import {
  useStorefrontSummary,
  useTopProducts,
  useTopCategories,
  useRecentEvents,
  useProductPerformance,
} from '@/hooks/admin/useStorefrontAnalytics'
import AdminPageHeader from '@/components/admin/common/AdminPageHeader'
import DashboardMetricCard from '@/components/admin/dashboard/DashboardMetricCard'
import ErrorState from '@/components/common/ErrorState'
import type { AnalyticsRange } from '@/types'
import { formatPct, EVENT_LABELS, fmtDateTime } from './analytics-format'

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: 'month', label: 'Este mes' },
  { value: 'all', label: 'Todo' },
]

export default function AnalyticsClient() {
  const [range, setRange] = useState<AnalyticsRange>('30d')

  const summary = useStorefrontSummary(range)
  const topByViews = useTopProducts(range, 'views')
  const topByWhatsapp = useTopProducts(range, 'whatsapp')
  const topCategories = useTopCategories(range)
  const recent = useRecentEvents(range)
  const performance = useProductPerformance(range)

  const s = summary.data

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Analytics"
        description="Mide qué productos generan más interés y qué acciones llevan a consultas por WhatsApp."
      />

      {/* Range filter */}
      <div className="flex flex-wrap gap-1.5">
        {RANGES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRange(r.value)}
            className={
              'text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ' +
              (range === r.value
                ? 'bg-primary/15 text-primary border-primary/30'
                : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted')
            }
          >
            {r.label}
          </button>
        ))}
      </div>

      {summary.error && (
        <ErrorState title="Error al cargar analytics" onRetry={() => summary.refetch()} />
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardMetricCard
          label="Visitas a productos"
          value={s?.totalProductViews ?? 0}
          icon={Eye}
        />
        <DashboardMetricCard
          label="Clicks WhatsApp"
          value={s?.totalWhatsappClicks ?? 0}
          icon={MessageCircle}
          highlight="success"
        />
        <DashboardMetricCard
          label="Tasa de consulta"
          value={formatPct(s?.conversionRateApprox)}
          icon={Percent}
          description="WhatsApp / visitas"
        />
        <DashboardMetricCard
          label="Promociones clickeadas"
          value={s?.totalPromotionClicks ?? 0}
          icon={Megaphone}
        />
        <DashboardMetricCard
          label="Categoría con más interés"
          value={s?.mostViewedCategoryName ?? '—'}
          icon={Tag}
        />
      </div>

      {/* Top products tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Productos que más llaman la atención" icon={Eye}>
          <ProductTable
            rows={topByViews.data ?? []}
            metric="views"
            loading={topByViews.isLoading}
            emptyLabel="Aún no hay visitas registradas."
          />
        </Panel>
        <Panel title="Consultas generadas por WhatsApp" icon={MessageCircle}>
          <ProductTable
            rows={topByWhatsapp.data ?? []}
            metric="whatsapp"
            loading={topByWhatsapp.isLoading}
            emptyLabel="Aún no hay consultas por WhatsApp."
          />
        </Panel>
      </div>

      {/* Top categories + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Categorías con más interés" icon={Tag}>
          {(topCategories.data?.length ?? 0) === 0 ? (
            <EmptyRow label="Sin interés por categoría aún." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left font-medium pb-2">Categoría</th>
                  <th className="text-right font-medium pb-2">Vistas</th>
                  <th className="text-right font-medium pb-2">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {topCategories.data!.map((c, i) => (
                  <tr key={c.categoryId ?? i} className="border-t border-border/60">
                    <td className="py-2 font-medium">{c.categoryName ?? '—'}</td>
                    <td className="py-2 text-right tabular-nums">{c.views}</td>
                    <td className="py-2 text-right tabular-nums text-emerald-400">
                      {c.whatsappClicks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel title="Últimas interacciones" icon={Megaphone}>
          {(recent.data?.length ?? 0) === 0 ? (
            <EmptyRow label="Sin actividad registrada aún." />
          ) : (
            <ul className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {recent.data!.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide bg-muted text-muted-foreground px-1.5 py-0.5 rounded shrink-0">
                    {EVENT_LABELS[e.eventType] ?? e.eventType}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground">
                      {e.productName ?? e.promotionTitle ?? e.categoryName ?? '—'}
                      {e.selectedSize ? ` · talla ${e.selectedSize}` : ''}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {fmtDateTime(e.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Published without interest */}
      <Panel title="Productos publicados sin interacción" icon={AlertCircle}>
        <PublishedWithoutInterest
          rows={(performance.data ?? []).filter((p) => p.views === 0)}
          loading={performance.isLoading}
        />
      </Panel>
    </div>
  )
}

// ─── Bits ──────────────────────────────────────────────────────────────────

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof Eye
  children: React.ReactNode
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        {title}
      </h3>
      {children}
    </div>
  )
}

function EmptyRow({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground py-6 text-center">{label}</p>
}

function ProductTable({
  rows,
  metric,
  loading,
  emptyLabel,
}: {
  rows: import('@/types').StorefrontTopProduct[]
  metric: 'views' | 'whatsapp'
  loading: boolean
  emptyLabel: string
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 bg-muted/40 rounded animate-pulse" />
        ))}
      </div>
    )
  }
  if (rows.length === 0) return <EmptyRow label={emptyLabel} />

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-muted-foreground uppercase tracking-wide">
          <th className="text-left font-medium pb-2">Producto</th>
          <th className="text-right font-medium pb-2">Vistas</th>
          <th className="text-right font-medium pb-2">WhatsApp</th>
          <th className="text-right font-medium pb-2">Tasa</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((p, i) => (
          <tr key={p.productId ?? i} className="border-t border-border/60">
            <td className="py-2 font-medium max-w-0">
              {p.productSlug ? (
                <Link
                  href={`/producto/${p.productSlug}`}
                  target="_blank"
                  className="truncate block hover:text-primary transition-colors"
                >
                  {p.productName ?? p.productSlug}
                </Link>
              ) : (
                <span className="truncate block">{p.productName ?? '—'}</span>
              )}
            </td>
            <td
              className={
                'py-2 text-right tabular-nums ' +
                (metric === 'views' ? 'font-semibold text-foreground' : 'text-muted-foreground')
              }
            >
              {p.views}
            </td>
            <td
              className={
                'py-2 text-right tabular-nums ' +
                (metric === 'whatsapp' ? 'font-semibold text-emerald-400' : 'text-muted-foreground')
              }
            >
              {p.whatsappClicks}
            </td>
            <td className="py-2 text-right tabular-nums text-muted-foreground">
              {formatPct(p.conversionRate)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PublishedWithoutInterest({
  rows,
  loading,
}: {
  rows: import('@/types').StorefrontProductPerformance[]
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 bg-muted/40 rounded animate-pulse" />
        ))}
      </div>
    )
  }
  if (rows.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-400 py-4">
        <Package className="w-4 h-4" />
        Todos los productos publicados tuvieron al menos una visita. 👏
      </div>
    )
  }
  return (
    <div className="flex flex-wrap gap-2">
      {rows.map((p) => (
        <Link
          key={p.productId}
          href={`/admin/productos`}
          className="inline-flex items-center gap-1.5 text-xs bg-yellow-500/10 text-yellow-300 border border-yellow-500/25 px-3 py-1.5 rounded-full hover:bg-yellow-500/15 transition-colors"
        >
          <AlertCircle className="w-3 h-3" />
          {p.productName}
        </Link>
      ))}
    </div>
  )
}
