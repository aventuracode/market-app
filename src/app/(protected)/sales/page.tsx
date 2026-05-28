'use client'

import { useState, useEffect } from 'react'
import { SalesStatsComponent } from '@/components/sales/sales-stats'
import { SalesFilters } from '@/components/sales/sales-filters'
import { SalesList } from '@/components/sales/sales-list'
import { useSalesByPeriod, useSalesStatsByPeriod, useSalesRealtime } from '@/hooks/queries/use-sales-query'
import type { SalesPeriod } from '@/schemas'

export default function SalesPage() {
  const [period, setPeriod] = useState<SalesPeriod>('today')
  const [newSaleIds, setNewSaleIds] = useState<Set<string>>(new Set())

  // Queries
  const { data: sales, isLoading: salesLoading } = useSalesByPeriod(period)
  const { data: stats, isLoading: statsLoading } = useSalesStatsByPeriod(period)

  // Realtime subscription
  useSalesRealtime()

  // Detectar nuevas ventas para animación
  useEffect(() => {
    if (sales && sales.length > 0) {
      const latestSale = sales[0]
      const saleDate = new Date(latestSale.created_at)
      const now = new Date()
      const diffInSeconds = (now.getTime() - saleDate.getTime()) / 1000

      // Si la venta es de hace menos de 10 segundos, marcarla como nueva
      if (diffInSeconds < 10) {
        setNewSaleIds((prev) => new Set(prev).add(latestSale.id))
        
        // Remover el highlight después de 5 segundos
        setTimeout(() => {
          setNewSaleIds((prev) => {
            const next = new Set(prev)
            next.delete(latestSale.id)
            return next
          })
        }, 5000)
      }
    }
  }, [sales])

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Ventas</h1>
          
          {/* Stats */}
          <SalesStatsComponent stats={stats} isLoading={statsLoading} />
          
          {/* Filters */}
          <SalesFilters period={period} onPeriodChange={setPeriod} />
        </div>
      </div>

      {/* Sales List */}
      <div className="p-4">
        <SalesList 
          sales={sales} 
          isLoading={salesLoading}
          newSaleIds={newSaleIds}
        />
      </div>
    </div>
  )
}
