import { createClient } from '@/lib/supabase/client'
import type { SaleWithRelations, SalesStats, SalesQueryFilters } from '@/types/sales-extended'
import { startOfDay, startOfWeek, startOfMonth, endOfDay } from 'date-fns'

/**
 * Service para gestión del historial de ventas
 * Optimizado para queries complejas con relaciones
 */
class SalesHistoryService {
  private supabase = createClient()

  /**
   * Obtiene ventas con filtros y relaciones
   */
  async getSales(filters: SalesQueryFilters): Promise<SaleWithRelations[]> {
    try {
      let query = this.supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (
              name,
              sku,
              barcode
            )
          ),
          users (
            first_name,
            last_name
          ),
          cash_registers (
            name
          )
        `)
        .eq('tenant_id', filters.tenant_id)
        .order('created_at', { ascending: false })

      // Filtro por rango de fechas
      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date)
      }
      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date)
      }

      // Filtro por método de pago
      if (filters.payment_method) {
        query = query.eq('payment_method', filters.payment_method)
      }

      // Filtro por usuario (CAJERO)
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id)
      }

      // Filtro por búsqueda (número de venta)
      if (filters.search) {
        query = query.ilike('sale_number', `%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('[SalesHistoryService] Error fetching sales:', error)
        console.error('[SalesHistoryService] Error code:', error.code)
        console.error('[SalesHistoryService] Error message:', error.message)
        console.error('[SalesHistoryService] Error details:', error.details)
        console.error('[SalesHistoryService] Error hint:', error.hint)
        throw error
      }

      return (data as SaleWithRelations[]) || []
    } catch (error) {
      console.error('[SalesHistoryService] getSales error:', error)
      throw error
    }
  }

  /**
   * Obtiene una venta por ID con todas sus relaciones
   */
  async getSaleById(saleId: string, tenantId: string): Promise<SaleWithRelations | null> {
    try {
      const { data, error } = await this.supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (
              name,
              sku,
              barcode
            )
          ),
          users (
            first_name,
            last_name
          ),
          cash_registers (
            name
          )
        `)
        .eq('id', saleId)
        .eq('tenant_id', tenantId)
        .single()

      if (error) {
        console.error('[SalesHistoryService] Error fetching sale:', error)
        throw error
      }

      return data as SaleWithRelations
    } catch (error) {
      console.error('[SalesHistoryService] getSaleById error:', error)
      return null
    }
  }

  /**
   * Calcula estadísticas de ventas para un período
   */
  async getSalesStats(filters: SalesQueryFilters): Promise<SalesStats> {
    try {
      const sales = await this.getSales(filters)

      if (sales.length === 0) {
        return {
          total_sales: 0,
          sales_count: 0,
          average_ticket: 0,
          most_used_payment_method: 'CASH',
          sales_by_payment_method: {
            CASH: 0,
            CARD: 0,
            TRANSFER: 0,
          },
        }
      }

      // Calcular totales
      const total_sales = sales.reduce((sum, sale) => sum + sale.total, 0)
      const sales_count = sales.length
      const average_ticket = total_sales / sales_count

      // Contar por método de pago
      const sales_by_payment_method = sales.reduce(
        (acc, sale) => {
          acc[sale.payment_method] = (acc[sale.payment_method] || 0) + sale.total
          return acc
        },
        { CASH: 0, CARD: 0, TRANSFER: 0 } as Record<string, number>
      )

      // Encontrar método más usado
      const most_used_payment_method = (Object.entries(sales_by_payment_method).sort(
        ([, a], [, b]) => b - a
      )[0]?.[0] || 'CASH') as 'CASH' | 'CARD' | 'TRANSFER'

      const stats: SalesStats = {
        total_sales,
        sales_count,
        average_ticket,
        most_used_payment_method,
        sales_by_payment_method: sales_by_payment_method as SalesStats['sales_by_payment_method'],
      }

      return stats
    } catch (error) {
      console.error('[SalesHistoryService] getSalesStats error:', error)
      throw error
    }
  }

  /**
   * Obtiene el rango de fechas según el período
   */
  getDateRangeForPeriod(period: 'all' | 'today' | 'week' | 'month'): {
    start_date?: string
    end_date?: string
  } {
    const now = new Date()

    switch (period) {
      case 'today':
        return {
          start_date: startOfDay(now).toISOString(),
          end_date: endOfDay(now).toISOString(),
        }
      case 'week':
        return {
          start_date: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
          end_date: now.toISOString(),
        }
      case 'month':
        return {
          start_date: startOfMonth(now).toISOString(),
          end_date: now.toISOString(),
        }
      case 'all':
      default:
        return {}
    }
  }

  /**
   * Suscripción a cambios en ventas (realtime)
   */
  subscribeToSales(
    tenantId: string,
    callback: (payload: any) => void
  ) {
    const channel = this.supabase
      .channel(`sales:${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }
}

export const salesHistoryService = new SalesHistoryService()
