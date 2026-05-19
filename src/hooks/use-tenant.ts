'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import type { Tenant } from '@/types'

export function useTenant() {
  const { user } = useAuth()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchTenant = async () => {
      if (!user?.tenant_id) {
        setTenant(null)
        setLoading(false)
        return
      }

      try {
        const { data } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', user.tenant_id)
          .single()

        setTenant(data)
      } catch (error) {
        console.error('Error fetching tenant:', error)
        setTenant(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTenant()
  }, [user?.tenant_id, supabase])

  return {
    tenant,
    loading,
    tenantId: user?.tenant_id ?? null,
  }
}
