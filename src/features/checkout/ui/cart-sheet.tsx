'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CartItem } from '../ui/cart-item'
import { CartSummary } from '../ui/cart-summary'
import { EmptyCart } from '../ui/empty-cart'
import { useCartStore } from '@/features/checkout/application/stores/cart.store'
import { CheckoutModal } from './checkout-modal'

interface CartSheetProps {
  open: boolean
  onClose: () => void
}

export function CartSheet({ open, onClose }: CartSheetProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const { 
    items, 
    increaseQuantity, 
    decreaseQuantity, 
    removeItem,
    updateQuantity, 
    clearCart,
    getTotal,
    getSubtotal,
    getItemCount 
  } = useCartStore()

  const total = getTotal()
  const subtotal = getSubtotal()
  const itemCount = getItemCount()

  // Prevent body scroll when sheet is open
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

  const handleCheckout = () => {
    setCheckoutOpen(true)
  }

  const handleCheckoutSuccess = () => {
    setCheckoutOpen(false)
    onClose()
  }

  const handleClear = () => {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      clearCart()
    }
  }

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
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-background z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-background/95 backdrop-blur-sm">
              <div>
                <h2 className="text-2xl font-bold">
                  Carrito
                </h2>
                {items.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <EmptyCart />
              ) : (
                <div className="p-4 space-y-3">
                  {items.map((item) => (
                    <CartItem
                      key={item.product.id}
                      item={item}
                      onIncrease={increaseQuantity}
                      onDecrease={decreaseQuantity}
                      onRemove={removeItem}
                      onUpdateQuantity={updateQuantity}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Summary */}
            {items.length > 0 && (
              <div className="border-t bg-background/95 backdrop-blur-sm p-5 pb-safe shadow-lg">
                <CartSummary
                  subtotal={subtotal}
                  total={total}
                  itemCount={itemCount}
                  onCheckout={handleCheckout}
                  onClear={handleClear}
                />
              </div>
            )}
          </motion.div>

          {/* Checkout Modal */}
          <CheckoutModal
            open={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            onSuccess={handleCheckoutSuccess}
          />
        </>
      )}
    </AnimatePresence>
  )
}
