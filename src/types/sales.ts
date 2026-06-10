/**
 * Tipos para el sistema de ventas
 */
import type { Money } from '@/lib/money'
import type { Database } from './supabase.generated'

export type PaymentMethod =
  Database['public']['Enums']['payment_method']

export interface Sale {
  id: string
  tenant_id: string
  user_id: string
  cash_register_id: string
  sale_number: string
  total: Money
  subtotal: Money
  discount: Money
  payment_method: PaymentMethod
  status: 'COMPLETED' | 'CANCELLED' | 'PENDING'
  created_at: string | null
  notes?: string | null
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: Money
  subtotal: Money
  discount: Money
  created_at: string | null
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
  totalSales: Money
  salesCount: number
  averageTicket: Money
  totalCash: Money
  totalCard: Money
  totalTransfer: Money
}

export type SalesPeriod = 'all' | 'today' | 'week' | 'month'
