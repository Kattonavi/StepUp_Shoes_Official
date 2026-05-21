'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Edit2,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  Package,
  ExternalLink,
} from 'lucide-react'
import type { ProductSummary, Role } from '@/types'
import { StockStatusBadge } from './ProductStatusBadge'
import { PRODUCT_PERMISSIONS } from '../common/PermissionGate'
import ConfirmDialog from '../common/ConfirmDialog'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AdminProductsTableProps {
  products: ProductSummary[]
  userRole: Role
  onToggleVisibility: (id: string, visible: boolean) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  isLoading?: boolean
}

export default function AdminProductsTable({
  products,
  userRole,
  onToggleVisibility,
  onDelete,
  onRestore,
  isLoading,
}: AdminProductsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<ProductSummary | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<ProductSummary | null>(null)
  const [search, setSearch] = useState('')

  const perms = PRODUCT_PERMISSIONS
  const filtered = search
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.referenceCode?.includes(search) ||
          (p.categoryName?.toLowerCase().includes(search.toLowerCase()))
      )
    : products

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, referencia o categoría..."
          className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Producto</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Referencia</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Categoría</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Precio</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Stock</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                    {search ? 'No se encontraron productos con ese criterio.' : 'No hay productos.'}
                  </td>
                </tr>
              )}
              {filtered.map((product) => (
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
                        <p className="text-xs text-muted-foreground">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-muted-foreground">{product.referenceCode ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {product.categoryName ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{formatPrice(product.price)}</p>
                      {product.oldPrice && (
                        <p className="text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StockStatusBadge status={product.stockStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {product.status !== 'DELETED' ? (
                        <>
                          <a
                            href={`/producto/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Ver en tienda"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {perms.canEdit(userRole) && (
                            <Link
                              href={`/admin/productos/${product.id}/editar`}
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          )}

                          {perms.canChangeVisibility(userRole) && (
                            <button
                              onClick={() => onToggleVisibility(product.id, !product.visible)}
                              disabled={isLoading}
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title={product.visible ? 'Ocultar' : 'Mostrar'}
                            >
                              {product.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}

                          {perms.canDelete(userRole) && (
                            <button
                              onClick={() => setDeleteTarget(product)}
                              disabled={isLoading}
                              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        perms.canRestore(userRole) && (
                          <button
                            onClick={() => setRestoreTarget(product)}
                            disabled={isLoading}
                            className="p-2 rounded-lg text-muted-foreground hover:text-green-400 hover:bg-green-500/10 transition-colors"
                            title="Restaurar"
                          >
                            <RotateCcw className="w-4 h-4" />
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

        {/* Mobile cards */}
        <div className="lg:hidden divide-y divide-border">
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              {search ? 'Sin resultados.' : 'No hay productos.'}
            </div>
          )}
          {filtered.map((product) => (
            <div key={product.id} className={cn('p-4', product.status === 'DELETED' && 'opacity-60')}>
              <div className="flex items-start gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                  {product.mainImageUrl ? (
                    <Image src={product.mainImageUrl} alt={product.name} fill sizes="48px" className="object-cover" />
                  ) : (
                    <Package className="w-6 h-6 absolute inset-0 m-auto text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{product.referenceCode ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{product.categoryName ?? '—'}</p>
                  <p className="text-sm font-semibold mt-1">{formatPrice(product.price)}</p>
                  <div className="mt-2">
                    <StockStatusBadge status={product.stockStatus} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {product.status !== 'DELETED' && perms.canEdit(userRole) && (
                  <Link
                    href={`/admin/productos/${product.id}/editar`}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-border rounded-lg py-2 hover:bg-muted transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </Link>
                )}
                {product.status === 'DELETED' && perms.canRestore(userRole) && (
                  <button
                    onClick={() => setRestoreTarget(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-border rounded-lg py-2 hover:bg-muted transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restaurar
                  </button>
                )}
              </div>
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
