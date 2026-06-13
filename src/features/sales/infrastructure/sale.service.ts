import { createClient } from '@/lib/supabase/client'
import { money, validateCheckoutTotal, isValidMoney } from '@/lib/money'
import { CreateSaleParams, Sale } from '@/features/sales/domain/sales.types'
import { CreateSaleResponse } from '@/features/sales/domain/sale.types'
import { CreateSaleInputParams, SaleItemInput } from '../domain/saleItemInput.types'
import { Json, Tables } from '@/types/supabase.generated'
type CreateSaleRPCResult = string // UUID de la venta creada
class SaleService {
  private supabase = createClient()

  /**
   * Crea una venta completa con:
   * - Registro de venta
   * - Items de venta
   * - Descuento de stock
   * - Movimientos de stock
   * - Movimientos de caja (si es efectivo)
   */
  // ─── Responsabilidad 1: validar y preparar los params ──────────────────────

private buildSalePayload(params: CreateSaleInputParams) {
  this.validateSaleParams(params)

  const items = this.sanitizeItemSaleParams(params.items)
  const total = items.reduce((sum, item) => sum + money(item.subtotal), 0)
  validateCheckoutTotal(total)

  return { ...params, items }
}

// ─── Responsabilidad 2: llamar a la RPC ────────────────────────────────────

private async executeSaleRPC(
  payload: ReturnType<typeof this.buildSalePayload>
): Promise<string> {
  const { data, error } = await this.supabase.rpc('create_sale', {
    p_tenant_id: payload.tenant_id,
    p_user_id: payload.user_id,
    p_cash_register_id: payload.cash_register_id,
    p_cash_session_id: payload.cash_session_id,
    p_payment_method: payload.payment_method,
    p_items: payload.items as Json,
  })

  if (error) throw this.handleRPCError(error)
  if (!data) throw new Error('No se recibió respuesta del servidor')

  return data
}

// ─── Responsabilidad 3: obtener la venta creada ────────────────────────────

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
      sale: { id: saleId } as Sale,
      sale_items: [],
      stock_movements: [],
      cash_movement: null,
    }
  }

  return {
    sale: data,
    sale_items: [],
    stock_movements: [],
    cash_movement: null,
  }
}

// ─── Orquestador público ────────────────────────────────────────────────────

async createSale(params: CreateSaleInputParams): Promise<CreateSaleResponse> {
  const payload = this.buildSalePayload(params)
  const saleId = await this.executeSaleRPC(payload)
  return this.fetchSaleById(saleId, params.tenant_id)
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
  private validateSaleParams(params: CreateSaleParams): void {debugger
    if (!params.tenant_id) {
      throw new Error('tenant_id es requerido')
    }

    if (!params.user_id) {
      throw new Error('user_id es requerido')
    }

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

    // Errores comunes
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
}

export const saleService = new SaleService()
