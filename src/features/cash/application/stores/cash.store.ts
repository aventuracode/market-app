
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CashRegister, CashSession } from '../../domain/cash'

interface CashState {
  activeCashRegister: CashRegister | null
  activeSession: CashSession | null
  currentBalance: number
  tenantId: string | null
  setTenantId: (id: string | null) => void
  setActiveCash: (register: CashRegister, session: CashSession) => void
  updateBalance: (balance: number) => void
  clearActiveCash: () => void
  clearCash: () => void
}

export const useCashStore = create<CashState>()(
  persist(
    (set) => ({
      activeCashRegister: null,
      activeSession: null,
      currentBalance: 0,
      tenantId: null,

      setTenantId: (id) => {
        set({ tenantId: id })
      },

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

      clearCash: () =>
        set({
          activeCashRegister: null,
          activeSession: null,
          currentBalance: 0,
          tenantId: null,
        }),
    }),
    {
      name: 'cash-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          if (persistedState?.activeSession?.status) {
            persistedState.activeSession.status =
              persistedState.activeSession.status.toUpperCase()
          }
        }
        return persistedState
      },
      partialize: (state) => ({
        activeCashRegister: state.activeCashRegister,
        activeSession: state.activeSession,
        tenantId: state.tenantId,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<CashState>),
        // Siempre inicializar currentBalance en 0, se calculará después
        currentBalance: 0,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        try {
          const raw = localStorage.getItem('auth-storage')
          const parsed = raw ? JSON.parse(raw) : null
          const activeTenantId = parsed?.state?.user?.tenantId ?? null
          if (state.tenantId !== activeTenantId) {
            state.clearCash()
          }
        } catch {
          state.clearCash()
        }
      },
    }
  )
)
