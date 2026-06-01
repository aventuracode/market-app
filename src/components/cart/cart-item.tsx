'use client'

import { useState } from 'react'
import { Plus, Minus, Trash2, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CartItem as CartItemType, StockValidationResult } from '@/stores/cart.store'
import { cn } from '@/lib/utils'
import { formatQuantity, formatPrice } from '@/lib/product-helpers'

interface CartItemProps {
  item: CartItemType
  onIncrease: (productId: string) => StockValidationResult
  onDecrease: (productId: string) => void
  onRemove: (productId: string) => void
  onUpdateQuantity?: (productId: string, quantity: number) => StockValidationResult
}

export function CartItem({ item, onIncrease, onDecrease, onRemove, onUpdateQuantity }: CartItemProps) {
  const { product, quantity } = item
  const [inputValue, setInputValue] = useState(quantity.toString())
  const [isEditing, setIsEditing] = useState(false)

  // Redondear para evitar problemas de floating point
  const roundedQuantity = Number(quantity.toFixed(3))
  const itemTotal = product.sale_price * roundedQuantity
  const isDecimal = product.allow_decimal === true

  const unitType = product.unit_type || 'UNIT'
  const unitLabel = unitType === 'UNIT' ? 'un' : unitType === 'KILOGRAM' ? 'kg' : unitType === 'GRAM' ? 'g' : unitType === 'LITER' ? 'l' : 'ml'

  const validateQuantity = (value: number): boolean => {
    // No permitir NaN, Infinity, negativos o cero
    if (isNaN(value) || !isFinite(value) || value <= 0) return false
    
    // Para productos UNIT, solo enteros
    if (!isDecimal && !Number.isInteger(value)) return false
    
    return true
  }

  const handleQuantityChange = (value: string) => {
    setInputValue(value)
  }

  const handleQuantityBlur = () => {
    setIsEditing(false)
    const numValue = parseFloat(inputValue)
    
    if (validateQuantity(numValue)) {
      const roundedValue = Number(numValue.toFixed(3))
      if (roundedValue !== roundedQuantity) {
        const result = onUpdateQuantity?.(product.id, roundedValue)
        
        if (result && !result.success && result.error === 'INSUFFICIENT_STOCK') {
          const unitLabel = unitType === 'KILOGRAM' ? 'kg' : unitType === 'GRAM' ? 'g' : unitType === 'LITER' ? 'l' : 'ml'
          toast.error('Stock insuficiente', {
            description: `Stock disponible: ${result.available} ${unitLabel}`
          })
          setInputValue(roundedQuantity.toString())
        }
      }
    } else {
      // Restaurar valor anterior si es inválido
      setInputValue(roundedQuantity.toString())
    }
  }

  const handleQuantityFocus = () => {
    setIsEditing(true)
  }

  // Actualizar inputValue cuando quantity cambia externamente
  if (!isEditing && inputValue !== quantity.toString()) {
    setInputValue(quantity.toString())
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="space-y-1">
          <h3 className="font-bold text-base leading-tight line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {product.category && (
              <>
                <span>{product.category.name}</span>
                <span>•</span>
              </>
            )}
            <span className="font-medium">{formatPrice(product.sale_price)} / {unitLabel}</span>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between gap-4">
          {isDecimal ? (
            // Input numérico para productos decimales
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={`quantity-${product.id}`} className="text-xs text-muted-foreground">
                Cantidad
              </Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    id={`quantity-${product.id}`}
                    type="number"
                    inputMode="decimal"
                    step="0.001"
                    min="0.001"
                    value={inputValue}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    onBlur={handleQuantityBlur}
                    onFocus={handleQuantityFocus}
                    className="h-11 text-base font-semibold text-center pr-12 rounded-lg"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    {unitLabel}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 rounded-lg flex-shrink-0"
                  onClick={() => onRemove(product.id)}
                >
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/60">
                Ingresa la cantidad en {unitType === 'KILOGRAM' ? 'kilogramos' : unitType === 'GRAM' ? 'gramos' : unitType === 'LITER' ? 'litros' : 'mililitros'}
              </p>
            </div>
          ) : (
            // Botones +/- para productos UNIT
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-11 w-11 rounded-lg touch-manipulation active:scale-95 transition-transform"
                onClick={() => onDecrease(product.id)}
              >
                {roundedQuantity <= 1 ? (
                  <Trash2 className="h-5 w-5 text-destructive" />
                ) : (
                  <Minus className="h-5 w-5" />
                )}
              </Button>

              <div className="flex items-center justify-center min-w-[4rem] h-11 px-4 rounded-lg bg-primary/10 font-bold text-primary text-base">
                {formatQuantity(roundedQuantity, product)}
              </div>

              <Button
                size="icon"
                variant="outline"
                className="h-11 w-11 rounded-lg border-primary/50 text-primary hover:bg-primary hover:text-white touch-manipulation active:scale-95 transition-all"
                onClick={() => {
                  const result = onIncrease(product.id)
                  if (!result.success && result.error === 'INSUFFICIENT_STOCK') {
                    const unitLabel = unitType === 'UNIT' ? 'unidades' : unitType === 'KILOGRAM' ? 'kg' : unitType === 'GRAM' ? 'g' : unitType === 'LITER' ? 'l' : 'ml'
                    toast.error('Stock insuficiente', {
                      description: `Stock disponible: ${result.available} ${unitLabel}`
                    })
                  }
                }}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Subtotal */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground/70 mb-0.5">
              Subtotal
            </p>
            <p className="text-xl font-bold text-primary">
              {formatPrice(itemTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Desglose (footer) */}
      {(isDecimal || quantity > 1) && (
        <div className="px-4 py-2 bg-muted/30 border-t border-border/50">
          <p className="text-[11px] text-muted-foreground/70 font-mono text-center">
            {formatQuantity(roundedQuantity, product, false)} × {formatPrice(product.sale_price)} = {formatPrice(itemTotal)}
          </p>
        </div>
      )}
    </div>
  )
}
