'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { ChartDataPoint } from '@/types'

const COLORS = ['#22c55e', '#ef4444', '#f59e0b']

interface Props {
  data: ChartDataPoint[]
}

export default function ProductsByStockChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Sin datos de stock disponibles.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={48}
          outerRadius={72}
          dataKey="value"
          nameKey="label"
          paddingAngle={3}
        >
          {data.map((entry, i) => (
            <Cell key={entry.label} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: 12,
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
