'use client'

import { DollarSign, ShoppingCart, TrendingUp, CreditCard, Banknote, ArrowRightLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { SalesStats } from '@/types/sales'

interface SalesStatsCardsProps {
  stats: SalesStats | undefined
  isLoading: boolean
}

export function SalesStatsCards({ stats, isLoading }: SalesStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      {/* Total Ventas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Total Ventas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.salesCount} {stats.salesCount === 1 ? 'venta' : 'ventas'}
          </p>
        </CardContent>
      </Card>

      {/* Ticket Promedio */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Ticket Promedio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.averageTicket)}</div>
          <p className="text-xs text-muted-foreground mt-1">Por venta</p>
        </CardContent>
      </Card>

      {/* Efectivo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Banknote className="w-4 h-4" />
            Efectivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalCash)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round((stats.totalCash / stats.totalSales) * 100) || 0}% del total
          </p>
        </CardContent>
      </Card>

      {/* Tarjeta */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Tarjeta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalCard)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round((stats.totalCard / stats.totalSales) * 100) || 0}% del total
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
