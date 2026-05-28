'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cashService } from '@/services/cash.service'
import { cashRealtimeService } from '@/services/cash-realtime.service'
import { useTenant } from '@/hooks/use-tenant'
import { debounce } from '@/lib/utils/debounce'
import type { CashMovementWithUser } from '@/types/cash'

interface UseCashMovementsOptions {
  cashRegisterId?: string
  autoLoad?: boolean
  limit?: number
}

const DEBOUNCE_DELAY = 300 // ms

export function useCashMovements(options: UseCashMovementsOptions = {}) {
  const { cashRegisterId, autoLoad = true, limit = 50 } = options
  const { tenant } = useTenant()
  const [movements, setMovements] = useState<CashMovementWithUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const loadMovements = useCallback(async () => {
    if (!cashRegisterId) return

    try {
      setLoading(true)
      setError(null)
      const data = await cashService.getCashMovements(cashRegisterId, limit)
      setMovements(data)
    } catch (err) {
      console.error('Error loading cash movements:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar los movimientos')
    } finally {
      setLoading(false)
    }
  }, [cashRegisterId, limit])

  // Debounced refresh to prevent excessive API calls
  const debouncedRefreshRef = useRef<(() => void) | null>(null)
  
  useEffect(() => {
    debouncedRefreshRef.current = debounce(() => {
      if (cashRegisterId) {
        loadMovements()
      }
    }, DEBOUNCE_DELAY)
  }, [cashRegisterId, loadMovements])

  // Initial load
  useEffect(() => {
    if (autoLoad) {
      loadMovements()
    }
  }, [autoLoad, loadMovements])

  // Setup Realtime subscription
  useEffect(() => {
    if (!cashRegisterId || !tenant?.id) {
      setRealtimeConnected(false)
      return
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[useCashMovements] Setting up realtime subscription')
    }

    // Subscribe to cash movements changes
    const unsubscribe = cashRealtimeService.subscribeToCashMovements(
      cashRegisterId,
      tenant.id,
      {
        onInsert: () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[useCashMovements] Movement inserted, refreshing...')
          }
          debouncedRefreshRef.current?.()
        },
        onUpdate: () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[useCashMovements] Movement updated, refreshing...')
          }
          debouncedRefreshRef.current?.()
        },
        onDelete: () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[useCashMovements] Movement deleted, refreshing...')
          }
          debouncedRefreshRef.current?.()
        },
        onError: (err) => {
          console.error('[useCashMovements] Realtime error:', err)
          setRealtimeConnected(false)
        },
      }
    )

    unsubscribeRef.current = unsubscribe
    setRealtimeConnected(true)

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      setRealtimeConnected(false)
    }
  }, [cashRegisterId, tenant?.id])

  const refresh = useCallback(() => {
    loadMovements()
  }, [loadMovements])

  return {
    movements,
    loading,
    error,
    refresh,
    total: movements.length,
    realtimeConnected,
  }
}
