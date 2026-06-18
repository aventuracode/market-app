'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTenant } from '@/features/auth'
import { useAuthStore } from '@/features/auth'
import type { SalesFilters, SalesPeriod } from '@/features/sales/domain/sales.types'

import { salesHistoryService } from '../../infrastructure/sales.service'

/**
 * Hook para obtener ventas con filtros
 * Incluye caching automático y refetch inteligente
 */
export function useSalesQuery(filters: Omit<SalesFilters, 'tenantId'>) {
  const { tenant } = useTenant()

  return useQuery({
    queryKey: ['sales', tenant?.id, filters],
    queryFn: async () => {
      if (!tenant?.id) throw new Error('No tenant active')
      
      return salesHistoryService.getSales({
        tenantId: tenant.id,
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
 * Filtra automáticamente por user_id si el usuario es CAJERO
 */
export function useSalesByPeriod(period: SalesPeriod, additionalFilters?: Partial<SalesFilters>) {
  const { tenant } = useTenant()
  const { user } = useAuthStore()
  const dateRange = salesHistoryService.getDateRangeForPeriod(period)

  return useQuery({
    queryKey: ['sales', 'period', period, tenant?.id, user?.id, user?.role, additionalFilters],
    queryFn: async () => {
      if (!tenant?.id) throw new Error('No tenant active')
      
      // Aplicar filtro por usuario si es CAJERO
      const filters: SalesFilters = {
        tenantId: tenant.id,
        startDate: dateRange.start_date,
        endDate: dateRange.end_date,
        ...additionalFilters,
      }

      // CAJERO solo puede ver sus propias ventas
      if (user?.role === 'CAJERO' && user?.id) {
        filters.userId = user.id
      }
      
      return salesHistoryService.getSales(filters)
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
export function useSalesStatsQuery(filters: Omit<SalesFilters, 'tenantId'>) {
  const { tenant } = useTenant()

  return useQuery({
    queryKey: ['sales', 'stats', tenant?.id, filters],
    queryFn: async () => {
      if (!tenant?.id) throw new Error('No tenant active')
      
      return salesHistoryService.getSalesStats({
        tenantId: tenant.id,
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
 * Filtra automáticamente por user_id si el usuario es CAJERO
 */
export function useSalesStatsByPeriod(period: SalesPeriod) {
  const { tenant } = useTenant()
  const { user } = useAuthStore()
  const dateRange = salesHistoryService.getDateRangeForPeriod(period)

  return useQuery({
    queryKey: ['sales', 'stats', 'period', period, tenant?.id, user?.id, user?.role],
    queryFn: async () => {
      if (!tenant?.id) throw new Error('No tenant active')
      
      // Aplicar filtro por usuario si es CAJERO
      const filters: SalesFilters = {
        tenantId: tenant.id,
        startDate: dateRange.start_date,
        endDate: dateRange.end_date,
      }

      // CAJERO solo puede ver estadísticas de sus propias ventas
      if (user?.role === 'CAJERO' && user?.id) {
        filters.userId = user.id
      }
      
      return salesHistoryService.getSalesStats(filters)
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

    const unsubscribe = salesHistoryService.subscribeToSales(
      tenant.id,
      () => {
        // Invalidar todas las queries de ventas
        queryClient.invalidateQueries({ queryKey: ['sales'] })
      }
    )

    return () => {
      unsubscribe()
    }
  }, [tenant?.id, queryClient])
}
