'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/product-helpers'

interface CartSummaryProps {
  subtotal: number
  total: number
  itemCount: number
  onCheckout: () => void
  onClear: () => void
}

export function CartSummary({ 
  subtotal, 
  total, 
  itemCount, 
  onCheckout,
  onClear 
}: CartSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/50">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
          </span>
          <span className="font-medium">
            {formatPrice(subtotal)}
          </span>
        </div>

        <Separator className="bg-border/50" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">
            Total
          </span>
          <span className="text-3xl font-bold text-primary">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          onClick={onCheckout}
        >
          Cobrar {formatPrice(total)}
        </Button>
        
        <Button
          size="default"
          variant="ghost"
          className="w-full text-sm text-muted-foreground hover:text-foreground"
          onClick={onClear}
        >
          Vaciar carrito
        </Button>
      </div>
    </div>
  )
}
