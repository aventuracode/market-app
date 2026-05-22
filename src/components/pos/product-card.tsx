'use client'

import { Package, Tag, Plus, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ProductWithCategory } from '@/types/product'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: ProductWithCategory
  onAdd: (product: ProductWithCategory) => void
  onRemove?: (product: ProductWithCategory) => void
  onUpdateQuantity?: (product: ProductWithCategory, quantity: number) => void
  inCart?: boolean
  cartQuantity?: number
}

export function ProductCard({ 
  product, 
  onAdd, 
  onRemove,
  onUpdateQuantity,
  inCart = false, 
  cartQuantity = 0 
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price)
  }

  const isLowStock = product.stock <= product.minimum_stock && product.stock > 0
  const isOutOfStock = product.stock <= 0

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 hover:shadow-xl animate-fade-in',
        inCart && 'ring-2 ring-primary/50',
        isOutOfStock && 'opacity-60'
      )}
    >
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight line-clamp-2">
                {product.name}
              </h3>
              {product.category && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">
                    {product.category.name}
                  </span>
                </div>
              )}
            </div>

            {/* Add/Quantity Controls */}
            {inCart && cartQuantity > 0 ? (
              // Controles de cantidad cuando está en carrito
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 rounded-xl"
                  onClick={() => {
                    if (cartQuantity === 1) {
                      onRemove?.(product)
                    } else {
                      onUpdateQuantity?.(product, cartQuantity - 1)
                    }
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-xl bg-success/10 font-bold text-success">
                  {cartQuantity}
                </div>
                
                <Button
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 rounded-xl border-success text-success hover:bg-success hover:text-white"
                  onClick={() => !isOutOfStock && onAdd(product)}
                  disabled={isOutOfStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              // Botón simple cuando no está en carrito
              <Button
                size="icon"
                variant="outline"
                className="flex-shrink-0 h-10 w-10 rounded-xl"
                onClick={() => !isOutOfStock && onAdd(product)}
                disabled={isOutOfStock}
              >
                <Plus className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Price and Stock */}
          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">
                {formatPrice(product.sale_price)}
              </p>
              {product.sku && (
                <p className="text-xs text-muted-foreground">
                  SKU: {product.sku}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span
                className={cn(
                  'text-sm font-medium',
                  isOutOfStock && 'text-destructive',
                  isLowStock && 'text-warning',
                  !isOutOfStock && !isLowStock && 'text-foreground'
                )}
              >
                {isOutOfStock ? 'Sin stock' : product.stock}
              </span>
            </div>
          </div>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <span className="text-sm font-semibold text-destructive">
                Sin stock
              </span>
            </div>
          )}
        </div>
    </Card>
  )
}
