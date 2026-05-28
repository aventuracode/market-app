import { createClient } from '@/lib/supabase/client'
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

      console.log('Creating sale with params:', {
        tenant_id: params.tenant_id,
        user_id: params.user_id,
        cash_register_id: params.cash_register_id,
        cash_session_id: params.cash_session_id,
        payment_method: params.payment_method,
        items_count: params.items.length,
      })

      // Llamada a RPC
      const { data, error } = await this.supabase.rpc('create_sale', {
        p_tenant_id: params.tenant_id,
        p_user_id: params.user_id,
        p_cash_register_id: params.cash_register_id,
        p_cash_session_id: params.cash_session_id,
        p_payment_method: params.payment_method,
        p_items: params.items,
      })

      if (error) {
        console.error('RPC error creating sale:', error)
        throw this.handleRPCError(error)
      }

      if (!data) {
        throw new Error('No se recibió respuesta del servidor')
      }

      console.log('Sale created successfully - Raw response:', data)

      // Si la RPC retorna solo el ID (string), consultar los detalles
      if (typeof data === 'string') {
        const saleId = data
        console.log('RPC returned sale_id, fetching details:', saleId)

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

        console.log('Sale details fetched:', {
          sale_id: saleData.id,
          sale_number: saleData.sale_number,
        })

        return {
          sale: saleData as any,
          sale_items: [],
          stock_movements: [],
          cash_movement: null,
        }
      }

      // Si retorna objeto completo
      const saleData = data.sale || data
      
      console.log('Sale created successfully:', {
        sale_id: saleData?.id,
        sale_number: saleData?.sale_number,
        items_created: data.sale_items?.length || 0,
        stock_movements: data.stock_movements?.length || 0,
      })

      return data as CreateSaleResponse
    } catch (error) {
      console.error('Error in createSale:', error)
      throw error
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
      if (item.unit_price < 0) {
        throw new Error(`Item ${index + 1}: precio no puede ser negativo`)
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
