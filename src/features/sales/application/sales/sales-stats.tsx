'use client'

import { TrendingUp, ShoppingCart, CreditCard } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/format'
import type { SalesStats } from '@/features/sales/domain/sales.types'

interface SalesStatsProps {
  stats: SalesStats | undefined
  isLoading: boolean
}

export function SalesStatsComponent({ stats, isLoading }: SalesStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      label: 'Total Ventas',
      value: formatCurrency(stats.total_sales),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Cantidad',
      value: stats.sales_count.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Ticket Promedio',
      value: formatCurrency(stats.average_ticket),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Método Principal',
      value: getPaymentMethodLabel(stats.most_used_payment_method),
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </span>
                <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-lg font-bold text-foreground">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function getPaymentMethodLabel(method: 'CASH' | 'CARD' | 'TRANSFER'): string {
  const labels = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
  }
  return labels[method]
}
