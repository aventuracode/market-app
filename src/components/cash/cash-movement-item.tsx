'use client'

import { TrendingUp, TrendingDown, ShoppingCart, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MOVEMENT_TYPE_LABELS } from '@/types/cash'
import type { CashMovementWithUser } from '@/types/cash'

interface CashMovementItemProps {
  movement: CashMovementWithUser
}

export function CashMovementItem({ movement }: CashMovementItemProps) {
  const getIcon = () => {
    switch (movement.type) {
      case 'INCOME':
        return <TrendingUp className="w-6 h-6 text-green-600" />
      case 'EXPENSE':
        return <TrendingDown className="w-6 h-6 text-red-600" />
      case 'SALE':
        return <ShoppingCart className="w-6 h-6 text-blue-600" />
      default:
        return <ShoppingCart className="w-6 h-6 text-gray-600" />
    }
  }

  const getColorClass = () => {
    switch (movement.type) {
      case 'INCOME':
        return 'bg-green-100 dark:bg-green-950'
      case 'EXPENSE':
        return 'bg-red-100 dark:bg-red-950'
      case 'SALE':
        return 'bg-blue-100 dark:bg-blue-950'
      case 'OPENING':
        return 'bg-purple-100 dark:bg-purple-950'
      case 'CLOSING':
        return 'bg-orange-100 dark:bg-orange-950'
      case 'ADJUSTMENT':
        return 'bg-yellow-100 dark:bg-yellow-950'
      default:
        return 'bg-gray-100 dark:bg-gray-950'
    }
  }

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClass()}`}>
            {getIcon()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm">
                {MOVEMENT_TYPE_LABELS[movement.type]}
              </span>
              {movement.notes && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {movement.notes}
                </p>
              )}
            </div>
            <span className={`text-lg font-bold flex-shrink-0 ${
              movement.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'
            }`}>
              {movement.type === 'EXPENSE' ? '-' : '+'}${movement.amount.toLocaleString('es-CL')}
            </span>
          </div>

          {movement.user && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <User className="w-3 h-3" />
              <span>{movement.user.first_name} {movement.user.last_name}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
