'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

const TYPE_COLORS: Record<string, string> = {
  PRODUCT_VIEW:         '#6366f1',
  CATEGORY_VIEW:        '#8b5cf6',
  CATALOG_VIEW:         '#a78bfa',
  SEARCH:               '#3b82f6',
  FILTER_APPLIED:       '#60a5fa',
  WHATSAPP_CLICK:       '#22c55e',
  CONTACT_FORM_SUBMIT:  '#f59e0b',
  HOME_VIEW:            '#64748b',
  CTA_CLICK:            '#ec4899',
}

const TYPE_LABELS: Record<string, string> = {
  PRODUCT_VIEW:         'Producto',
  CATEGORY_VIEW:        'Categoría',
  CATALOG_VIEW:         'Catálogo',
  SEARCH:               'Búsqueda',
  FILTER_APPLIED:       'Filtro',
  WHATSAPP_CLICK:       'WhatsApp',
  CONTACT_FORM_SUBMIT:  'Contacto',
  HOME_VIEW:            'Inicio',
  CTA_CLICK:            'CTA',
}

interface Props {
  data: Record<string, number>
}

export default function EventsByTypeChart({ data }: Props) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    label: TYPE_LABELS[key] ?? key,
    key,
    value,
  }))

  if (chartData.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Sin eventos registrados.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }}
          cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={TYPE_COLORS[entry.key] ?? '#6366f1'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
