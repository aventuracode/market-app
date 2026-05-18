export type Role = 'ADMIN' | 'CAJERO' | 'SUPERVISOR'

export interface User {
  id: string
  email: string
  role: Role
  tenant_id: string
  created_at: string
}

export interface Tenant {
  id: string
  name: string
  created_at: string
}

export interface Product {
  id: string
  tenant_id: string
  name: string
  barcode: string | null
  price: number
  stock: number
  category_id: string | null
  created_at: string
}

export interface Category {
  id: string
  tenant_id: string
  name: string
  created_at: string
}

export interface Sale {
  id: string
  tenant_id: string
  user_id: string
  cash_register_id: string
  total: number
  payment_method: string
  created_at: string
}

export interface SaleDetail {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface CashRegister {
  id: string
  tenant_id: string
  name: string
  is_active: boolean
  created_at: string
}

export interface CashMovement {
  id: string
  cash_register_id: string
  user_id: string
  type: 'APERTURA' | 'CIERRE' | 'VENTA' | 'RETIRO' | 'INGRESO'
  amount: number
  description: string | null
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}
