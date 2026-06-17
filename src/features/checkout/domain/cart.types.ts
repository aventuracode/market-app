import type { ProductWithCategory } from '@/features/products/domain/product'

export interface CartItem {
  product: ProductWithCategory
  quantity: number
}

export interface StockValidationResult {
  success: boolean
  error?: 'INSUFFICIENT_STOCK' | 'ITEM_NOT_FOUND'
  available?: number
  current?: number
  requested?: number
}