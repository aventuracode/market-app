'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle2, AlertCircle, Loader2, Receipt } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PaymentMethodSelector } from './payment-method-selector'
import { useCheckout } from '@/hooks/use-checkout'
import { useCartStore } from '@/stores/cart.store'
import type { PaymentMethod } from '@/types/sale'
import { formatWeight } from '@/lib/utils/weight'

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CheckoutModal({ open, onClose, onSuccess }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [checkoutTotal, setCheckoutTotal] = useState(0)

  const { items, getTotal } = useCartStore()
  const { checkout, loading, success, error, saleNumber, reset } = useCheckout({
    onSuccess: () => {
      // Vibrate on success
      if (navigator.vibrate) {
        navigator.vibrate(200)
      }
      
      // Auto close after 2s
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    },
    onError: () => {
      // Vibrate error pattern
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100])
      }
    },
  })

  const total = getTotal()
  const subtotal = total
  const tax = 0
  const discount = 0

  // Reset states when opening
  useEffect(() => {
    if (open) {
      setPaymentMethod(null)
      reset()
    }
  }, [open, reset])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price)
  }

  const handleCheckout = async () => {
    if (!paymentMethod) {
      return
    }

    // Guardar total antes de que se limpie el carrito
    setCheckoutTotal(total)

    try {
      await checkout(paymentMethod)
    } catch (err) {
      // Error is already handled by useCheckout
      console.error('Checkout error:', err)
    }
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-4 bottom-20 sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg sm:max-h-[90vh] z-50"
          >
            <div className="bg-background rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-bold">Finalizar venta</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatWeight(itemCount)} {itemCount === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                  disabled={loading}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Payment Method Selector */}
                <PaymentMethodSelector
                  selected={paymentMethod}
                  onSelect={setPaymentMethod}
                />

                <Separator />

                {/* Summary */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  
                  {tax > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Impuestos</span>
                      <span className="font-medium">{formatPrice(tax)}</span>
                    </div>
                  )}
                  
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Descuento</span>
                      <span className="font-medium text-green-600">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="border-t p-6 space-y-4 flex-shrink-0 bg-background">
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl"
                  >
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full text-base"
                    onClick={handleCheckout}
                    disabled={!paymentMethod || loading || success}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        ¡Venta completada!
                      </>
                    ) : (
                      `Cobrar ${formatPrice(total)}`
                    )}
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Success Overlay */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="text-center space-y-4"
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-success flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">
                      ¡Venta exitosa!
                    </h3>
                    {saleNumber && (
                      <div className="flex items-center justify-center gap-2 text-white/90">
                        <Receipt className="h-4 w-4" />
                        <span className="text-sm font-mono">#{saleNumber}</span>
                      </div>
                    )}
                    <p className="text-lg text-white/70">
                      {formatPrice(checkoutTotal)} cobrados
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
