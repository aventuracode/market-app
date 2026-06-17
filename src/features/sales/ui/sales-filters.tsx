'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SalesPeriod } from '../domain/sales.types'

interface SalesFiltersProps {
  period: SalesPeriod
  onPeriodChange: (period: SalesPeriod) => void
}

export function SalesFilters({ period, onPeriodChange }: SalesFiltersProps) {
  return (
    <div className="mb-4">
      <Tabs value={period} onValueChange={(value) => onPeriodChange(value as SalesPeriod)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs">
            Todas
          </TabsTrigger>
          <TabsTrigger value="today" className="text-xs">
            Hoy
          </TabsTrigger>
          <TabsTrigger value="week" className="text-xs">
            Semana
          </TabsTrigger>
          <TabsTrigger value="month" className="text-xs">
            Mes
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
