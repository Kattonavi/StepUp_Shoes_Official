'use client'

import Link from 'next/link'
import type { RecentProductItem } from '@/types'

const STATUS_CLASSES: Record<string, string> = {
  ACTIVE:  'bg-emerald-500/15 text-emerald-400',
  DRAFT:   'bg-yellow-500/15 text-yellow-400',
  HIDDEN:  'bg-muted text-muted-foreground',
  DELETED: 'bg-destructive/15 text-destructive',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:  'Activo',
  DRAFT:   'Borrador',
  HIDDEN:  'Oculto',
  DELETED: 'Eliminado',
}

const STOCK_CLASSES: Record<string, string> = {
  AVAILABLE:    'text-emerald-400',
  OUT_OF_STOCK: 'text-destructive',
  ON_REQUEST:   'text-yellow-400',
}

const STOCK_LABELS: Record<string, string> = {
  AVAILABLE:    'Disponible',
  OUT_OF_STOCK: 'Sin stock',
  ON_REQUEST:   'Bajo pedido',
}

interface Props {
  products: RecentProductItem[]
}

export default function RecentProductsTable({ products }: Props) {
  if (products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Sin productos recientes.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {['Producto', 'Estado', 'Stock', 'Precio'].map((h) => (
              <th
                key={h}
                className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 pr-4"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-muted/20 transition-colors">
              <td className="py-2.5 pr-4">
                <Link
                  href={`/admin/productos/${p.id}/editar`}
                  className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                >
                  {p.name}
                </Link>
              </td>
              <td className="py-2.5 pr-4">
                <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CLASSES[p.status] ?? ''}`}>
                  {STATUS_LABELS[p.status] ?? p.status}
                </span>
              </td>
              <td className="py-2.5 pr-4">
                <span className={`text-xs font-medium ${STOCK_CLASSES[p.stockStatus] ?? ''}`}>
                  {STOCK_LABELS[p.stockStatus] ?? p.stockStatus}
                </span>
              </td>
              <td className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">
                ${p.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
