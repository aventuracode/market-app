'use client'

import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { SummaryStatCard, type SummaryStatTone } from './summary-stat-card'

export type CashSummary = {
  opening_amount: number
  total_sales: number
  total_income: number
  total_expenses: number
}

type CashSummaryGridProps = {
  summary: CashSummary
}

type StatDefinition = {
  key: string
  label: string
  value: number
  icon: typeof Wallet
  tone: SummaryStatTone
}

/**
 * CashSummaryGrid — presentación pura.
 *
 * Responsabilidad única: mapear el resumen de caja a una grilla de
 * SummaryStatCard. La lista de métricas es un dato (array), no
 * estructura repetida en JSX: agregar/quitar una métrica es agregar
 * o quitar una entrada, sin tocar el resto del componente (OCP).
 */
export function CashSummaryGrid({ summary }: CashSummaryGridProps) {
  const stats: StatDefinition[] = [
    {
      key: 'opening',
      label: 'Apertura',
      value: summary.opening_amount,
      icon: Wallet,
      tone: 'neutral',
    },
    {
      key: 'sales',
      label: 'Ventas',
      value: summary.total_sales,
      icon: TrendingUp,
      tone: 'positive',
    },
    {
      key: 'income',
      label: 'Ingresos',
      value: summary.total_income,
      icon: TrendingUp,
      tone: 'positive',
    },
    {
      key: 'expenses',
      label: 'Egresos',
      value: summary.total_expenses,
      icon: TrendingDown,
      tone: 'negative',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {stats.map((stat) => (
        <SummaryStatCard
          key={stat.key}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          tone={stat.tone}
        />
      ))}
    </div>
  )
}
