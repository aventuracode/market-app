'use client'

import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { stockMovementService } from '@/features/products/infrastructure/stock-movement.service'
import { useTenant } from '@/features/auth'
import { useAuthStore } from '@/features/auth'
import { stockAdjustmentSchema, type StockAdjustmentFormData } from '@/features/products/domain/stock'
import type { StockMovement } from '@/features/products/domain/stock'

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
      reason: 'adjustment',
      quantity: 1,
      operation: 'increase',
      notes: '',
    },
  })

const onSubmit: SubmitHandler<StockAdjustmentFormData> = async (data) => {
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
        data.reason,
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
const handleSubmit = form.handleSubmit(onSubmit)
  return {
    form,
    loading,
    onSubmit:handleSubmit
  }
}
