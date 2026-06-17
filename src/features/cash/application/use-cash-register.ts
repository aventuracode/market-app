'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cashService } from '@/features/cash/infrastructure/cash.service'
import { cashRealtimeService } from '@/features/cash/infrastructure/cash-realtime.service'
import { useTenant } from '@/features/auth/application/use-tenant'
import { useAuthStore } from '@/features/auth/application/stores/auth.store'
import { useCashStore } from '@/features/cash/application/stores/cash.store'
import { debounce } from '@/lib/utils/debounce'
import { CashSummary } from '../domain/cash'

const DEBOUNCE_DELAY = 500 // ms
const POLLING_INTERVAL = 30000 // 30 seconds fallback

export function useCashRegister() {
  const { tenant } = useTenant()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  
  // Usar selectores reactivos para que se actualicen automáticamente
  const activeCashRegister = useCashStore((state) => state.activeCashRegister)
  const activeSession = useCashStore((state) => state.activeSession)
  const currentBalance = useCashStore((state) => state.currentBalance)
  const setActiveCash = useCashStore((state) => state.setActiveCash)
  const updateBalance = useCashStore((state) => state.updateBalance)
  const clearActiveCash = useCashStore((state) => state.clearActiveCash)

  const [summary, setSummary] = useState<CashSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const loadActiveCash = useCallback(async () => {
    if (!tenant?.id || !user?.id) return

    try {
      setLoading(true)
      setError(null)
      const data = await cashService.getActiveCashRegister(tenant.id, user.id)
      
      if (data) {
        setActiveCash(data.register, data.session)
        
        // Invalidar queries de ventas cuando cambia la sesión
        await queryClient.invalidateQueries({ 
          queryKey: ['sales'] 
        })
      } else {
        clearActiveCash()
        
        // También invalidar cuando se cierra la caja
        await queryClient.invalidateQueries({ 
          queryKey: ['sales'] 
        })
      }
    } catch (err) {
      console.error('Error loading active cash:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar la caja')
    } finally {
      setLoading(false)
    }
  }, [tenant?.id, user?.id, setActiveCash, clearActiveCash, queryClient])

  const loadSummary = useCallback(async () => {
    if (!activeSession?.id) return

    try {
      const data = await cashService.getCashSummary(activeSession.id)
      setSummary(data)
      updateBalance(data.current_balance)
    } catch (err) {
      console.error('Error loading summary:', err)
    }
  }, [activeSession?.id, updateBalance])

  // Debounced refresh to prevent excessive API calls
  const debouncedRefreshSummaryRef = useRef<(() => void) | null>(null)
  
  useEffect(() => {
    debouncedRefreshSummaryRef.current = debounce(() => {
      if (activeSession?.id) {
        loadSummary()
      }
    }, DEBOUNCE_DELAY)
  }, [activeSession?.id, loadSummary])

  // Load active cash on mount
  useEffect(() => {
    loadActiveCash()
  }, [loadActiveCash])

  // Load summary when session becomes active
  useEffect(() => {
    if (activeSession) {
      loadSummary()
    }
  }, [activeSession?.id])

  // Setup Realtime subscription
  useEffect(() => {
    if (!activeSession?.cash_register_id || !tenant?.id) {
      setRealtimeConnected(false)
      return
    }

    // Subscribe to cash movements changes
    const unsubscribe = cashRealtimeService.subscribeToCashMovements(
      activeSession.cash_register_id,
      tenant.id,
      {
        onInsert: () => {
          debouncedRefreshSummaryRef.current?.()
        },
        onUpdate: () => {
          debouncedRefreshSummaryRef.current?.()
        },
        onDelete: () => {
          debouncedRefreshSummaryRef.current?.()
        },
        onError: (err) => {
          console.error('[useCashRegister] Realtime error:', err)
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
  }, [activeSession?.cash_register_id, tenant?.id])

  // Polling fallback (only if realtime is not connected)
  useEffect(() => {
    if (!activeSession || realtimeConnected) {
      // Clear polling if realtime is working
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      return
    }

    // Setup polling fallback
    pollingIntervalRef.current = setInterval(() => {
      loadSummary()
    }, POLLING_INTERVAL)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [activeSession, realtimeConnected, loadSummary])

  const refresh = useCallback(() => {
    loadActiveCash()
    if (activeSession) {
      loadSummary()
    }
  }, [loadActiveCash, loadSummary, activeSession])

  return {
    activeCashRegister,
    activeSession,
    currentBalance,
    summary,
    loading,
    error,
    refresh,
    isOpen: !!activeSession,
    realtimeConnected,
  }
}
