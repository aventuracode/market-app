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
        if (process.env.NODE_ENV === 'development') {
          console.group('[AuthStore] setUser')
          console.log('User data:', user)
          console.log('Role:', user?.role)
          console.log('Role ID:', user?.role_id)
          console.groupEnd()
        }
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
