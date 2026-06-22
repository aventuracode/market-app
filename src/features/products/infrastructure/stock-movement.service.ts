import { createClient } from '@/shared/supabase/client'
import type {
  StockMovement,
  StockMovementFull,
  CreateStockMovementData,
  StockMovementFilters,
  StockSummary,
  StockMovementType,
} from '@/features/products/domain/stock'

class StockMovementService {
  private supabase = createClient()

  /**
   * Obtener movimientos de stock con filtros
   */
  async getStockMovements(
    tenantId: string,
    filters: StockMovementFilters = {}
  ): Promise<StockMovementFull[]> {
    let query = this.supabase
      .from('stock_movements')
      .select(`
        *,
        product:products!inner(id, name, barcode, sku),
        user:users(id, first_name, last_name)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    // Filtros opcionales
    if (filters.product_id) {
      query = query.eq('product_id', filters.product_id)
    }

    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date)
    }

    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message || 'Error al obtener los movimientos de stock')
    }

    return (data || []) as StockMovementFull[]
  }

  /**
   * Obtener resumen de stock de un producto
   */
  async getStockSummary(tenantId: string, productId: string): Promise<StockSummary | null> {
    const { data: product, error: productError } = await this.supabase
      .from('products')
      .select('stock')
      .eq('tenant_id', tenantId)
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return null
    }

    const { data: movements, error: movementsError } = await this.supabase
      .from('stock_movements')
      .select('type, quantity, created_at')
      .eq('tenant_id', tenantId)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (movementsError) {
      return null
    }

    const summary: StockSummary = {
      product_id: productId,
      current_stock: Number(product.stock),
      total_purchases: 0,
      total_sales: 0,
      total_adjustments: 0,
      total_damages: 0,
      last_movement_date: movements.length > 0 ? movements[0].created_at : null,
    }

    movements.forEach((movement) => {
      const qty = Number(movement.quantity)
      switch (movement.type) {
        case 'IN':
          summary.total_purchases += qty
          break
        case 'OUT':
          summary.total_sales += qty
          break
        case 'ADJUSTMENT':
          summary.total_adjustments += qty
          break
        
      }
    })

    return summary
  }

  /**
   * Crear movimiento de stock y actualizar producto
   */
  async createStockMovement(
    movementData: CreateStockMovementData
  ): Promise<StockMovement> {
    // Iniciar transacción: crear movimiento y actualizar stock del producto
    const { data: movement, error: movementError } = await this.supabase
      .from('stock_movements')
      .insert({
        tenant_id: movementData.tenant_id,
        product_id: movementData.product_id,
        type: movementData.type,
        quantity: movementData.quantity,
        previous_stock: movementData.previous_stock,
        new_stock: movementData.new_stock,
        reference_id: movementData.reference_id || null,
        notes: movementData.notes || null,
        created_by: movementData.created_by || null,
      })
      .select()
      .single()

    if (movementError) {
      if (movementError.message.includes('RLS')) {
        throw new Error('No tienes permisos para crear movimientos de stock')
      }
      
      throw new Error(movementError.message || 'Error al crear el movimiento de stock')
    }

    // Actualizar stock del producto
    const { error: updateError } = await this.supabase
      .from('products')
      .update({ stock: movementData.new_stock })
      .eq('id', movementData.product_id)
      .eq('tenant_id', movementData.tenant_id)

    if (updateError) {
      // Intentar revertir el movimiento creado
      await this.supabase
      .from('stock_movements')
      .delete()
      .eq('id', movement.id)
        
      
      throw new Error('Error al actualizar el stock del producto')
    }

    return movement
  }

  /**
   * Ajustar stock manualmente (aumentar o disminuir)
   */
  async adjustStock(
    tenantId: string,
    productId: string,
    userId: string,
    quantity: number,
    operation: 'increase' | 'decrease',
    reason: 'adjustment' | 'damage' | 'return' | 'transfer',
    notes: string
  ): Promise<StockMovement> {
    // Obtener stock actual del producto
    const { data: product, error: productError } = await this.supabase
      .from('products')
      .select('stock')
      .eq('tenant_id', tenantId)
      .eq('id', productId)
      .single()

    if (productError || !product) {
      throw new Error('Producto no encontrado')
    }

    const previousStock = Number(product.stock)
    const adjustmentQty = operation === 'increase' ? quantity : -quantity
    const newStock = previousStock + adjustmentQty

    if (newStock < 0) {
      throw new Error('El stock no puede ser negativo')
    }
    const movementType: StockMovementType =
      reason === 'adjustment'
        ? 'ADJUSTMENT'
        : operation === 'increase'
          ? 'IN'
          : 'OUT'

    return this.createStockMovement({
      tenant_id: tenantId,
      product_id: productId,
      type: movementType,
      quantity: Math.abs(adjustmentQty),
      previous_stock: previousStock,
      new_stock: newStock,
      notes: `[${reason.toUpperCase()}] ${notes}`,
      created_by: userId,
    })
  }

  /**
   * Registrar venta (disminuye stock)
   */
  async registerSale(
    tenantId: string,
    productId: string,
    quantity: number,
    saleId: string
  ): Promise<StockMovement> {
    const { data: product, error: productError } = await this.supabase
      .from('products')
      .select('stock')
      .eq('tenant_id', tenantId)
      .eq('id', productId)
      .single()

    if (productError || !product) {
      throw new Error('Producto no encontrado')
    }

    const previousStock = Number(product.stock)
    const newStock = previousStock - quantity

    if (newStock < 0) {
      throw new Error('Stock insuficiente para completar la venta')
    }

    return this.createStockMovement({
      tenant_id: tenantId,
      product_id: productId,
      type: 'OUT',
      quantity,
      previous_stock: previousStock,
      new_stock: newStock,
      reference_id: saleId,
      notes: 'Venta registrada',
    })
  }

  /**
   * Registrar compra (aumenta stock)
   */
  async registerPurchase(
    tenantId: string,
    productId: string,
    quantity: number,
    purchaseId?: string,
    notes?: string
  ): Promise<StockMovement> {
    const { data: product, error: productError } = await this.supabase
      .from('products')
      .select('stock')
      .eq('tenant_id', tenantId)
      .eq('id', productId)
      .single()

    if (productError || !product) {
      throw new Error('Producto no encontrado')
    }

    const previousStock = Number(product.stock)
    const newStock = previousStock + quantity

    return this.createStockMovement({
      tenant_id: tenantId,
      product_id: productId,
      type: 'IN',
      quantity,
      previous_stock: previousStock,
      new_stock: newStock,
      reference_id: purchaseId || null,
      notes: notes || 'Compra registrada',
    })
  }
}

export const stockMovementService = new StockMovementService()
