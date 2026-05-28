'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, User, Package, CreditCard, Banknote, ArrowRightLeft } from 'lucide-react'
import { formatCurrency, formatTime } from '@/lib/utils/format'
import type { SaleWithRelations } from '@/types/sales-extended'
import { cn } from '@/lib/utils'

interface SaleCardProps {
  sale: SaleWithRelations
  onClick?: () => void
  isNew?: boolean
}

export function SaleCard({ sale, onClick, isNew }: SaleCardProps) {
  const paymentMethodConfig = getPaymentMethodConfig(sale.payment_method)
  const itemsCount = sale.sale_items?.length || 0

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md active:scale-[0.98]',
        isNew && 'ring-2 ring-primary ring-offset-2 animate-in fade-in slide-in-from-top-2'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              #{sale.sale_number}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatTime(sale.created_at)}
              </span>
            </div>
          </div>
          <Badge
            variant={paymentMethodConfig.variant}
            className={cn('text-xs', paymentMethodConfig.className)}
          >
            {paymentMethodConfig.icon}
            {paymentMethodConfig.label}
          </Badge>
        </div>

        {/* Total */}
        <div className="mb-3">
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(sale.total)}
          </p>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Package className="h-3 w-3" />
            <span>{itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}</span>
          </div>
          {sale.users && (
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[120px]">
                {sale.users.first_name} {sale.users.last_name}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getPaymentMethodConfig(method: 'CASH' | 'CARD' | 'TRANSFER') {
  const configs = {
    CASH: {
      label: 'Efectivo',
      icon: <Banknote className="h-3 w-3 mr-1" />,
      variant: 'default' as const,
      className: 'bg-green-100 text-green-700 hover:bg-green-200',
    },
    CARD: {
      label: 'Tarjeta',
      icon: <CreditCard className="h-3 w-3 mr-1" />,
      variant: 'secondary' as const,
      className: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    },
    TRANSFER: {
      label: 'Transferencia',
      icon: <ArrowRightLeft className="h-3 w-3 mr-1" />,
      variant: 'outline' as const,
      className: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    },
  }

  return configs[method]
}
