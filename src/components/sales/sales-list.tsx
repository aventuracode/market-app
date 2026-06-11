'use client'

import { useState } from 'react'
import { SaleCard } from './sale-card'
import { SaleDetailSheet } from './sale-detail-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingBag } from 'lucide-react'
import type { SaleWithDetails } from '@/types/sales'

interface SalesListProps {
  sales: SaleWithDetails[] | undefined
  isLoading: boolean
  newSaleIds?: Set<string>
}

export function SalesList({ sales, isLoading, newSaleIds = new Set() }: SalesListProps) {
  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-8 w-32 mb-3" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No hay ventas</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          No se encontraron ventas para los filtros seleccionados.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 pb-20">
        {sales.map((sale) => (
          <SaleCard
            key={sale.id}
            sale={sale}
            onClick={() => setSelectedSale(sale)}
            isNew={newSaleIds.has(sale.id)}
          />
        ))}
      </div>

      <SaleDetailSheet
        sale={selectedSale}
        open={!!selectedSale}
        onOpenChange={(open: boolean) => !open && setSelectedSale(null)}
      />
    </>
  )
}
