import { createClient } from '@/shared/supabase/client'
import { money, validateCheckoutTotal, isValidMoney } from '@/shared/utils'
import { CreateSaleInputParams, SaleItemInput } from '../domain/saleItemInput.types'
import { Tables } from '@/shared/supabase/types'
import type { Json } from '@/shared/supabase/types.generated'
import { CreateSaleResponse, emptySale, PaymentMethod, Role, SalesStats, SaleWithDetails } from '../domain/sales.types'
import { mapSale, mapSales, mapSaleSimple } from './sale.mapper'
import { endOfDay, startOfDay, startOfMonth, startOfWeek } from 'date-fns'

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
 * Servicio consolidado para gestión completa de ventas
 * Responsabilidades:
 * - Crear ventas (createSale)
 * - Consultar ventas (getSales, getSaleById)
 * - Estadísticas (getSalesStats)
 * - Utilidades (getDateRangeForPeriod)
 * - Realtime (subscribeToSales)
 */
class SalesService {
  private supabase = createClient()

  // ============================================================================
  // CREAR VENTA
  // ============================================================================

  /**
   * Crea una venta completa con:
   * - Registro de venta
   * - Items de venta
   * - Descuento de stock
   * - Movimientos de stock
   * - Movimientos de caja (si es efectivo)
   */
  async createSale(params: CreateSaleInputParams): Promise<CreateSaleResponse> {
    const payload = this.buildSalePayload(params)
    const saleId = await this.executeSaleRPC(payload)
    // tenant_id ya no se pasa a la RPC, pero se necesita para fetchSaleById
    // Se obtiene del payload original (que viene de Insert que sí lo tiene)
    const tenantId = (params as any).tenant_id
    return this.fetchSaleById(saleId, tenantId)
  }

  private buildSalePayload(params: CreateSaleInputParams) {
  this.validateSaleParams(params)

  const items = this.sanitizeItemSaleParams(params.items)
  const total = items.reduce((sum, item) => sum + money(item.subtotal), 0)
  validateCheckoutTotal(total)

  return { ...params, items }
}

  private async executeSaleRPC(
  payload: ReturnType<typeof this.buildSalePayload>
): Promise<string> {
  // Se actualizarán con `pnpm types:generate` después de actualizar la RPC en Supabase
  const { data, error } = await this.supabase.rpc('create_sale', {
    p_cash_register_id: payload.cash_register_id,
    p_cash_session_id: payload.cash_session_id,
    p_payment_method: payload.payment_method,
    p_items: payload.items as Json,
  })

  if (error) throw this.handleRPCError(error)
  if (!data) throw new Error('No se recibió respuesta del servidor')

  return data
}

  private async fetchSaleById(
  saleId: string,
  tenantId: string
): Promise<CreateSaleResponse> {
  const { data, error } = await this.supabase
    .from('sales')
    .select('*')
    .eq('id', saleId)
    .eq('tenant_id', tenantId)
    .single()

  if (error || !data) {
    return {
      sale: emptySale(saleId),
      sale_items: [],
      stock_movements: [],
      cash_movement: null,
    }
  }

  // Normalizar datos de DB a tipos de dominio
  const normalizedSale = mapSaleSimple(data)

  return {
    sale: normalizedSale,
    sale_items: [],
    stock_movements: [],
    cash_movement: null,
  }
}

  /**
   * Sanitiza valores financieros para prevenir NaN
   */
  private sanitizeItemSaleParams(params: SaleItemInput[]): SaleItemInput[] {
    const sanitizedItems = params.map(item => ({
      ...item,
      unit_price: money(item.unit_price),
      subtotal: money(item.subtotal),
      quantity: item.quantity || 0,
    }))

    return sanitizedItems
  }

