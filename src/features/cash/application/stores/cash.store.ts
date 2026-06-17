import { CashRegister } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CashSession } from '../../domain/cash'

interface CashState {
  activeCashRegister: CashRegister | null
  activeSession: CashSession | null
  currentBalance: number
  setActiveCash: (register: CashRegister, session: CashSession) => void
  updateBalance: (balance: number) => void
  clearActiveCash: () => void
}

export const useCashStore = create<CashState>()(
  persist(
    (set) => ({
      activeCashRegister: null,
      activeSession: null,
      currentBalance: 0,

      setActiveCash: (register, session) =>
        set({
          activeCashRegister: register,
          activeSession: session,
          // NO establecer currentBalance aquí - se calculará con getCashSummary
        }),

      updateBalance: (balance) => {
        set({ currentBalance: balance })
      },

      clearActiveCash: () =>
        set({
          activeCashRegister: null,
          activeSession: null,
          currentBalance: 0,
        }),
    }),
    {
      name: 'cash-storage',
      partialize: (state) => ({
        activeCashRegister: state.activeCashRegister,
        activeSession: state.activeSession,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<CashState>),
        // Siempre inicializar currentBalance en 0, se calculará después
        currentBalance: 0,
      }),
    }
  )
)
