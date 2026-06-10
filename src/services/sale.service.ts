import { createClient } from '@/lib/supabase/client'
import { money, validateCheckoutTotal, isValidMoney } from '@/lib/money'
import type { CreateSaleParams, CreateSaleResponse } from '@/types/sale'

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
  async createSale(params: CreateSaleParams): Promise<CreateSaleResponse> {
    try {
      // Validaciones previas
      this.validateSaleParams(params)
      
      // Sanitizar valores financieros antes de enviar
      const sanitizedParams = this.sanitizeSaleParams(params)

      // Llamada a RPC con parámetros sanitizados
      const { data, error } = await this.supabase.rpc('create_sale', {
        p_tenant_id: sanitizedParams.tenant_id,
        p_user_id: sanitizedParams.user_id,
        p_cash_register_id: sanitizedParams.cash_register_id,
        p_cash_session_id: sanitizedParams.cash_session_id,
        p_payment_method: sanitizedParams.payment_method,
        p_items: sanitizedParams.items,
      })

      if (error) {
        console.error('RPC error creating sale:', error)
        throw this.handleRPCError(error)
      }

      if (!data) {
        throw new Error('No se recibió respuesta del servidor')
      }

      // Si la RPC retorna solo el ID (string), consultar los detalles
      if (typeof data === 'string') {
        const saleId = data

        // Consultar la venta completa
        const { data: saleData, error: saleError } = await this.supabase
          .from('sales')
          .select('*')
          .eq('id', saleId)
          .single()

        if (saleError || !saleData) {
          console.error('Error fetching sale details:', saleError)
          // Retornar respuesta mínima con el ID
          return {
            sale: { id: saleId } as any,
            sale_items: [],
            stock_movements: [],
            cash_movement: null,
          }
        }

        return {
          sale: saleData as any,
          sale_items: [],
          stock_movements: [],
          cash_movement: null,
        }
      }

      // Si retorna objeto completo
      const saleData = data.sale || data

      return data as CreateSaleResponse
    } catch (error) {
      console.error('Error in createSale:', error)
      throw error
    }
  }

  /**
   * Sanitiza valores financieros para prevenir NaN
   */
  private sanitizeSaleParams(params: CreateSaleParams): CreateSaleParams {
    const sanitizedItems = params.items.map(item => ({
      ...item,
      unit_price: money(item.unit_price),
      subtotal: money(item.subtotal),
      quantity: item.quantity || 0,
    }))

    // Calcular y validar total
    const total = sanitizedItems.reduce((sum, item) => sum + money(item.subtotal), 0)
    validateCheckoutTotal(total)

    return {
      ...params,
      items: sanitizedItems,
    }
  }

  /**
   * Valida los parámetros de la venta
   */
  private validateSaleParams(params: CreateSaleParams): void {
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
