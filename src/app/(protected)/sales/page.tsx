'use client'

import { useState } from 'react'
import { useSales, useSalesStats, useSalesPageTitle } from '@/hooks/useSales'
import { SalesStatsCards } from '@/components/sales/sales-stats-cards'
import { SalesPeriodTabs } from '@/components/sales/sales-period-tabs'
import { SalesTable } from '@/components/sales/sales-table'
import type { SalesPeriod } from '@/types/sales'

/**
 * Página de ventas con filtrado automático por rol
 * Trabaja con RLS de Supabase
 */
export default function SalesPage() {
  const [period, setPeriod] = useState<SalesPeriod>('today')
  
  // Obtener título según rol
  const pageTitle = useSalesPageTitle()
  
  // Cargar ventas y estadísticas
  const { data: sales, isLoading: salesLoading, error: salesError } = useSales(period)
  const { data: stats, isLoading: statsLoading } = useSalesStats(period)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b shadow-sm">
        <div className="px-4 pt-5 pb-4">
          <h1 className="text-2xl font-bold tracking-tight mb-5">{pageTitle}</h1>
          
          {/* Period Tabs */}
          <SalesPeriodTabs period={period} onPeriodChange={setPeriod} />
          
          {/* Stats Cards */}
          <SalesStatsCards stats={stats} isLoading={statsLoading} />
        </div>
      </div>

      {/* Sales Table */}
      <div className="p-4 pt-5">
        <SalesTable 
          sales={sales} 
          isLoading={salesLoading}
          error={salesError}
        />
      </div>
    </div>
  )
}
