'use client'

import { useState } from 'react'
import { Package, Tag, Plus, Minus, Weight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatPrice, formatUnit, getUnitBadgeVariant } from '@/lib/product-helpers'
import { formatWeight } from '@/lib/utils/weight'
import { formatStock } from '@/lib/utils/measurement'
import { ProductWithCategory, UnitType } from '@/features/products/domain/product'

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
  const [justAdded, setJustAdded] = useState(false)

  const isLowStock = product.stock <= product.minimum_stock && product.stock > 0
  const isOutOfStock = product.stock <= 0
  const isPesable = product.allow_decimal === true
  const unitType = (product.unit_type as UnitType) || 'UNIT'
  const unitLabel = unitType === 'UNIT' ? 'c/u' : unitType === 'KILOGRAM' ? 'kg' : unitType === 'GRAM' ? 'g' : unitType === 'LITER' ? 'l' : 'ml'

  const handleAdd = () => {
    if (!isOutOfStock) {
      onAdd(product)
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 600)
    }
  }

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 p-2.5 rounded-lg border bg-card transition-all duration-150',
        'active:scale-[0.98] touch-manipulation',
        inCart && 'bg-primary/5 border-primary/30',
        justAdded && 'ring-2 ring-green-500/50',
        isOutOfStock && 'opacity-50',
        !isOutOfStock && !inCart && 'hover:bg-accent/50 cursor-pointer'
      )}
      onClick={!inCart && !isOutOfStock ? handleAdd : undefined}
    >
      {/* Icon */}
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0",
        isOutOfStock ? 'bg-muted' : 'bg-primary/10'
      )}>
        <Package className={cn(
          "h-5 w-5",
          isOutOfStock ? 'text-muted-foreground' : 'text-primary'
        )} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-0.5">
        {/* Name and Badge */}
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-sm leading-tight truncate">
            {product.name}
          </h3>
          {isPesable && (
            <Badge 
              variant="outline" 
              className="text-[9px] px-1 py-0 h-3.5 bg-cyan-50 text-cyan-700 border-cyan-200 flex-shrink-0"
            >
              Pesable
            </Badge>
          )}
        </div>

        {/* Category */}
        {product.category && (
          <p className="text-[10px] text-muted-foreground/60 truncate">
            {product.category.name}
          </p>
        )}

        {/* Price and Stock */}
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-foreground">
            {formatPrice(product.sale_price)}
          </span>
          {isPesable && (
            <span className="text-[10px] text-muted-foreground/70">
              / {unitLabel}
            </span>
          )}
          <span className={cn(
            "text-[10px] font-medium ml-auto",
            isOutOfStock && 'text-red-600',
            isLowStock && 'text-yellow-600',
            !isOutOfStock && !isLowStock && 'text-muted-foreground/70'
          )}>
            {isOutOfStock ? 'Sin stock' : formatStock(product.stock, unitType)}
          </span>
        </div>
      </div>

      {/* Add Button */}
      <Button
        size="icon"
        variant="default"
        className="h-9 w-9 rounded-full shadow-sm flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation()
          handleAdd()
        }}
        disabled={isOutOfStock}
      >
        <Plus className="h-4 w-4" />
      </Button>

      {/* In Cart Indicator */}
      {inCart && cartQuantity > 0 && (
        <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-sm">
          {formatWeight(cartQuantity)}
        </div>
      )}
    </div>
  )
}
