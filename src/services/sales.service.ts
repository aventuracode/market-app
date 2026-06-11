import { createClient } from '@/lib/supabase/client'
import type { SaleWithDetails } from '@/types/sales'
import type { Role } from '@/types'
import { mapSale, mapSales } from '@/lib/mapper/sale.mapper'
// TODO: Refactor Sale, SaleWithDetails, SaleWithRelations types to derive from Supabase generated types
// Current types are missing fields like 'tax', 'updated_at' and have type mismatches with DB schema

/**
 * Error personalizado para permisos RLS
 */
export class SalesPermissionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SalesPermissionError'
  }
}

/**
 * Filtros para consulta de ventas
 */
export interface SalesFilters {
  tenantId: string
  userId?: string
  cashSessionId?: string
  startDate?: string
  endDate?: string
  paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER'
  search?: string
}

/**
 * Servicio centralizado para gestión de ventas
 * Trabaja con RLS de Supabase
 */
class SalesService {
  private supabase = createClient()

  /**
   * Obtiene ventas aplicando filtros según el rol del usuario
   * Las RLS de Supabase ya filtran en backend, pero aplicamos filtros
   * frontend para mejor UX y performance
   */
  async getSales(filters: SalesFilters, userRole?: Role): Promise<SaleWithDetails[]> {
    try {

      let query = this.supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (
              id,
              name,
              sku,
              barcode
            )
          ),
          users (
            id,
            first_name,
            last_name
          ),
          cash_registers (
            id,
            name
          )
        `)
        .eq('tenant_id', filters.tenantId)
        .order('created_at', { ascending: false })

        

      // Filtro por usuario (CAJERO)
      // RLS ya filtra en backend, pero lo aplicamos también en frontend
      if (userRole === 'CAJERO' && filters.userId) {
        query = query.eq('user_id', filters.userId)
      }

      // Filtro por sesión de caja (CAJERO)
      // Solo muestra ventas de la sesión activa
      if (filters.cashSessionId) {
        query = query.eq('cash_session_id', filters.cashSessionId)
      }

      // Filtro por rango de fechas
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate)
      }

      // Filtro por método de pago
      if (filters.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod)
      }

      // Filtro por búsqueda (número de venta)
      if (filters.search) {
        query = query.ilike('sale_number', `%${filters.search}%`)
      }

      const { data, error } = await query

      // Detectar errores de permisos RLS
      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[SalesService] Error fetching sales:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          })
        }

        // Error de permisos
        if (error.code === 'PGRST301' || error.message?.includes('permission denied')) {
          throw new SalesPermissionError('No tienes permisos para ver estas ventas')
        }

        // Otros errores
        throw new Error(error.message || 'Error al cargar ventas')
      }

      return mapSales(data ?? [])
    } catch (err) {
      // Re-lanzar errores personalizados
      if (err instanceof SalesPermissionError) {
        throw err
      }

      // Log de errores inesperados
      console.error('[SalesService] Unexpected error:', err)
      throw err instanceof Error ? err : new Error('Error inesperado al cargar ventas')
    }
  }

  /**
   * Obtiene una venta específica por ID
   */
  async getSaleById(saleId: string, tenantId: string): Promise<SaleWithDetails | null> {
    try {
      const { data, error } = await this.supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (
              id,
              name,
              sku,
              barcode
            )
          ),
          users (
            id,
            first_name,
            last_name
          ),
          cash_registers (
            id,
            name
          )
        `)
        .eq('id', saleId)
        .eq('tenant_id', tenantId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No encontrado
          return null
        }

        if (error.code === 'PGRST301' || error.message?.includes('permission denied')) {
          throw new SalesPermissionError('No tienes permisos para ver esta venta')
        }

        throw new Error(error.message || 'Error al cargar venta')
      }
      return mapSale(data)
    } catch (err) {
      if (err instanceof SalesPermissionError) {
        throw err
      }

      console.error('[SalesService] Error in getSaleById:', err)
      throw err instanceof Error ? err : new Error('Error inesperado')
    }
  }

  /**
   * Calcula estadísticas de ventas
   */
  async getSalesStats(filters: SalesFilters, userRole?: Role) {
    const sales = await this.getSales(filters, userRole)

    if (sales.length === 0) {
      return {
        totalSales: 0,
        salesCount: 0,
        averageTicket: 0,
        totalCash: 0,
        totalCard: 0,
        totalTransfer: 0,
      }
    }

    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
    const salesCount = sales.length
    const averageTicket = totalSales / salesCount

    const totalCash = sales
      .filter((s) => s.payment_method === 'CASH')
      .reduce((sum, sale) => sum + sale.total, 0)

    const totalCard = sales
      .filter((s) => s.payment_method === 'CARD')
      .reduce((sum, sale) => sum + sale.total, 0)

    const totalTransfer = sales
      .filter((s) => s.payment_method === 'TRANSFER')
      .reduce((sum, sale) => sum + sale.total, 0)

    return {
      totalSales,
      salesCount,
      averageTicket,
      totalCash,
      totalCard,
      totalTransfer,
    }
  }
}

export const salesService = new SalesService()