  /**
   * Valida los parámetros de la venta
   */
  private validateSaleParams(params: CreateSaleInputParams): void {
    if (!params.payment_method) {
      throw new Error('Método de pago es requerido')
    }

    if (!params.cash_register_id) {
      throw new Error('cash_register_id es requerido')
    }

    if (!params.cash_session_id) {
      throw new Error('cash_session_id es requerido - debe haber una sesión de caja abierta')
    }

    if (!params.items || params.items.length === 0) {
      throw new Error('La venta debe tener al menos un producto')
    }

    // Validar items
    params.items.forEach((item, index) => {
      if (!item.product_id) {
        throw new Error(`Item ${index + 1}: product_id es requerido`)
      }
      if (item.quantity <= 0) {
        throw new Error(`Item ${index + 1}: cantidad debe ser mayor a cero`)
      }
      if (!isValidMoney(item.unit_price)) {
        throw new Error(`Item ${index + 1}: precio inválido`)
      }
      if (!isValidMoney(item.subtotal)) {
        throw new Error(`Item ${index + 1}: subtotal inválido`)
      }
    })
  }

  /**
   * Maneja errores de RPC con mensajes amigables
   */
  private handleRPCError(error: any): Error {
    const errorMessage = error.message || 'Error desconocido'

    // Errores específicos con product_id
    if (errorMessage.includes('not found or does not belong to tenant')) {
      return new Error('Uno o más productos no existen o no pertenecen a tu tenant')
    }

    if (errorMessage.includes('Insufficient stock for product')) {
      return new Error('Stock insuficiente para uno o más productos')
    }

    if (errorMessage.includes('Cash session is not open or does not belong to this tenant/register')) {
      return new Error('La sesión de caja no está abierta o no pertenece a esta caja')
    }

    // Errores comunes (legacy)
    if (errorMessage.includes('insufficient stock')) {
      return new Error('Stock insuficiente para completar la venta')
    }

    if (errorMessage.includes('product not found')) {
      return new Error('Uno o más productos no fueron encontrados')
    }

    if (errorMessage.includes('inactive product')) {
      return new Error('Uno o más productos están inactivos')
    }

    if (errorMessage.includes('permission denied')) {
      return new Error('No tienes permisos para realizar esta operación')
    }

    // Error genérico
    return new Error(`Error al crear la venta: ${errorMessage}`)
  }

  // ============================================================================
  // CONSULTAR VENTAS
  // ============================================================================

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
        // Error de permisos
        if (error.code === 'PGRST301' || error.message?.includes('permission denied')) {
          throw new SalesPermissionError('No tienes permisos para ver estas ventas')
        }

        // Otros errores
        throw new Error(error.message || 'Error al cargar ventas')
      }

      return mapSales(data ?? [])
    } catch (err) {
      if (err instanceof SalesPermissionError) {
        throw err
      }
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

      throw err instanceof Error ? err : new Error('Error inesperado')
    }
  }

  // ============================================================================
  // ESTADÍSTICAS
  // ============================================================================

  /**
   * Calcula estadísticas de ventas
   */
  async getSalesStats(filters: SalesFilters, userRole?: Role): Promise<SalesStats> {
    const sales = await this.getSales(filters, userRole)

    if (sales.length === 0) {
      return {
        total_sales: money(0),
        sales_count: 0,
        average_ticket: money(0),
        most_used_payment_method: 'CASH',
        sales_by_payment_method: {
          CASH: money(0),
          CARD: money(0),
          TRANSFER: money(0),
        },
      }
    }

    const total_sales = money(sales.reduce((sum, sale) => sum + money(sale.total), 0))
    const sales_count = sales.length
    const average_ticket = money(total_sales / sales_count)

    const sales_by_payment_method = {
      CASH: money(sales.filter((s) => s.payment_method === 'CASH').reduce((sum, sale) => sum + money(sale.total), 0)),
      CARD: money(sales.filter((s) => s.payment_method === 'CARD').reduce((sum, sale) => sum + money(sale.total), 0)),
      TRANSFER: money(sales.filter((s) => s.payment_method === 'TRANSFER').reduce((sum, sale) => sum + money(sale.total), 0)),
    }

    // Encontrar método de pago más usado (por monto acumulado)
    const most_used_payment_method = (Object.entries(sales_by_payment_method)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'CASH') as PaymentMethod

    return {
      total_sales,
      sales_count,
      average_ticket,
      most_used_payment_method,
      sales_by_payment_method,
    }
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

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

  // ============================================================================
  // REALTIME
  // ============================================================================

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

// ============================================================================
// EXPORTS
// ============================================================================

export const salesService = new SalesService()

// Mantener compatibilidad con imports legacy
export const saleService = salesService
export const salesHistoryService = salesService
