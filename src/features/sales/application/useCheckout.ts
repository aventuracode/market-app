'use client'

// ─── use-checkout.ts ────────────────────────────────────────────────────────
// Orquestador principal — solo coordina, no implementa lógica de negocio
// Cada responsabilidad vive en su propio hook

import { useCallback } from 'react'
import { toast } from 'sonner'
import { saleService } from '@/features/sales/infrastructure/sale.service'
import { useCartStore } from '@/stores/cart.store'
import { useCashStore } from '@/stores/cash.store'
import { useTenant } from '@/hooks/use-tenant'
import { useCheckoutGuards } from './useCheckoutGuards'
import type { CreateSaleResponse } from '@/features/sales/domain/sale.types'
import { useCheckoutState } from './useCheckoutState'
import { PaymentMethod } from '../domain/sales.types'
import { useCheckoutItems } from './useCheckoutItems'
import { useAuthStore } from '@/stores/auth.store'

interface UseCheckoutOptions {
  onSuccess?: (response: CreateSaleResponse) => void
  onError?: (error: Error) => void
}

export function useCheckout(options: UseCheckoutOptions = {}) {
  const { state, setLoading, setSuccess, setError, reset } = useCheckoutState()

  const { items, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const { tenant } = useTenant()
  const activeSession = useCashStore((s) => s.activeSession)

  const { assertSessionReady } = useCheckoutGuards({ user, tenant, activeSession, items })
  const { buildSaleItems, assertStockAvailability } = useCheckoutItems(items)

  const checkout = useCallback(
    async (paymentMethod: PaymentMethod) => {
      setLoading()

      try {
        // SRP: cada guard valida una sola cosa
        assertSessionReady()

        // SRP: validación de stock separada del flujo principal
        const stockErrors = assertStockAvailability()
        if (stockErrors.length > 0) {
          toast.error('Stock insuficiente', { description: stockErrors.join(', ') })
          throw new Error('Algunos productos no tienen stock suficiente')
        }

        // SRP: construcción y sanitización de items delegada
        const saleItems = buildSaleItems()
debugger
        const response = await saleService.createSale({
          tenant_id: tenant!.id,
          user_id: user!.id,
          cash_register_id: activeSession!.cash_register_id,
          cash_session_id: activeSession!.id,
          payment_method: paymentMethod,
          items: saleItems,
        })
debugger
        setSuccess(response.sale.sale_number)
        clearCart()
        options.onSuccess?.(response)

        return response
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al procesar la venta'
        setError(message)
        options.onError?.(error instanceof Error ? error : new Error(message))
        throw error
      }
    },
    [items, user, tenant, activeSession, clearCart, options,
     assertSessionReady, assertStockAvailability, buildSaleItems,
     setLoading, setSuccess, setError]
  )

  return { checkout, reset, ...state }
}








