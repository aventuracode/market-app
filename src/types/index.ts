import type { Database } from './supabase.generated'

type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Role = 'ADMIN' | 'CAJERO' | 'SUPERVISOR'

export type User = Omit<Tables<'users'>, 'is_active' | 'created_at' | 'updated_at' | 'role_id'> & {
  email?: string
  role?: Role
  role_id: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Tenant = Omit<Tables<'tenants'>, 'created_at'> & {
  created_at: string
}

// TODO: These types are duplicates - use types from product.ts and cash.ts instead
// Keeping for backwards compatibility during migration
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
