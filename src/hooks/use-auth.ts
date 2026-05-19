'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth.store'
import type { User } from '@/types'

export function useAuth() {
  const { user, setUser, clearUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (userData) {
            setUser(userData as User)
          }
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userData) {
          setUser(userData as User)
        }
      } else if (event === 'SIGNED_OUT') {
        clearUser()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, setUser, clearUser])

  return {
    user,
    loading,
    isAuthenticated: !!user,
  }
}
