import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CashRegister } from '@/types'

interface CashRegisterStore {
  activeCashRegister: CashRegister | null
  setActiveCashRegister: (cashRegister: CashRegister | null) => void
  clearActiveCashRegister: () => void
}

export const useCashRegisterStore = create<CashRegisterStore>()(
  persist(
    (set) => ({
      activeCashRegister: null,

      setActiveCashRegister: (cashRegister) => {
        set({ activeCashRegister: cashRegister })
      },

      clearActiveCashRegister: () => {
        set({ activeCashRegister: null })
      },
    }),
    {
      name: 'cash-register-storage',
    }
  )
)
