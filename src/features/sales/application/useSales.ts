'use client'

import { useQuery } from '@tanstack/react-query'
import { startOfDay, startOfWeek, startOfMonth, endOfDay } from 'date-fns'
import { salesService, SalesPermissionError, type SalesFilters } from '../infrastructure/sales.service'
import { useTenant } from '@/features/auth'
import { useAuthStore } from '@/features/auth'
import { useCashStore } from '@/features/cash/application/stores/cash.store'
import type { SalesPeriod } from '@/features/sales/domain/sales.types'

/**
 * Obtiene el rango de fechas según el período
 */
function getDateRangeForPeriod(period: SalesPeriod): {
  startDate?: string
  endDate?: string
} {
  const now = new Date()

  switch (period) {
    case 'today':
      return {
        startDate: startOfDay(now).toISOString(),
        endDate: endOfDay(now).toISOString(),
      }
    case 'week':
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        endDate: now.toISOString(),
      }
    case 'month':
      return {
        startDate: startOfMonth(now).toISOString(),
        endDate: now.toISOString(),
      }
    case 'all':
    default:
      return {}
  }
}

/**
 * Hook para obtener ventas con filtrado automático por rol
 * Trabaja con RLS de Supabase
 */
export function useSales(period: SalesPeriod = 'today') {
  const { tenant } = useTenant()
  const { user } = useAuthStore()
  const activeSession = useCashStore((state) => state.activeSession)

  const dateRange = getDateRangeForPeriod(period)

  return useQuery({
    queryKey: ['sales', tenant?.id, user?.id, user?.role, activeSession?.id, period],
    queryFn: async () => {
      if (!tenant?.id) {
        throw new Error('No hay tenant activo')
      }

      if (!user?.id) {
        throw new Error('No hay usuario autenticado')
      }

      // Construir filtros
      const filters: SalesFilters = {
        tenantId: tenant.id,
        ...dateRange,
      }

      // Aplicar filtro de usuario y sesión para CAJERO
      if (user.role === 'CAJERO') {
        filters.userId = user.id
        
        // Filtrar por sesión activa si existe
        if (activeSession?.id) {
          filters.cashSessionId = activeSession.id
        }
      }

      try {
        const sales = await salesService.getSales(filters, user.role || undefined)

        return sales
      } catch (error) {
        if (error instanceof SalesPermissionError) {
          throw error
        }

        throw error
      }
    },
    enabled: !!tenant?.id && !!user?.id,
    staleTime: period === 'today' ? 10 * 1000 : 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      // No reintentar errores de permisos
      if (error instanceof SalesPermissionError) {
        return false
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook para obtener estadísticas de ventas
 */
export function useSalesStats(period: SalesPeriod = 'today') {
  const { tenant } = useTenant()
  const { user } = useAuthStore()
  const activeSession = useCashStore((state) => state.activeSession)

  const dateRange = getDateRangeForPeriod(period)

  return useQuery({
    queryKey: ['sales', 'stats', tenant?.id, user?.id, user?.role, activeSession?.id, period],
    queryFn: async () => {
      if (!tenant?.id) {
        throw new Error('No hay tenant activo')
      }

      if (!user?.id) {
        throw new Error('No hay usuario autenticado')
      }

      // Construir filtros
      const filters: SalesFilters = {
        tenantId: tenant.id,
        ...dateRange,
      }

      // Aplicar filtro de usuario y sesión para CAJERO
      if (user.role === 'CAJERO') {
        filters.userId = user.id
        
        // Filtrar por sesión activa si existe
        if (activeSession?.id) {
          filters.cashSessionId = activeSession.id
        }
      }

      return salesService.getSalesStats(filters, user.role || undefined)
    },
    enabled: !!tenant?.id && !!user?.id,
    staleTime: period === 'today' ? 10 * 1000 : 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Obtiene el título de la página según el rol
 */
export function useSalesPageTitle(): string {
  const { user } = useAuthStore()

  if (!user?.role) {
    return 'Ventas'
  }

  switch (user.role) {
    case 'CAJERO':
      return 'Mis Ventas'
    case 'ADMIN':
      return 'Todas las Ventas'
    case 'SUPERVISOR':
      return 'Ventas'
    default:
      return 'Ventas'
  }
}
