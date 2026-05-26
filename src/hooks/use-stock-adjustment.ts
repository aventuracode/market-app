'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { stockMovementService } from '@/services/stock-movement.service'
import { useTenant } from '@/hooks/use-tenant'
import { useAuthStore } from '@/stores/auth.store'
import { stockAdjustmentSchema, type StockAdjustmentFormData } from '@/types/stock'
import type { StockMovement } from '@/types/stock'

interface UseStockAdjustmentOptions {
  productId: string
  onSuccess?: (movement: StockMovement) => void
  onError?: (error: Error) => void
}

export function useStockAdjustment(options: UseStockAdjustmentOptions) {
  const { productId, onSuccess, onError } = options
  const { tenant } = useTenant()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const form = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      type: 'adjustment',
      quantity: 1,
      operation: 'increase',
      notes: '',
    },
  })

  const onSubmit = async (data: StockAdjustmentFormData) => {
    if (!tenant?.id || !user?.id) {
      onError?.(new Error('No hay sesión activa'))
      return
    }

    try {
      setLoading(true)

      const movement = await stockMovementService.adjustStock(
        tenant.id,
        productId,
        user.id,
        data.quantity,
        data.operation,
        data.type,
        data.notes
      )

      onSuccess?.(movement)
      form.reset()
    } catch (err) {
      console.error('Error adjusting stock:', err)
      const error = err instanceof Error ? err : new Error('Error al ajustar el stock')
      onError?.(error)
      form.setError('root', {
        message: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    loading,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
