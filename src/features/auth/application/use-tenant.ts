'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/shared/supabase/client'
import { useAuthStore } from '@/features/auth/application/stores/auth.store'
import type { Tenant } from '@/types'

export function useTenant() {
  const { user } = useAuthStore()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const fetchedRef = useRef<string | null>(null)

  useEffect(() => {
    const fetchTenant = async () => {
      if (!user?.tenant_id) {
        setTenant(null)
        setLoading(false)
        fetchedRef.current = null
        return
      }

      // Evitar re-fetch si ya tenemos el tenant correcto
      if (fetchedRef.current === user.tenant_id && tenant?.id === user.tenant_id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', user.tenant_id)
          .single()

        if (data) {
          setTenant({
            ...data,
            created_at: data.created_at ?? new Date().toISOString(),
          })
          fetchedRef.current = user.tenant_id
        }
      } catch (error) {
        console.error('Error fetching tenant:', error)
        setTenant(null)
        fetchedRef.current = null
      } finally {
        setLoading(false)
      }
    }

    fetchTenant()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.tenant_id])

  return {
    tenant,
    loading,
    tenantId: user?.tenant_id ?? null,
  }
}
