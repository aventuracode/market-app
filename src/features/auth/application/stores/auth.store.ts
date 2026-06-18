import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile } from '../../domain/auth.types'

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
