import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CashRegister } from '../../domain/cash'

interface CashRegisterStore {
  activeCashRegister: CashRegister | null
  tenantId: string | null
  setTenantId: (id: string | null) => void
  setActiveCashRegister: (cashRegister: CashRegister | null) => void
  clearActiveCashRegister: () => void
  clearCashRegister: () => void
}

export const useCashRegisterStore = create<CashRegisterStore>()(
  persist(
    (set) => ({
      activeCashRegister: null,
      tenantId: null,

      setTenantId: (id) => {
        set({ tenantId: id })
      },

      setActiveCashRegister: (cashRegister) => {
        set({ activeCashRegister: cashRegister })
      },

      clearActiveCashRegister: () => {
        set({ activeCashRegister: null })
      },

      clearCashRegister: () => {
        set({ activeCashRegister: null, tenantId: null })
      },
    }),
    {
      name: 'cash-register-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        try {
          const raw = localStorage.getItem('auth-storage')
          const parsed = raw ? JSON.parse(raw) : null
          const activeTenantId = parsed?.state?.user?.tenantId ?? null
          if (state.tenantId !== activeTenantId) {
            state.clearCashRegister()
          }
        } catch {
          state.clearCashRegister()
        }
      },
    }
  )
)
