'use client'

import type { MessageFilters, MessageSource, MessageStatus } from '@/types'

const STATUSES: { value: MessageStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'UNREAD', label: 'No leídos' },
  { value: 'READ', label: 'Leídos' },
  { value: 'ARCHIVED', label: 'Archivados' },
]

const SOURCES: { value: MessageSource | ''; label: string }[] = [
  { value: '', label: 'Todas las fuentes' },
  { value: 'CONTACT_FORM', label: 'Formulario' },
  { value: 'PRODUCT_INQUIRY', label: 'Producto' },
  { value: 'WHATSAPP_CTA', label: 'WhatsApp' },
]

interface Props {
  filters: MessageFilters
  onChange: (filters: MessageFilters) => void
}

export default function MessageFiltersBar({ filters, onChange }: Props) {
  function set<K extends keyof MessageFilters>(key: K, value: MessageFilters[K]) {
    onChange({ ...filters, [key]: value, page: 0 })
  }

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="search"
        placeholder="Buscar por nombre, email, asunto..."
        value={filters.search ?? ''}
        onChange={(e) => set('search', e.target.value || undefined)}
        className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[220px]"
      />

      <select
        value={filters.status ?? ''}
        onChange={(e) => set('status', (e.target.value as MessageStatus) || undefined)}
        className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <select
        value={filters.source ?? ''}
        onChange={(e) => set('source', (e.target.value as MessageSource) || undefined)}
        className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {SOURCES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  )
}
