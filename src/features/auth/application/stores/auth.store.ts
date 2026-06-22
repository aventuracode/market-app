import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile } from '../../domain/auth.types'
import { useCartStore } from '@/features/checkout/application/stores/cart.store'
import { useCashRegisterStore } from '@/features/cash/application/stores/cash-register.store'
import { useCashStore } from '@/features/cash/application/stores/cash.store'

interface AuthStore {
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
  clearUser: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,

      setUser: (user) => {
        const previousTenantId = get().user?.tenantId ?? null
        const newTenantId = user?.tenantId ?? null
        set({ user })
        if (previousTenantId !== newTenantId) {
          useCartStore.getState().clearCart()
          useCashRegisterStore.getState().clearCashRegister()
          useCashStore.getState().clearCash()
        }
        useCartStore.getState().setTenantId(newTenantId)
        useCashRegisterStore.getState().setTenantId(newTenantId)
        useCashStore.getState().setTenantId(newTenantId)
      },

      clearUser: () => {
        set({ user: null })
        useCartStore.getState().clearCart()
        useCashRegisterStore.getState().clearCashRegister()
        useCashStore.getState().clearCash()
      },

      isAuthenticated: () => {
        return get().user !== null
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
