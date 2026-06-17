import type { Money } from '@/lib/money'
import type { ProductWithCategory, UnitType } from '@/features/products/domain/product'

export interface CartItem {
  id: string
  product: ProductWithCategory
  quantity: number
  unitPrice: Money
  subtotal: Money
}

export interface CartState {
  items: CartItem[]
  total: Money
  itemCount: number
}

export interface AddItemResult {
  success: boolean
  error?: 'INSUFFICIENT_STOCK' | 'INVALID_QUANTITY'
  available?: number
}

export interface CartOperations {
  addItem: (product: ProductWithCategory, quantity: number) => AddItemResult
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getItem: (productId: string) => CartItem | undefined
  getItemCount: () => number
  getTotal: () => Money
}

export interface CartValidation {
  hasStock: (product: ProductWithCategory, requestedQuantity: number) => boolean
  getAvailableStock: (product: ProductWithCategory, currentCartQuantity: number) => number
  isValidQuantity: (quantity: number, unitType: UnitType) => boolean
}
