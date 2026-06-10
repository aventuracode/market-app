import type { Tables } from '@/lib/supabase/client'
import type { Money } from '@/lib/money'

/**
 * Venta con relaciones completas
 */
export interface SaleWithRelations extends Tables<'sales'> {
  sale_items: SaleItemWithProduct[]
  users?: {
    first_name: string
    last_name: string
  }
  cash_registers?: {
    name: string
  }
}

/**
 * Item de venta con producto
 */
export interface SaleItemWithProduct extends Tables<'sale_items'> {
  products: {
    name: string
    sku: string | null
    barcode: string | null
  }
}

/**
 * Estadísticas de ventas
 */
export interface SalesStats {
  total_sales: Money
  sales_count: number
  average_ticket: Money
  most_used_payment_method: 'CASH' | 'CARD' | 'TRANSFER'
  sales_by_payment_method: {
    CASH: Money
    CARD: Money
    TRANSFER: Money
  }
}

/**
 * Filtros de ventas para queries
 */
export interface SalesQueryFilters {
  tenant_id: string
  start_date?: string
  end_date?: string
  payment_method?: 'CASH' | 'CARD' | 'TRANSFER'
  user_id?: string
  search?: string
}
