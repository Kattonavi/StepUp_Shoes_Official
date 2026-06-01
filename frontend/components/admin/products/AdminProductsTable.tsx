'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  Edit2,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  Package,
  ExternalLink,
  Link2,
  Star,
  Sparkles,
  Boxes,
  MoreVertical,
} from 'lucide-react'
import type { ProductSummary, Role, StockStatus } from '@/types'
import { StockStatusBadge } from './ProductStatusBadge'
import { PRODUCT_PERMISSIONS } from '../common/PermissionGate'
import ConfirmDialog from '../common/ConfirmDialog'
import { formatPrice, cn } from '@/lib/utils'

interface AdminProductsTableProps {
  products: ProductSummary[]
  userRole: Role
  hasActiveFilters?: boolean
  onToggleVisibility: (id: string, visible: boolean) => void
  onChangeStock: (id: string, stockStatus: StockStatus) => void
  onToggleFeatured: (p: ProductSummary) => void
  onToggleNew: (p: ProductSummary) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  isLoading?: boolean
}

const STOCK_LABEL: Record<StockStatus, string> = {
  AVAILABLE: 'Disponible',
  OUT_OF_STOCK: 'Agotado',
  ON_REQUEST: 'Bajo pedido',
}

export default function AdminProductsTable({
  products,
  userRole,
  hasActiveFilters,
  onToggleVisibility,
  onChangeStock,
  onToggleFeatured,
  onToggleNew,
  onDelete,
  onRestore,
  isLoading,
}: AdminProductsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<ProductSummary | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<ProductSummary | null>(null)

  const perms = PRODUCT_PERMISSIONS

  function copyPublicLink(slug: string) {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}/producto/${slug}`
    navigator.clipboard.writeText(url).then(
      () => toast.success('Enlace público copiado'),
      () => toast.error('No se pudo copiar')
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState hasActiveFilters={!!hasActiveFilters} userRole={userRole} />
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* ── Desktop ────────────────────────────────────────── */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Producto</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Categoría</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Precio</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Stock</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Etiquetas</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className={cn(
                  'border-b border-border last:border-0 hover:bg-muted/20 transition-colors',
                  product.status === 'DELETED' && 'opacity-60'
                )}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        {product.mainImageUrl ? (
                          <Image src={product.mainImageUrl} alt={product.name} fill sizes="40px" className="object-cover" />
                        ) : (
                          <Package className="w-5 h-5 absolute inset-0 m-auto text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-muted-foreground">/{product.slug}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {product.categoryName ?? '—'}
                  </td>

                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{formatPrice(product.price)}</p>
                    {product.oldPrice && (
                      <p className="text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</p>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {product.status !== 'DELETED' && perms.canChangeStock(userRole) ? (
                      <select
                        value={product.stockStatus}
                        onChange={(e) => onChangeStock(product.id, e.target.value as StockStatus)}
                        disabled={isLoading}
                        className="bg-background border border-border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                        title="Cambiar stock"
                      >
                        {(['AVAILABLE','OUT_OF_STOCK','ON_REQUEST'] as StockStatus[]).map((s) => (
                          <option key={s} value={s}>{STOCK_LABEL[s]}</option>
                        ))}
                      </select>
                    ) : (
                      <StockStatusBadge status={product.stockStatus} />
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {product.isFeatured && <Tag color="yellow">Destacado</Tag>}
                      {product.isNew && <Tag color="blue">Nuevo</Tag>}
                      {product.isOnSale && <Tag color="red">Rebaja</Tag>}
                      {!product.visible && product.status !== 'DELETED' && (
                        <Tag color="gray">Oculto</Tag>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-0.5">
                      {product.status !== 'DELETED' ? (
                        <>
                          {/* View public */}
                          <a
                            href={`/producto/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Abrir en tienda pública"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* Copy link */}
                          <button
                            type="button"
                            onClick={() => copyPublicLink(product.slug)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Copiar enlace público"
                          >
                            <Link2 className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          {perms.canEdit(userRole) && (
                            <Link
                              href={`/admin/productos/${product.id}/editar`}
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          )}

                          {/* More menu (featured / new / visibility / delete) */}
                          {perms.canEdit(userRole) && (
                            <ProductActionsMenu
                              disabled={isLoading}
                              canChangeVisibility={perms.canChangeVisibility(userRole)}
                              canDelete={perms.canDelete(userRole)}
                              product={product}
                              onToggleFeatured={() => onToggleFeatured(product)}
                              onToggleNew={() => onToggleNew(product)}
                              onToggleVisibility={() =>
                                onToggleVisibility(product.id, !product.visible)
                              }
                              onDelete={() => setDeleteTarget(product)}
                            />
                          )}
                        </>
                      ) : (
                        perms.canRestore(userRole) && (
                          <button
                            onClick={() => setRestoreTarget(product)}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-green-400 px-3 py-1.5 border border-border rounded-lg transition-colors"
                            title="Restaurar"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Restaurar
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile cards ───────────────────────────────────── */}
        <div className="lg:hidden divide-y divide-border">
          {products.map((product) => (
            <div key={product.id} className={cn('p-4', product.status === 'DELETED' && 'opacity-60')}>
              <div className="flex items-start gap-3">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                  {product.mainImageUrl ? (
                    <Image src={product.mainImageUrl} alt={product.name} fill sizes="56px" className="object-cover" />
                  ) : (
                    <Package className="w-7 h-7 absolute inset-0 m-auto text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.categoryName ?? '—'}</p>
                  <p className="text-sm font-semibold mt-1">{formatPrice(product.price)}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <StockStatusBadge status={product.stockStatus} />
                    {product.isFeatured && <Tag color="yellow">Destacado</Tag>}
                    {product.isNew && <Tag color="blue">Nuevo</Tag>}
                    {product.isOnSale && <Tag color="red">Rebaja</Tag>}
                  </div>
                </div>
              </div>

              {product.status !== 'DELETED' ? (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {perms.canEdit(userRole) && (
                    <Link
                      href={`/admin/productos/${product.id}/editar`}
                      className="flex items-center justify-center gap-1 text-xs font-medium border border-border rounded-lg py-2 hover:bg-muted transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar
                    </Link>
                  )}
                  <a
                    href={`/producto/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-xs font-medium border border-border rounded-lg py-2 hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ver
                  </a>
                  <button
                    type="button"
                    onClick={() => copyPublicLink(product.slug)}
                    className="flex items-center justify-center gap-1 text-xs font-medium border border-border rounded-lg py-2 hover:bg-muted transition-colors"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Copiar
                  </button>
                  {perms.canChangeStock(userRole) && (
                    <select
                      value={product.stockStatus}
                      onChange={(e) => onChangeStock(product.id, e.target.value as StockStatus)}
                      disabled={isLoading}
                      className="col-span-3 bg-background border border-border rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="AVAILABLE">📦 Disponible</option>
                      <option value="OUT_OF_STOCK">⛔ Agotado</option>
                      <option value="ON_REQUEST">🛒 Bajo pedido</option>
                    </select>
                  )}
                  {perms.canDelete(userRole) && (
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="col-span-3 flex items-center justify-center gap-1 text-xs font-medium text-destructive border border-destructive/30 rounded-lg py-2 hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  )}
                </div>
              ) : (
                perms.canRestore(userRole) && (
                  <button
                    onClick={() => setRestoreTarget(product)}
                    className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs font-medium border border-border rounded-lg py-2 hover:bg-muted transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restaurar
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar producto"
        message={`¿Eliminar "${deleteTarget?.name}"? El producto quedará como borrado y podrás restaurarlo después.`}
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

      <ConfirmDialog
        open={!!restoreTarget}
        title="Restaurar producto"
        message={`¿Restaurar "${restoreTarget?.name}"? Quedará en estado Borrador y deberás activarlo manualmente.`}
        confirmLabel="Restaurar"
        variant="default"
        onConfirm={() => {
          if (restoreTarget) {
            onRestore(restoreTarget.id)
            setRestoreTarget(null)
          }
        }}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function EmptyState({
  hasActiveFilters,
  userRole,
}: {
  hasActiveFilters: boolean
  userRole: Role
}) {
  const canCreate = PRODUCT_PERMISSIONS.canCreate(userRole)

  if (hasActiveFilters) {
    return (
      <div className="bg-card border border-dashed border-border rounded-xl py-16 px-4 text-center">
        <Boxes className="w-10 h-10 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-sm font-medium text-muted-foreground">
          No encontramos productos con esos filtros
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm mx-auto">
          Prueba limpiando la búsqueda o cambiando la categoría.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-dashed border-border rounded-xl py-16 px-4 text-center">
      <Package className="w-10 h-10 mx-auto text-muted-foreground/30 mb-4" />
      <p className="text-sm font-medium text-muted-foreground">
        Aún no tienes productos registrados
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm mx-auto">
        Crea el primero para empezar a mostrar tu catálogo.
      </p>
      {canCreate && (
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 mt-4 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Crear primer producto
        </Link>
      )}
    </div>
  )
}

function Tag({
  children,
  color,
}: {
  children: React.ReactNode
  color: 'yellow' | 'blue' | 'red' | 'gray'
}) {
  const classes: Record<typeof color, string> = {
    yellow: 'bg-yellow-500/15 text-yellow-400',
    blue: 'bg-blue-500/15 text-blue-400',
    red: 'bg-red-500/15 text-red-400',
    gray: 'bg-muted text-muted-foreground',
  }
  return (
    <span className={cn('inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded', classes[color])}>
      {children}
    </span>
  )
}

/**
 * Menú "más acciones" renderizado en un PORTAL a document.body con
 * position: fixed anclado al botón. Así escapa del contenedor de la tabla
 * (que tiene overflow-x-auto + overflow-hidden) y nunca se recorta ni genera
 * scroll interno. El botón nativo de stock funcionaba porque su popup vive en
 * el top layer del navegador; este menú custom necesita el portal para lograr
 * lo mismo.
 */
function ProductActionsMenu({
  product,
  disabled,
  canChangeVisibility,
  canDelete,
  onToggleFeatured,
  onToggleNew,
  onToggleVisibility,
  onDelete,
}: {
  product: ProductSummary
  disabled?: boolean
  canChangeVisibility: boolean
  canDelete: boolean
  onToggleFeatured: () => void
  onToggleNew: () => void
  onToggleVisibility: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const MENU_WIDTH = 224 // w-56
  const ESTIMATED_HEIGHT = 220
  const GAP = 4

  // Calcula la posición fixed alineando el borde derecho del menú con el del
  // botón, y voltea hacia arriba si no hay espacio abajo.
  function positionMenu() {
    const r = btnRef.current?.getBoundingClientRect()
    if (!r) return
    const left = Math.max(8, r.right - MENU_WIDTH)
    const spaceBelow = window.innerHeight - r.bottom
    const top =
      spaceBelow < ESTIMATED_HEIGHT + GAP
        ? r.top - ESTIMATED_HEIGHT - GAP // flip up
        : r.bottom + GAP
    setCoords({ top: Math.max(8, top), left })
  }

  useLayoutEffect(() => {
    if (open) positionMenu()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Cierra y reposiciona ante scroll/resize (las coords fixed quedan obsoletas).
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  function run(action: () => void) {
    action()
    setOpen(false)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Más acciones"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            {/* Overlay para cerrar al hacer click fuera */}
            <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
            <div
              ref={menuRef}
              role="menu"
              style={{ position: 'fixed', top: coords.top, left: coords.left, width: MENU_WIDTH }}
              className="bg-card border border-border rounded-xl shadow-2xl py-1 z-[100]"
            >
              <MenuItem
                icon={<Star className={cn('w-4 h-4', product.isFeatured && 'fill-current text-yellow-400')} />}
                onClick={() => run(onToggleFeatured)}
              >
                {product.isFeatured ? 'Quitar destacado' : 'Marcar destacado'}
              </MenuItem>
              <MenuItem
                icon={<Sparkles className={cn('w-4 h-4', product.isNew && 'text-blue-400')} />}
                onClick={() => run(onToggleNew)}
              >
                {product.isNew ? 'Quitar "Nuevo"' : 'Marcar como Nuevo'}
              </MenuItem>
              {canChangeVisibility && (
                <MenuItem
                  icon={product.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  onClick={() => run(onToggleVisibility)}
                >
                  {product.visible ? 'Ocultar del catálogo' : 'Hacer visible'}
                </MenuItem>
              )}
              {canDelete && (
                <>
                  <div className="my-1 border-t border-border" />
                  <MenuItem
                    icon={<Trash2 className="w-4 h-4 text-destructive" />}
                    danger
                    onClick={() => run(onDelete)}
                  >
                    Eliminar producto
                  </MenuItem>
                </>
              )}
            </div>
          </>,
          document.body
        )}
    </>
  )
}

function MenuItem({
  icon,
  children,
  onClick,
  danger,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left',
        danger ? 'text-destructive hover:bg-destructive/10' : 'text-foreground'
      )}
    >
      {icon}
      {children}
    </button>
  )
}
