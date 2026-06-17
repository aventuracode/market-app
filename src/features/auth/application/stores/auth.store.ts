import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,

      setUser: (user) => {
        set({ user })
      },

      clearUser: () => {
        set({ user: null })
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
