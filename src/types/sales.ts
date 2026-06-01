/**
 * Tipos para el sistema de ventas
 */

export interface Sale {
  id: string
  tenant_id: string
  user_id: string
  cash_register_id: string
  sale_number: string
  total: number
  subtotal: number
  tax: number
  discount: number
  payment_method: 'CASH' | 'CARD' | 'TRANSFER'
  status: 'COMPLETED' | 'CANCELLED' | 'PENDING'
  created_at: string
  updated_at: string
  notes?: string | null
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  discount: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  sku: string | null
  barcode: string | null
}

export interface SaleUser {
  id: string
  first_name: string
  last_name: string
}

export interface CashRegister {
  id: string
  name: string
}

export interface SaleItemWithProduct extends SaleItem {
  products: Product
}

export interface SaleWithDetails extends Sale {
  sale_items: SaleItemWithProduct[]
  users: SaleUser
  cash_registers: CashRegister
}

export interface SalesStats {
  totalSales: number
  salesCount: number
  averageTicket: number
  totalCash: number
  totalCard: number
  totalTransfer: number
}

export type SalesPeriod = 'all' | 'today' | 'week' | 'month'
