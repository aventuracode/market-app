'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ShoppingBag, User, CreditCard, Banknote, ArrowRightLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { SaleWithDetails } from '@/types/sales'

interface SalesTableProps {
  sales: SaleWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
}

export function SalesTable({ sales, isLoading, error }: SalesTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return <Banknote className="w-4 h-4" />
      case 'CARD':
        return <CreditCard className="w-4 h-4" />
      case 'TRANSFER':
        return <ArrowRightLeft className="w-4 h-4" />
      default:
        return null
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'Efectivo'
      case 'CARD':
        return 'Tarjeta'
      case 'TRANSFER':
        return 'Transferencia'
      default:
        return method
    }
  }

  const getPaymentMethodVariant = (method: string): 'default' | 'secondary' | 'outline' => {
    switch (method) {
      case 'CASH':
        return 'default'
      case 'CARD':
        return 'secondary'
      case 'TRANSFER':
        return 'outline'
      default:
        return 'default'
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Ventas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Ventas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {error.message || 'Error al cargar las ventas'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!sales || sales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Ventas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay ventas</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              No se encontraron ventas para el período seleccionado.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Data state
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Ventas ({sales.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              {/* Sale Number */}
              <div className="font-semibold text-sm mb-1">
                #{sale.sale_number}
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {/* Date */}
                <span>
                  {format(new Date(sale.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                </span>

                {/* User */}
                {sale.users && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {sale.users.first_name} {sale.users.last_name}
                    </span>
                  </>
                )}

                {/* Items count */}
                {sale.sale_items && sale.sale_items.length > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {sale.sale_items.length} {sale.sale_items.length === 1 ? 'item' : 'items'}
                    </span>
                  </>
                )}
              </div>

              {/* Payment Method */}
              <div className="mt-2">
                <Badge variant={getPaymentMethodVariant(sale.payment_method)} className="text-xs">
                  <span className="mr-1">{getPaymentMethodIcon(sale.payment_method)}</span>
                  {getPaymentMethodLabel(sale.payment_method)}
                </Badge>
              </div>
            </div>

            {/* Total */}
            <div className="text-right ml-4">
              <div className="text-lg font-bold">{formatCurrency(sale.total)}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
