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

        if (!authUser) {
          clearUser()
          setLoading(false)
          return
        }

        // Obtener datos adicionales del usuario
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, role_id, tenant_id, first_name, last_name, is_active, created_at, updated_at')
          .eq('id', authUser.id)
          .single()

        if (userError || !userData) {
          // Fallback a datos básicos de auth
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            role_id: null,
            tenant_id: '',
            first_name: '',
            last_name: '',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any)
        } else {
          setUser(userData as User)
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
          .select('id, email, role_id, tenant_id, first_name, last_name, is_active, created_at, updated_at')
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
