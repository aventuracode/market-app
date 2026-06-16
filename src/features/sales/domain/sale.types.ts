// import type { Money } from '@/lib/money'

import { Money } from "@/lib/money"
// import { CashMovement, Sale } from "../../../types"
import { StockMovement } from "../../../types/stock"
import { Tables } from "@/types/supabase.generated"

// import type { Database } from './supabase.generated'

// export type PaymentMethod =
//   Database['public']['Enums']['payment_method']

// export type SaleStatus = 'COMPLETED' | 'PENDING' | 'CANCELLED'

export interface SaleItem {
  product_id: string
  quantity: number
  unit_price: Money
  subtotal: Money
}

// export interface CreateSaleParams {
//   tenant_id: string
//   user_id: string
//   cash_register_id: string
//   cash_session_id: string
//   payment_method: PaymentMethod
//   items: SaleItem[]
// }

// export interface Sale {
//   id: string
//   tenant_id: string
//   user_id: string
//   sale_number: string
//   payment_method: PaymentMethod
//   subtotal: Money
//   discount: Money
//   total: Money
//   status: SaleStatus
//   created_at: string | null
// }

export interface SaleItemResponse extends SaleItem {
  id: string
  sale_id: string
  product_name?: string
}

// export interface StockMovement {
//   id: string
//   product_id: string
//   quantity: number
//   movement_type: 'SALE' | 'PURCHASE' | 'ADJUSTMENT'
//   reference_id: string
// }

// export interface CashMovement {
//   id: string
//   amount: Money
//   movement_type: 'INCOME' | 'EXPENSE'
//   reference_id: string
//   description: string
// }
export type Sale = Tables<'sales'>

export type CreateSaleResponse = {
  sale: Sale
  sale_items: Tables<'sale_items'>[]
  stock_movements: Tables<'stock_movements'>[]
  cash_movement: Tables<'cash_movements'> | null
}

export interface CheckoutState {
  loading: boolean
  success: boolean
  error: string | null
  saleNumber: string | number | null
}
export function emptySale(id: string): Sale {
  return {
    id,
    tenant_id: '',
    user_id: '',
    cash_register_id: '',
    cash_session_id: '',
    payment_method: 'CASH',
    subtotal: 0,
    discount: null,
    total: 0,
    status: null,
    sale_number: 0,
    notes: null,
    created_at: null,
  }
}