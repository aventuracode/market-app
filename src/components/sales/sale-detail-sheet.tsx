'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Banknote, 
  ArrowRightLeft, 
  Clock, 
  User, 
  MapPin,
  Package
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import type { SaleWithRelations } from '@/types/sales-extended'

interface SaleDetailSheetProps {
  sale: SaleWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaleDetailSheet({ sale, open, onOpenChange }: SaleDetailSheetProps) {
  if (!sale) return null

  const paymentMethodConfig = getPaymentMethodConfig(sale.payment_method)
  const discount = sale.discount ?? 0
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left">
            Venta #{sale.sale_number}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto h-[calc(85vh-100px)] pb-6">
          {/* Total */}
          <div className="bg-primary/5 rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Total</p>
            <p className="text-4xl font-bold text-foreground">
              {formatCurrency(sale.total)}
            </p>
          </div>

          {/* Info General */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Fecha y hora</span>
              </div>
              <span className="text-sm font-medium">
                {formatDateTime(sale.created_at ?? new Date().toISOString())}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {paymentMethodConfig.icon}
                <span>Método de pago</span>
              </div>
              <Badge
                variant={paymentMethodConfig.variant}
                className={paymentMethodConfig.className}
              >
                {paymentMethodConfig.label}
              </Badge>
            </div>

            {sale.users && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Vendedor</span>
                </div>
                <span className="text-sm font-medium">
                  {sale.users.first_name} {sale.users.last_name}
                </span>
              </div>
            )}

            {sale.cash_registers && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Caja</span>
                </div>
                <span className="text-sm font-medium">
                  {sale.cash_registers.name}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Productos */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Productos</h3>
            </div>

            <div className="space-y-3">
              {sale.sale_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.products.name}</p>
                    {item.products.sku && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        SKU: {item.products.sku}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Resumen */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(sale.subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Descuento</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(discount)}
                </span>
              </div>
            )}
            
            <Separator />
            <div className="flex items-center justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function getPaymentMethodConfig(method: 'CASH' | 'CARD' | 'TRANSFER') {
  const configs = {
    CASH: {
      label: 'Efectivo',
      icon: <Banknote className="h-4 w-4" />,
      variant: 'default' as const,
      className: 'bg-green-100 text-green-700',
    },
    CARD: {
      label: 'Tarjeta',
      icon: <CreditCard className="h-4 w-4" />,
      variant: 'secondary' as const,
      className: 'bg-blue-100 text-blue-700',
    },
    TRANSFER: {
      label: 'Transferencia',
      icon: <ArrowRightLeft className="h-4 w-4" />,
      variant: 'outline' as const,
      className: 'bg-purple-100 text-purple-700',
    },
  }

  return configs[method]
}
