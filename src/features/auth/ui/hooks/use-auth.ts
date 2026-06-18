'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '../../application/stores/auth.store'
import { authService } from '../../application/auth.service'
import type { UserProfile } from '../../domain/auth.types'

/**
 * Auth hook
 * Manages authentication state using authService
 */
export function useAuth() {
  const { user, setUser, clearUser } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userProfile = await authService.getCurrentUserProfile()
        
        if (userProfile) {
          setUser(userProfile as never)
        } else {
          clearUser()
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        clearUser()
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const userProfile = await authService.getCurrentUserProfile()
            if (userProfile) {
              setUser(userProfile as never)
            }
          } catch (error) {
            console.error('Error fetching user on auth change:', error)
          }
        } else if (event === 'SIGNED_OUT') {
          clearUser()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    user: user as UserProfile | null,
    loading,
    isAuthenticated: !!user,
  }
}
