'use client'

import { useState, useCallback } from 'react'
import { saleService } from '@/services/sale.service'
import { useCartStore } from '@/stores/cart.store'
import { useAuthStore } from '@/stores/auth.store'
import { useTenant } from '@/hooks/use-tenant'
import type { PaymentMethod, CreateSaleResponse, CheckoutState } from '@/types/sale'

interface UseCheckoutOptions {
  onSuccess?: (response: CreateSaleResponse) => void
  onError?: (error: Error) => void
}

export function useCheckout(options: UseCheckoutOptions = {}) {
  const [state, setState] = useState<CheckoutState>({
    loading: false,
    success: false,
    error: null,
    saleNumber: null,
  })

  const { items, getTotal, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const { tenant } = useTenant()

  const checkout = useCallback(
    async (paymentMethod: PaymentMethod) => {
      // Reset state
      setState({
        loading: true,
        success: false,
        error: null,
        saleNumber: null,
      })

      try {
        // Validaciones
        if (!user?.id) {
          throw new Error('Usuario no autenticado')
        }

        if (!tenant?.id) {
          throw new Error('No hay tenant activo')
        }

        if (items.length === 0) {
          throw new Error('El carrito está vacío')
        }

        // Preparar datos
        const saleItems = items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.sale_price,
          subtotal: item.product.sale_price * item.quantity,
        }))

        // TODO: Obtener cash_register_id del sistema de cajas
        // Por ahora usamos el ID de la caja principal existente
        const cashRegisterId = '4f11889b-9125-4469-ab22-6bcb113887da'

        // Crear venta
        const response = await saleService.createSale({
          tenant_id: tenant.id,
          user_id: user.id,
          cash_register_id: cashRegisterId,
          payment_method: paymentMethod,
          items: saleItems,
        })

        // Success
        // La RPC puede retornar la data en diferentes formatos
        const saleNumber = response.sale?.sale_number || response.sale_number || 'N/A'
        
        setState({
          loading: false,
          success: true,
          error: null,
          saleNumber: saleNumber,
        })

        // Clear cart
        clearCart()

        // Callback
        options.onSuccess?.(response)

        return response
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al procesar la venta'
        
        setState({
          loading: false,
          success: false,
          error: errorMessage,
          saleNumber: null,
        })

        // Callback
        options.onError?.(error instanceof Error ? error : new Error(errorMessage))

        throw error
      }
    },
    [items, user, tenant, getTotal, clearCart, options]
  )

  const reset = useCallback(() => {
    setState({
      loading: false,
      success: false,
      error: null,
      saleNumber: null,
    })
  }, [])

  return {
    checkout,
    reset,
    ...state,
  }
}
