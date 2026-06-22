'use client'

import { TrendingUp, TrendingDown, ShoppingCart, User } from 'lucide-react'
import { Card } from '@/shared/ui/components/card'
import { Badge } from '@/shared/ui/components/badge'
import { CASH_MOVEMENT_LABELS } from '../domain/cash'
import type { CashMovementWithUser } from '../domain/cash'
import { formatCurrency } from '@/shared/utils'
import { SEMANTIC_COLORS } from '@/shared/config/semantic-colors'

interface CashMovementItemProps {
  movement: CashMovementWithUser
}

export function CashMovementItem({ movement }: CashMovementItemProps) {
  const getIcon = () => {
    switch (movement.type) {
      case 'INCOME':
        return <TrendingUp className={`w-6 h-6 ${SEMANTIC_COLORS.success.icon}`} />
      case 'EXPENSE':
        return <TrendingDown className={`w-6 h-6 ${SEMANTIC_COLORS.danger.icon}`} />
      case 'SALE':
        return <ShoppingCart className={`w-6 h-6 ${SEMANTIC_COLORS.card.icon}`} />
      default:
        return <ShoppingCart className="w-6 h-6 text-gray-600" />
    }
  }

  const getColorClass = () => {
    switch (movement.type) {
      case 'INCOME':
        return `${SEMANTIC_COLORS.success.bg} dark:bg-green-950`
      case 'EXPENSE':
        return `${SEMANTIC_COLORS.danger.bg} dark:bg-red-950`
      case 'SALE':
        return `${SEMANTIC_COLORS.card.bg} dark:bg-blue-950`
      case 'OPENING':
        return `${SEMANTIC_COLORS.transfer.bg} dark:bg-purple-950`
      case 'CLOSING':
        return 'bg-orange-50 dark:bg-orange-950'  // TODO: revisar semántica (orange no tiene equivalente)
      case 'ADJUSTMENT':
        return 'bg-yellow-50 dark:bg-yellow-950'  // TODO: revisar semántica (yellow vs amber)
      default:
        return `${SEMANTIC_COLORS.neutral.bg} dark:bg-gray-950`
    }
  }

  const getBadgeClass = () => {
    switch (movement.type) {
      case 'INCOME':
        return `${SEMANTIC_COLORS.success.bg} ${SEMANTIC_COLORS.success.text} ${SEMANTIC_COLORS.success.border}`
      case 'EXPENSE':
        return `${SEMANTIC_COLORS.danger.bg} ${SEMANTIC_COLORS.danger.text} ${SEMANTIC_COLORS.danger.border}`
      case 'SALE':
        return `${SEMANTIC_COLORS.card.bg} ${SEMANTIC_COLORS.card.text} ${SEMANTIC_COLORS.card.border}`
      default:
        return `${SEMANTIC_COLORS.neutral.bg} ${SEMANTIC_COLORS.neutral.text} ${SEMANTIC_COLORS.neutral.border}`
    }
  }

  return (
    <Card className="p-3 shadow-sm hover:shadow-md transition-all duration-150 hover:border-accent cursor-pointer group">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClass()}`}>
            {getIcon()}
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {CASH_MOVEMENT_LABELS[movement.type]}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] px-1.5 py-0 h-5 ${getBadgeClass()}`}
                >
                  {CASH_MOVEMENT_LABELS[movement.type]}
                </Badge>
              </div>
              {movement.notes && (
                <p className="text-xs text-muted-foreground/80 line-clamp-2">
                  {movement.notes}
                </p>
              )}
            </div>
            <span className={`text-xl font-bold flex-shrink-0 tracking-tight group-hover:scale-105 transition-transform ${
              movement.type === 'EXPENSE' ? SEMANTIC_COLORS.danger.text : SEMANTIC_COLORS.success.text
            }`}>
              {movement.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(movement.amount)}
            </span>
          </div>

          {movement.user && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
              <User className="w-3 h-3" />
              <span>{movement.user.first_name}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
