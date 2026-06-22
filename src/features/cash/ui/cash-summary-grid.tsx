'use client'

import { TrendingDown, TrendingUp, Wallet, CreditCard, ArrowRightLeft } from 'lucide-react'
import { SummaryStatCard, type SummaryStatTone } from './summary-stat-card'
import type { CashSummary } from '../domain/cash'

type CashSummaryGridProps = {
  summary: CashSummary
}

type StatDefinition = {
  key: string
  label: string
  value: number
  icon: typeof Wallet
  tone: SummaryStatTone
  colorClass?: string
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
      key: 'cash-sales',
      label: 'Ventas Efectivo',
      value: summary.total_sales,
      icon: TrendingUp,
      tone: 'positive',
      colorClass: 'text-green-600',
    },
    {
      key: 'card-sales',
      label: 'Ventas Tarjeta',
      value: summary.total_card_sales,
      icon: CreditCard,
      tone: 'neutral',
      colorClass: 'text-blue-600',
    },
    {
      key: 'transfer-sales',
      label: 'Ventas Transferencia',
      value: summary.total_transfer_sales,
      icon: ArrowRightLeft,
      tone: 'neutral',
      colorClass: 'text-purple-600',
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
          colorClass={stat.colorClass}
        />
      ))}
    </div>
  )
}
