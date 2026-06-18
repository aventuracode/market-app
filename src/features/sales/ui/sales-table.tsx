'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ShoppingBag, User, CreditCard, Banknote, ArrowRightLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { SaleWithDetails } from '@/features/sales/domain/sales.types'
import { formatCurrency } from '@/shared/utils'
import { formatDateTime } from '@/shared/utils'

interface SalesTableProps {
  sales: SaleWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
}

export function SalesTable({ sales, isLoading, error }: SalesTableProps) {
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

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'CARD':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'TRANSFER':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  // Data state
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingBag className="w-4 h-4" />
          Ventas
          <span className="text-sm font-normal text-muted-foreground">({sales.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/30 hover:border-accent transition-all duration-150 cursor-pointer group"
          >
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Sale Number - más pequeño y elegante */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-muted-foreground/60 tracking-wide">
                  #{String(sale.sale_number).padStart(4, '0')}
                </span>
                {/* Payment Method Badge - inline */}
                <Badge 
                  variant="outline" 
                  className={`text-[10px] px-1.5 py-0 h-5 ${getPaymentMethodColor(sale.payment_method)}`}
                >
                  <span className="mr-1">{getPaymentMethodIcon(sale.payment_method)}</span>
                  {getPaymentMethodLabel(sale.payment_method)}
                </Badge>
              </div>

              {/* Metadata - más compacto */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground/80">
                {/* Date */}
                <span className="font-medium">
                  {formatDateTime(sale.created_at)}
                </span>

                {/* User */}
                {sale.users && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {sale.users.first_name}
                    </span>
                  </>
                )}

                {/* Items count */}
                {sale.sale_items && sale.sale_items.length > 0 && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span>
                      {sale.sale_items.length} {sale.sale_items.length === 1 ? 'item' : 'items'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Total - más destacado */}
            <div className="text-right ml-3">
              <div className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                {formatCurrency(sale.total)}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
