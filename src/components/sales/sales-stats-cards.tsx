'use client'

import { ShoppingCart, TrendingUp, CreditCard, Banknote, ArrowRightLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { SalesStats } from '@/types/sales'
import { formatCurrency } from '@/lib/utils/currency'

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

  const totalTransfer = stats.totalSales - stats.totalCash - stats.totalCard

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* Total Ventas */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-xs font-medium text-muted-foreground/80 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            Total Ventas
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-2xl font-bold tracking-tight">{formatCurrency(stats.totalSales)}</div>
          <p className="text-[11px] text-muted-foreground/70 mt-1.5">
            {stats.salesCount} {stats.salesCount === 1 ? 'venta' : 'ventas'}
          </p>
        </CardContent>
      </Card>

      {/* Transferencia */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border-l-2 border-l-purple-500/20">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-xs font-medium text-muted-foreground/80 flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
            Transferencia
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-2xl font-bold tracking-tight">{formatCurrency(totalTransfer)}</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500/80 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((totalTransfer / stats.totalSales) * 100) || 0}%` }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground/70 font-medium min-w-[32px] text-right">
              {Math.round((totalTransfer / stats.totalSales) * 100) || 0}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Efectivo */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border-l-2 border-l-green-500/20">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-xs font-medium text-muted-foreground/80 flex items-center gap-1.5">
            <Banknote className="w-3.5 h-3.5 text-green-600" />
            Efectivo
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-2xl font-bold tracking-tight">{formatCurrency(stats.totalCash)}</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500/80 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((stats.totalCash / stats.totalSales) * 100) || 0}%` }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground/70 font-medium min-w-[32px] text-right">
              {Math.round((stats.totalCash / stats.totalSales) * 100) || 0}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border-l-2 border-l-blue-500/20">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-xs font-medium text-muted-foreground/80 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            Tarjeta
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-2xl font-bold tracking-tight">{formatCurrency(stats.totalCard)}</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500/80 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((stats.totalCard / stats.totalSales) * 100) || 0}%` }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground/70 font-medium min-w-[32px] text-right">
              {Math.round((stats.totalCard / stats.totalSales) * 100) || 0}%
            </span>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
