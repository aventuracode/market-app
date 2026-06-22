'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { TrendingUp, TrendingDown, User } from 'lucide-react'
import { Card } from '@/shared/ui/components/card'
import { STOCK_MOVEMENT_TYPE_LABELS } from '@/features/products/domain/stock'
import type { StockMovementFull } from '@/features/products/domain/stock'
import { SEMANTIC_COLORS } from '@/shared/config/semantic-colors'

interface StockMovementItemProps {
  movement: StockMovementFull
}

export function StockMovementItem({ movement }: StockMovementItemProps) {
  const isIncrease = movement.new_stock > movement.previous_stock
  const quantityChange = Math.abs(movement.new_stock - movement.previous_stock)

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isIncrease ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {isIncrease ? (
              <TrendingUp className={`w-6 h-6 ${SEMANTIC_COLORS.success.icon}`} />
            ) : (
              <TrendingDown className={`w-6 h-6 ${SEMANTIC_COLORS.danger.icon}`} />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {STOCK_MOVEMENT_TYPE_LABELS[movement.type]}
                </span>
                <span
                  className={`text-sm font-medium ${
                    isIncrease ? SEMANTIC_COLORS.success.text : SEMANTIC_COLORS.danger.text
                  }`}
                >
                  {isIncrease ? '+' : '-'}
                  {quantityChange}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(movement.created_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-muted-foreground">Stock</p>
              <p className="font-semibold">{movement.new_stock}</p>
            </div>
          </div>

          {/* Notes */}
          {movement.notes && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {movement.notes}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {movement.user && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>
                  {movement.user.first_name} {movement.user.last_name}
                </span>
              </div>
            )}
            <span>
              {movement.previous_stock} → {movement.new_stock}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
