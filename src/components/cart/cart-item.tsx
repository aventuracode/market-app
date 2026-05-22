'use client'

import { Plus, Minus, Trash2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CartItem as CartItemType } from '@/stores/cart.store'
import { cn } from '@/lib/utils'

interface CartItemProps {
  item: CartItemType
  onIncrease: (productId: string) => void
  onDecrease: (productId: string) => void
  onRemove: (productId: string) => void
}

export function CartItem({ item, onIncrease, onDecrease, onRemove }: CartItemProps) {
  const { product, quantity } = item

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price)
  }

  const itemTotal = product.sale_price * quantity

  return (
    <div className="flex gap-3 p-4 bg-card rounded-2xl border touch-target">
      {/* Product Info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <h3 className="font-semibold text-base leading-tight line-clamp-2">
            {product.name}
          </h3>
          {product.category && (
            <div className="flex items-center gap-1.5 mt-1">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {product.category.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl"
              onClick={() => onDecrease(product.id)}
            >
              {quantity === 1 ? (
                <Trash2 className="h-4 w-4 text-destructive" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
            </Button>

            <div className="flex items-center justify-center min-w-[2.5rem] h-9 px-3 rounded-xl bg-primary/10 font-bold text-primary">
              {quantity}
            </div>

            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => onIncrease(product.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              {formatPrice(itemTotal)}
            </p>
            {quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                {formatPrice(product.sale_price)} c/u
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
