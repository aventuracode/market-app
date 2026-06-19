'use client'

import { useState, useEffect, useCallback } from 'react'
import { stockMovementService } from '@/features/products/infrastructure/stock-movement.service'
import { useTenant } from '@/features/auth'
import type { StockMovementFull, StockMovementFilters, StockSummary } from '@/features/products/domain/stock'

interface UseStockMovementsOptions {
  productId?: string
  autoLoad?: boolean
}

export function useStockMovements(options: UseStockMovementsOptions = {}) {
  const { productId, autoLoad = true } = options
  const { tenant } = useTenant()
  const [movements, setMovements] = useState<StockMovementFull[]>([])
  const [summary, setSummary] = useState<StockSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<StockMovementFilters>({
    product_id: productId,
    limit: 50,
  })

  const loadMovements = useCallback(async () => {
    if (!tenant?.id) return

    try {
      setLoading(true)
      setError(null)
      const data = await stockMovementService.getStockMovements(tenant.id, filters)
      setMovements(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los movimientos')
    } finally {
      setLoading(false)
    }
  }, [tenant?.id, filters])

  const loadSummary = useCallback(async () => {
    if (!tenant?.id || !productId) return

    try {
      const data = await stockMovementService.getStockSummary(tenant.id, productId)
      setSummary(data)
    } catch (err) {
      // Error silencioso en summary
    }
  }, [tenant?.id, productId])

  useEffect(() => {
    if (autoLoad) {
      loadMovements()
      if (productId) {
        loadSummary()
      }
    }
  }, [autoLoad, loadMovements, loadSummary, productId])

  const refresh = useCallback(() => {
    loadMovements()
    if (productId) {
      loadSummary()
    }
  }, [loadMovements, loadSummary, productId])

  const updateFilters = useCallback((newFilters: Partial<StockMovementFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  return {
    movements,
    summary,
    loading,
    error,
    filters,
    updateFilters,
    refresh,
    total: movements.length,
  }
}
