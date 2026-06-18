'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/shared/supabase/client'
import { useAuthStore } from '@/features/auth/application/stores/auth.store'
import type { User } from '@/types'

const ROLE_MAP = {
  1: 'ADMIN',
  2: 'CAJERO',
  3: 'SUPERVISOR',
} as const

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
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle()

        if (userError) {
          console.error('Error fetching user data:', userError)
        }

        if (userData && typeof userData === 'object') {
          const userRecord = userData as Record<string, unknown>

          const mappedUser = {
            ...userRecord,
            role: ROLE_MAP[
              Number(userRecord.role_id) as keyof typeof ROLE_MAP
            ]
          }

          setUser(mappedUser as User)
        } else {
          // Fallback a datos básicos de auth si no hay datos en la tabla
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
          } satisfies User)
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
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (error) {
          console.error('Error fetching user on auth change:', error)
        }

        if (userData && typeof userData === 'object') {
          const userRecord = userData as Record<string, unknown>

          const mappedUser = {
            ...userRecord,
            role: ROLE_MAP[
              Number(userRecord.role_id) as keyof typeof ROLE_MAP
            ]
          }

          setUser(mappedUser as User)
        }
      } else if (event === 'SIGNED_OUT') {
        clearUser()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user,
  }
}
