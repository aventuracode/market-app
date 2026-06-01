import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProductWithCategory } from '@/types/product'
import { getProductStep } from '@/lib/product-helpers'

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
        return get().items.reduce(
          (total, item) => total + item.product.sale_price * item.quantity,
          0
        )
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
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
        const newQuantity = item.quantity + step

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
              // Log temporal para debugging
              if (process.env.NODE_ENV === 'development') {
                console.log('[Cart] Increase quantity:', {
                  product: i.product.name,
                  oldQuantity: i.quantity,
                  newQuantity,
                  step,
                  decimal: i.product.allow_decimal,
                  stock: i.product.stock
                })
              }

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
        const newQuantity = item.quantity - step

        // Log temporal para debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('[Cart] Decrease quantity:', {
            product: item.product.name,
            oldQuantity: item.quantity,
            newQuantity,
            step,
            decimal: item.product.allow_decimal
          })
        }

        // Si la nueva cantidad es <= 0, remover el item
        if (newQuantity <= 0) {
          get().removeItem(productId)
        } else {
          set((state) => ({
            items: state.items.map((i) =>
              i.product.id === productId
                ? { ...i, quantity: newQuantity }
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
