export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER'

export type SaleStatus = 'COMPLETED' | 'PENDING' | 'CANCELLED'

export interface SaleItem {
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface CreateSaleParams {
  tenant_id: string
  user_id: string
  cash_register_id: string
  cash_session_id: string
  payment_method: PaymentMethod
  items: SaleItem[]
}

export interface Sale {
  id: string
  tenant_id: string
  user_id: string
  sale_number: string
  payment_method: PaymentMethod
  subtotal: number
  tax: number
  discount: number
  total: number
  status: SaleStatus
  created_at: string
  updated_at: string
}

export interface SaleItemResponse extends SaleItem {
  id: string
  sale_id: string
  product_name?: string
}

export interface StockMovement {
  id: string
  product_id: string
  quantity: number
  movement_type: 'SALE' | 'PURCHASE' | 'ADJUSTMENT'
  reference_id: string
}

export interface CashMovement {
  id: string
  amount: number
  movement_type: 'INCOME' | 'EXPENSE'
  reference_id: string
  description: string
}

export interface CreateSaleResponse {
  sale: Sale
  sale_items: SaleItemResponse[]
  stock_movements: StockMovement[]
  cash_movement: CashMovement | null
}

export interface CheckoutState {
  loading: boolean
  success: boolean
  error: string | null
  saleNumber: string | null
}
