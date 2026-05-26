'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  Edit2,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Sparkles,
  PauseCircle,
  PlayCircle,
  Search,
  X,
} from 'lucide-react'
import type { Promotion, Role } from '@/types'
import ConfirmDialog from '../common/ConfirmDialog'
import { cn } from '@/lib/utils'

interface AdminPromotionsTableProps {
  promotions: Promotion[]
  userRole: Role
  onToggleActive: (id: string, active: boolean) => void
  onToggleVisibility: (id: string, visible: boolean) => void
  onEdit: (promotion: Promotion) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

type FilterKey =
  | 'all'
  | 'visible'
  | 'hidden'
  | 'active'
  | 'inactive'
  | 'live'
  | 'expired'
  | 'scheduled'

type SortKey =
  | 'newest'
  | 'oldest'
  | 'priorityAsc'
  | 'priorityDesc'
  | 'titleAsc'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'Todas' },
  { key: 'visible',   label: 'Visibles en home' },
  { key: 'hidden',    label: 'Ocultas' },
  { key: 'active',    label: 'Activas' },
  { key: 'inactive',  label: 'Inactivas' },
  { key: 'live',      label: 'Vigentes' },
  { key: 'scheduled', label: 'Programadas' },
  { key: 'expired',   label: 'Vencidas' },
]

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest',       label: 'Más recientes' },
  { key: 'oldest',       label: 'Más antiguas' },
  { key: 'priorityAsc',  label: 'Prioridad: mayor' },   // position 0 = top
  { key: 'priorityDesc', label: 'Prioridad: menor' },
  { key: 'titleAsc',     label: 'Título A–Z' },
]

type Vigencia = 'none' | 'live' | 'scheduled' | 'expired'

function vigenciaOf(p: Promotion): Vigencia {
  const now = Date.now()
  const s = p.startsAt ? new Date(p.startsAt).getTime() : null
  const e = p.endsAt   ? new Date(p.endsAt).getTime()   : null
  if (s === null && e === null) return 'none'
  if (s !== null && now < s) return 'scheduled'
  if (e !== null && now > e) return 'expired'
  return 'live'
}

