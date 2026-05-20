'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { ChartDataPoint } from '@/types'

const ROLE_COLORS: Record<string, string> = {
  'Owner':  '#8b5cf6',
  'Admin':  '#6366f1',
  'Editor': '#3b82f6',
  'Viewer': '#64748b',
}

interface Props {
  data: ChartDataPoint[]
}

export default function UsersByRoleChart({ data }: Props) {
  if (data.every(d => d.value === 0)) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Sin usuarios registrados.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: 12,
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
          cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {data.map((entry) => (
            <Cell key={entry.label} fill={ROLE_COLORS[entry.label] ?? '#6366f1'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
