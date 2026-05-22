'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

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
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price)
  }

  return (
    <div className="space-y-4">
      <Separator />
      
      {/* Summary Details */}
      <div className="space-y-3 px-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
          </span>
          <span className="font-medium">
            {formatPrice(subtotal)}
          </span>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">
            Total
          </span>
          <span className="text-2xl font-bold text-primary">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <Button
          size="lg"
          className="w-full text-base"
          onClick={onCheckout}
        >
          Cobrar
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          className="w-full"
          onClick={onClear}
        >
          Vaciar carrito
        </Button>
      </div>
    </div>
  )
}
