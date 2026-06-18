'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cashService } from '@/features/cash/infrastructure/cash.service'
import { cashRealtimeService } from '@/features/cash/infrastructure/cash-realtime.service'
import { useTenant } from '@/features/auth/application/use-tenant'
import { debounce } from '@/shared/utils'
import { CashMovementWithUser } from '../domain/cash'

interface UseCashMovementsOptions {
  sessionId?: string
  autoLoad?: boolean
  limit?: number
}

const DEBOUNCE_DELAY = 300 // ms

export function useCashMovements(options: UseCashMovementsOptions = {}) {
  const { sessionId, autoLoad = true, limit = 50 } = options
  const { tenant } = useTenant()
  const [movements, setMovements] = useState<CashMovementWithUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const loadMovements = useCallback(async () => {
    if (!sessionId) return

    try {
      setLoading(true)
      setError(null)
      const data = await cashService.getCashMovements(sessionId, limit)
      setMovements(data)
    } catch (err) {
      console.error('Error loading cash movements:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar los movimientos')
    } finally {
      setLoading(false)
    }
  }, [sessionId, limit])

  // Debounced refresh to prevent excessive API calls
  const debouncedRefreshRef = useRef<(() => void) | null>(null)
  
  useEffect(() => {
    debouncedRefreshRef.current = debounce(() => {
      if (sessionId) {
        loadMovements()
      }
    }, DEBOUNCE_DELAY)
  }, [sessionId, loadMovements])

  // Initial load
  useEffect(() => {
    if (autoLoad) {
      loadMovements()
    }
  }, [autoLoad, loadMovements])

  // Setup Realtime subscription
  useEffect(() => {
    if (!sessionId || !tenant?.id) {
      setRealtimeConnected(false)
      return
    }

    // Subscribe to cash movements changes
    const unsubscribe = cashRealtimeService.subscribeToCashMovements(
      sessionId,
      tenant.id,
      {
        onInsert: () => {
          debouncedRefreshRef.current?.()
        },
        onUpdate: () => {
          debouncedRefreshRef.current?.()
        },
        onDelete: () => {
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
  }, [sessionId, tenant?.id])

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
