'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { saleService } from '@/services/sale.service'
import { useCartStore } from '@/stores/cart.store'
import { useCashStore } from '@/stores/cash.store'
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
  const activeSession = useCashStore((state) => state.activeSession)

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
          console.error('[useCheckout] Tenant is null or undefined:', { user, tenant })
          throw new Error('No hay tenant activo')
        }

        if (!activeSession?.id) {
          throw new Error('No hay una sesión de caja abierta. Por favor, abre la caja antes de realizar ventas.')
        }

        if (items.length === 0) {
          throw new Error('El carrito está vacío')
        }

        // Validar stock de todos los items antes de proceder
        const stockErrors = items.filter(item => item.quantity > item.product.stock)
        if (stockErrors.length > 0) {
          const errorMessages = stockErrors.map(item => {
            const unitType = item.product.unit_type || 'UNIT'
            const unitLabel = unitType === 'UNIT' ? 'un' : unitType === 'KILOGRAM' ? 'kg' : unitType === 'GRAM' ? 'g' : unitType === 'LITER' ? 'l' : 'ml'
            return `${item.product.name}: disponible ${item.product.stock} ${unitLabel}`
          })
          
          toast.error('Stock insuficiente', {
            description: errorMessages.join(', ')
          })
          throw new Error('Algunos productos no tienen stock suficiente')
        }

        // Preparar datos
        const saleItems = items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.sale_price,
          subtotal: item.product.sale_price * item.quantity,
        }))

        // Crear venta con la sesión activa
        const response = await saleService.createSale({
          tenant_id: tenant.id,
          user_id: user.id,
          cash_register_id: activeSession.cash_register_id,
          cash_session_id: activeSession.id,
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
