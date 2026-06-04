'use client'

import { useQuery } from '@tanstack/react-query'
import { startOfDay, startOfWeek, startOfMonth, endOfDay } from 'date-fns'
import { salesService, SalesPermissionError } from '@/services/sales.service'
import { useTenant } from '@/hooks/use-tenant'
import { useAuthStore } from '@/stores/auth.store'
import { useCashStore } from '@/stores/cash.store'
import type { SalesPeriod } from '@/types/sales'
import type { SalesFilters } from '@/services/sales.service'

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

      if (process.env.NODE_ENV === 'development') {
        console.group('[useSales] USER DEBUG')
        console.log('User completo:', user)
        console.log('user.id:', user?.id)
        console.log('user.role:', user?.role)
        console.log('activeSession:', activeSession)
        console.log('tenant:', tenant)
        console.groupEnd()
      }

      // Aplicar filtro de usuario y sesión para CAJERO
      if (user.role === 'CAJERO') {
        filters.userId = user.id
        
        // Filtrar por sesión activa si existe
        if (activeSession?.id) {
          filters.cashSessionId = activeSession.id
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[useSales] Fetching sales:', {
          userId: user.id,
          userRole: user.role,
          period,
          activeSessionId: activeSession?.id,
          willFilterByUser: user.role === 'CAJERO',
          willFilterBySession: user.role === 'CAJERO' && !!activeSession?.id,
        })
      }

      if (process.env.NODE_ENV === 'development') {
        console.group('[useSales] Filters Generated')
        console.log('userRole:', user?.role)
        console.log('filters:', filters)
        console.groupEnd()
      }

      try {
        const sales = await salesService.getSales(filters, user.role)

        if (process.env.NODE_ENV === 'development') {
          console.log('[useSales] Sales loaded:', {
            count: sales.length,
            role: user.role,
            filteredBySession: !!filters.cashSessionId,
          })
        }

        return sales
      } catch (error) {
        if (error instanceof SalesPermissionError) {
          console.error('[useSales] Permission denied:', error.message)
          throw error
        }

        console.error('[useSales] Error loading sales:', error)
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

      if (process.env.NODE_ENV === 'development') {
        console.group('[useSalesStats] USER DEBUG')
        console.log('User completo:', user)
        console.log('user.id:', user?.id)
        console.log('user.role:', user?.role)
        console.log('activeSession:', activeSession)
        console.log('tenant:', tenant)
        console.groupEnd()
      }

      // Aplicar filtro de usuario y sesión para CAJERO
      if (user.role === 'CAJERO') {
        filters.userId = user.id
        
        // Filtrar por sesión activa si existe
        if (activeSession?.id) {
          filters.cashSessionId = activeSession.id
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[useSalesStats] Fetching stats:', {
          userId: user.id,
          userRole: user.role,
          period,
          activeSessionId: activeSession?.id,
          willFilterBySession: user.role === 'CAJERO' && !!activeSession?.id,
        })
      }

      return salesService.getSalesStats(filters, user.role)
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
