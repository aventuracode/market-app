'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { salesHistoryService } from '@/services/sales-history.service'
import { useTenant } from '@/hooks/use-tenant'
import type { SalesQueryFilters } from '@/types/sales-extended'
import type { SalesPeriod } from '@/schemas'

/**
 * Hook para obtener ventas con filtros
 * Incluye caching automático y refetch inteligente
 */
export function useSalesQuery(filters: Omit<SalesQueryFilters, 'tenant_id'>) {
  const { tenant } = useTenant()

  return useQuery({
    queryKey: ['sales', tenant?.id, filters],
    queryFn: async () => {
      if (!tenant?.id) throw new Error('No tenant active')
      
      return salesHistoryService.getSales({
        tenant_id: tenant.id,
        ...filters,
      })
    },
    enabled: !!tenant?.id,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para obtener ventas por período (tabs)
 */
export function useSalesByPeriod(period: SalesPeriod, additionalFilters?: Partial<SalesQueryFilters>) {
  const { tenant } = useTenant()
  const dateRange = salesHistoryService.getDateRangeForPeriod(period)

  return useQuery({
    queryKey: ['sales', 'period', period, tenant?.id, additionalFilters],
    queryFn: async () => {
      if (!tenant?.id) throw new Error('No tenant active')
      
      return salesHistoryService.getSales({
        tenant_id: tenant.id,
        ...dateRange,
        ...additionalFilters,
      })
    },
    enabled: !!tenant?.id,
    staleTime: period === 'today' ? 10 * 1000 : 30 * 1000, // Más fresco para "hoy"
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para obtener una venta específica
 */
export function useSaleQuery(saleId: string | null) {
  const { tenant } = useTenant()

  return useQuery({
    queryKey: ['sale', saleId],
    queryFn: async () => {
      if (!saleId) throw new Error('No sale ID')
      if (!tenant?.id) throw new Error('No tenant active')
      
      return salesHistoryService.getSaleById(saleId, tenant.id)
    },
    enabled: !!saleId && !!tenant?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para obtener estadísticas de ventas
 */
export function useSalesStatsQuery(filters: Omit<SalesQueryFilters, 'tenant_id'>) {
  const { tenant } = useTenant()

  return useQuery({
    queryKey: ['sales', 'stats', tenant?.id, filters],
    queryFn: async () => {
      if (!tenant?.id) throw new Error('No tenant active')
      
      return salesHistoryService.getSalesStats({
        tenant_id: tenant.id,
        ...filters,
      })
    },
    enabled: !!tenant?.id,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para obtener estadísticas por período
 */
export function useSalesStatsByPeriod(period: SalesPeriod) {
  const { tenant } = useTenant()
  const dateRange = salesHistoryService.getDateRangeForPeriod(period)

  return useQuery({
    queryKey: ['sales', 'stats', 'period', period, tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) throw new Error('No tenant active')
      
      return salesHistoryService.getSalesStats({
        tenant_id: tenant.id,
        ...dateRange,
      })
    },
    enabled: !!tenant?.id,
    staleTime: period === 'today' ? 10 * 1000 : 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para suscripción realtime a ventas
 * Invalida queries automáticamente cuando hay cambios
 */
export function useSalesRealtime() {
  const { tenant } = useTenant()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!tenant?.id) return

    console.log('[useSalesRealtime] Setting up realtime subscription')

    const unsubscribe = salesHistoryService.subscribeToSales(
      tenant.id,
      (payload) => {
        console.log('[useSalesRealtime] Received update, invalidating queries')
        
        // Invalidar todas las queries de ventas
        queryClient.invalidateQueries({ queryKey: ['sales'] })
        
        // Mostrar notificación si es una nueva venta
        if (payload.eventType === 'INSERT') {
          console.log('[useSalesRealtime] Nueva venta detectada:', payload.new)
        }
      }
    )

    return () => {
      console.log('[useSalesRealtime] Cleaning up realtime subscription')
      unsubscribe()
    }
  }, [tenant?.id, queryClient])
}
