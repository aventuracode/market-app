import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { money } from '@/lib/money'
import type { ProductWithCategory } from '@/types/product'
import { getProductStep } from '@/lib/product-helpers'
import { roundWeight } from '@/lib/utils/weight'

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

interface CartStore {
  items: CartItem[]
  addItem: (product: ProductWithCategory, quantity?: number) => StockValidationResult
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => StockValidationResult
  increaseQuantity: (productId: string) => StockValidationResult
  decreaseQuantity: (productId: string) => void
  clearCart: () => void
  getTotal: () => number
  getSubtotal: () => number
  getItemCount: () => number
  getItem: (productId: string) => CartItem | undefined
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const existingItem = get().items.find(
          (item) => item.product.id === product.id
        )
        const currentQuantity = existingItem?.quantity || 0
        const newQuantity = currentQuantity + quantity

        // Validar stock disponible
        if (newQuantity > product.stock) {
          return {
            success: false,
            error: 'INSUFFICIENT_STOCK',
            available: product.stock - currentQuantity,
            requested: quantity,
            current: currentQuantity
          }
        }

        set((state) => {
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            }
          }

          return {
            items: [...state.items, { product, quantity }],
          }
        })

        return { success: true }
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return { success: true }
        }

        const item = get().items.find((i) => i.product.id === productId)
        if (!item) {
          return { success: false, error: 'ITEM_NOT_FOUND' }
        }

        // Validar stock disponible
        if (quantity > item.product.stock) {
          return {
            success: false,
            error: 'INSUFFICIENT_STOCK',
            available: item.product.stock,
            requested: quantity,
            current: item.quantity
          }
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }))

        return { success: true }
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        const total = get().items.reduce(
          (sum, item) => sum + money(item.product.sale_price) * item.quantity,
          0
        )
        return money(total)
      },

      getItemCount: () => {
        const total = get().items.reduce((count, item) => count + item.quantity, 0)
        return roundWeight(total)
      },

      getItem: (productId) => {
        return get().items.find((item) => item.product.id === productId)
      },

      increaseQuantity: (productId) => {
        const item = get().items.find((i) => i.product.id === productId)
        if (!item) {
          return { success: false, error: 'ITEM_NOT_FOUND' }
        }

        const step = getProductStep(item.product)
        const newQuantity = roundWeight(item.quantity + step)

        // Validar stock disponible
        if (newQuantity > item.product.stock) {
          return {
            success: false,
            error: 'INSUFFICIENT_STOCK',
            available: item.product.stock,
            current: item.quantity
          }
        }

        set((state) => ({
          items: state.items.map((i) => {
            if (i.product.id === productId) {
              return { ...i, quantity: newQuantity }
            }
            return i
          }),
        }))

        return { success: true }
      },

      decreaseQuantity: (productId) => {
        const item = get().items.find((i) => i.product.id === productId)
        if (!item) return

        const step = getProductStep(item.product)
        const newQuantity = roundWeight(item.quantity - step)

        // Si la nueva cantidad es <= 0, remover el item
        if (newQuantity <= 0) {
          get().removeItem(productId)
        } else {
          set((state) => ({
            items: state.items.map((i) =>
              i.product.id === productId
                ? { ...i, quantity: roundWeight(newQuantity) }
                : i
            ),
          }))
        }
      },

      getSubtotal: () => {
        return get().getTotal()
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
