'use client'

import { useEffect, useState, useRef } from 'react'
import { authService } from './auth.service'
import { useAuthStore } from '@/features/auth'
import type { Tenant } from '../domain/auth.types'

export function useTenant() {
  const { user } = useAuthStore()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const fetchedRef = useRef<string | null>(null)

  useEffect(() => {
    const fetchTenant = async () => {
      if (!user?.tenantId) {
        setTenant(null)
        setLoading(false)
        fetchedRef.current = null
        return
      }

      // Evitar re-fetch si ya tenemos el tenant correcto
      if (fetchedRef.current === user.tenantId && tenant?.id === user.tenantId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const tenantData = await authService.getTenant(user.tenantId)

        if (tenantData) {
          setTenant(tenantData)
          fetchedRef.current = user.tenantId
        }
      } catch (error) {
        setTenant(null)
        fetchedRef.current = null
      } finally {
        setLoading(false)
      }
    }

    fetchTenant()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.tenantId])

  return {
    tenant,
    loading,
    tenantId: user?.tenantId ?? null,
  }
}