export default function AdminPromotionsTable({
  promotions,
  userRole,
  onToggleActive,
  onToggleVisibility,
  onEdit,
  onDelete,
  isLoading,
}: AdminPromotionsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sort, setSort] = useState<SortKey>('newest')

  const canEdit = ['SUPER_ADMIN', 'OWNER', 'ADMIN'].includes(userRole)
  const canDelete = ['SUPER_ADMIN', 'OWNER'].includes(userRole)

  // ─── Derived list ──────────────────────────────────────────────────────
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = promotions

    if (q) {
      list = list.filter((p) =>
        [p.title, p.subtitle, p.badgeText, p.linkLabel]
          .filter((s): s is string => !!s)
          .some((s) => s.toLowerCase().includes(q))
      )
    }

    switch (filter) {
      case 'visible':   list = list.filter((p) => p.visible); break
      case 'hidden':    list = list.filter((p) => !p.visible); break
      case 'active':    list = list.filter((p) => p.active); break
      case 'inactive':  list = list.filter((p) => !p.active); break
      case 'live':      list = list.filter((p) => vigenciaOf(p) === 'live' || vigenciaOf(p) === 'none'); break
      case 'scheduled': list = list.filter((p) => vigenciaOf(p) === 'scheduled'); break
      case 'expired':   list = list.filter((p) => vigenciaOf(p) === 'expired'); break
      default:          break
    }

    const sorted = [...list]
    sorted.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'priorityAsc':
          return a.position - b.position
        case 'priorityDesc':
          return b.position - a.position
        case 'titleAsc':
          return a.title.localeCompare(b.title, 'es')
        default:
          return 0
      }
    })
    return sorted
  }, [promotions, search, filter, sort])

  const counts = useMemo(() => {
    const c = {
      total: promotions.length,
      visible: promotions.filter((p) => p.visible).length,
      hidden: promotions.filter((p) => !p.visible).length,
      live: promotions.filter((p) => p.active && p.visible && (vigenciaOf(p) === 'live' || vigenciaOf(p) === 'none')).length,
    }
    return c
  }, [promotions])

  const hasActiveFilters = search.trim() !== '' || filter !== 'all' || sort !== 'newest'

  return (
    <div className="space-y-4">
      {/* ─── Stats strip ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill label="Total" value={counts.total} />
        <StatPill label="Visibles" value={counts.visible} tint="primary" />
        <StatPill label="Ocultas" value={counts.hidden} tint="muted" />
        <StatPill label="En home" value={counts.live} tint="green" />
      </div>

      {/* ─── Toolbar ─── */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, subtítulo o badge…"
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setFilter('all')
                setSort('newest')
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-full transition-colors border',
                filter === f.key
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── List ─── */}
      {visible.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl py-14 text-center text-sm text-muted-foreground">
          No encontramos promociones con esos filtros.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((promo) => {
            const vig = vigenciaOf(promo)
            const showsInHome =
              promo.active &&
              promo.visible &&
              (vig === 'live' || vig === 'none')
            return (
              <div
                key={promo.id}
                className={cn(
                  'bg-card border rounded-xl p-4 flex items-start gap-4 transition-colors',
                  showsInHome ? 'border-border' : 'border-border/60',
                  !promo.active && 'opacity-70'
                )}
              >
                {/* Image thumbnail */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                  {promo.imageUrl ? (
                    <Image
                      src={promo.imageUrl}
                      alt={promo.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 absolute inset-0 m-auto text-muted-foreground/40" />
                  )}
                  {promo.cloudinaryPublicId && (
                    <span className="absolute bottom-1 left-1 text-[8px] font-bold uppercase tracking-wider bg-primary/85 text-primary-foreground px-1 py-0.5 rounded">
                      CD
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{promo.title}</p>
                        {promo.badgeText && (
                          <span className="text-[10px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded">
                            {promo.badgeText}
                          </span>
                        )}
                      </div>
                      {promo.subtitle && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {promo.subtitle}
                        </p>
                      )}

                      {/* Status badges row */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <StateBadge
                          on={promo.visible}
                          onLabel="Visible en home"
                          offLabel="Oculta"
                          icon={promo.visible ? Eye : EyeOff}
                        />
                        <StateBadge
                          on={promo.active}
                          onLabel="Activa"
                          offLabel="Inactiva"
                          icon={promo.active ? PlayCircle : PauseCircle}
                          tint={promo.active ? 'green' : 'muted'}
                        />
                        <VigenciaBadge vig={vig} />
                        <span className="text-[10px] text-muted-foreground">
                          Prioridad: {promo.position}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                        {promo.startsAt && (
                          <span>Desde: {new Date(promo.startsAt).toLocaleDateString('es-CO')}</span>
                        )}
                        {promo.endsAt && (
                          <span>Hasta: {new Date(promo.endsAt).toLocaleDateString('es-CO')}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {promo.linkUrl && (
                        <a
                          href={promo.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Abrir enlace"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {canEdit && (
                        <>
                          <button
                            onClick={() => onToggleVisibility(promo.id, !promo.visible)}
                            disabled={isLoading}
                            className={cn(
                              'p-2 rounded-lg transition-colors',
                              promo.visible
                                ? 'text-primary hover:bg-primary/10'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                            title={promo.visible ? 'Ocultar del home' : 'Mostrar en home'}
                          >
                            {promo.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => onToggleActive(promo.id, !promo.active)}
                            disabled={isLoading}
                            className={cn(
                              'p-2 rounded-lg transition-colors',
                              promo.active
                                ? 'text-green-500 hover:bg-green-500/10'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                            title={promo.active ? 'Desactivar campaña' : 'Activar campaña'}
                          >
                            {promo.active ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => onEdit(promo)}
                            disabled={isLoading}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeleteTarget(promo)}
                          disabled={isLoading}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar promoción"
        message={`¿Eliminar la promoción "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) {
            onDelete(deleteTarget.id)
            setDeleteTarget(null)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

// ─── Bits ─────────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  tint = 'default',
}: {
  label: string
  value: number
  tint?: 'default' | 'primary' | 'muted' | 'green'
}) {
  const tintClass =
    tint === 'primary'
      ? 'border-primary/30 bg-primary/5'
      : tint === 'green'
      ? 'border-green-500/30 bg-green-500/5'
      : tint === 'muted'
      ? 'border-border bg-muted/30'
      : 'border-border bg-card'
  return (
    <div className={cn('rounded-xl border px-4 py-3', tintClass)}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-2xl font-black mt-1 leading-none">{value}</p>
    </div>
  )
}

function StateBadge({
  on,
  onLabel,
  offLabel,
  icon: Icon,
  tint = 'primary',
}: {
  on: boolean
  onLabel: string
  offLabel: string
  icon: React.ElementType
  tint?: 'primary' | 'green' | 'muted'
}) {
  const onStyles =
    tint === 'green'
      ? 'bg-green-500/15 text-green-400 border-green-500/30'
      : 'bg-primary/15 text-primary border-primary/30'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border',
        on ? onStyles : 'bg-muted text-muted-foreground border-border'
      )}
    >
      <Icon className="w-3 h-3" />
      {on ? onLabel : offLabel}
    </span>
  )
}

function VigenciaBadge({ vig }: { vig: Vigencia }) {
  const map: Record<Vigencia, { label: string; cls: string }> = {
    none:      { label: 'Sin fechas', cls: 'bg-muted text-muted-foreground border-border' },
    live:      { label: 'Vigente',    cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
    scheduled: { label: 'Programada', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    expired:   { label: 'Vencida',    cls: 'bg-destructive/15 text-destructive border-destructive/30' },
  }
  const { label, cls } = map[vig]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border',
        cls
      )}
    >
      <Sparkles className="w-3 h-3" />
      {label}
    </span>
  )
}
