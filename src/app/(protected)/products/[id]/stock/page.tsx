'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, Package, TrendingUp, TrendingDown, AlertCircle, Settings } from 'lucide-react'
import { productService } from '@/features/products/infrastructure/product.service'
import { useStockMovements } from '@/features/products/application/use-stock-movements'
import { StockAdjustmentDialog } from '@/features/products/ui/stock/stock-adjustment-dialog'
import { StockMovementItem } from '@/features/products/ui/stock/stock-movement-item'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTenant } from '@/features/auth'
import { Product } from '@/features/products/domain/product'


export default function ProductStockPage() {
  const router = useRouter()
  const params = useParams()
  const { tenant } = useTenant()
  const [product, setProduct] = useState<Product | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false)

  const productId = params.id as string

  const { movements, summary, loading, error, refresh } = useStockMovements({
    productId,
    autoLoad: true,
  })

  useEffect(() => {
    if (!tenant?.id || !productId) return

    const loadProduct = async () => {
      try {
        setLoadingProduct(true)
        const data = await productService.getProductById(tenant.id, productId)
        setProduct(data)
      } catch (err) {
        console.error('Error loading product:', err)
      } finally {
        setLoadingProduct(false)
      }
    }

    loadProduct()
  }, [tenant?.id, productId])

  const handleAdjustmentSuccess = () => {
    refresh()
    // Recargar producto para actualizar stock
    if (tenant?.id && productId) {
      productService.getProductById(tenant.id, productId).then(setProduct)
    }
  }

  if (loadingProduct) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando producto...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="text-sm text-destructive">Producto no encontrado</p>
      </div>
    )
  }

  const isLowStock = product.stock <= (product.minimum_stock || 0)
  const isOutOfStock = product.stock === 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{product.name}</h1>
            <p className="text-sm text-muted-foreground">Control de Stock</p>
          </div>
          <Button
            onClick={() => setAdjustmentDialogOpen(true)}
            size="default"
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Ajustar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stock Actual */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Stock Actual</p>
              <p className="text-4xl font-bold">{product.stock}</p>
              {isOutOfStock && (
                <p className="text-sm text-destructive mt-1">Sin stock</p>
              )}
              {isLowStock && !isOutOfStock && (
                <p className="text-sm text-orange-600 mt-1">
                  Stock bajo (mínimo: {product.minimum_stock})
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Resumen */}
        {summary && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-xs text-muted-foreground">Entradas</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                +{summary.total_purchases + summary.total_adjustments}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <p className="text-xs text-muted-foreground">Salidas</p>
              </div>
              <p className="text-2xl font-bold text-red-600">
                -{summary.total_sales + summary.total_damages}
              </p>
            </Card>
          </div>
        )}

        {/* Historial */}
        <div>
          <h2 className="font-semibold mb-3">Historial de Movimientos</h2>

          {/* Error State */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && movements.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando movimientos...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && movements.length === 0 && !error && (
            <Card className="p-8">
              <div className="text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Sin movimientos</h3>
                <p className="text-sm text-muted-foreground">
                  No hay movimientos de stock registrados para este producto
                </p>
              </div>
            </Card>
          )}

          {/* Movements List */}
          <div className="space-y-3">
            {movements.map((movement) => (
              <StockMovementItem key={movement.id} movement={movement} />
            ))}
          </div>
        </div>
      </div>

      {/* Adjustment Dialog */}
      <StockAdjustmentDialog
        product={product}
        open={adjustmentDialogOpen}
        onClose={() => setAdjustmentDialogOpen(false)}
        onSuccess={handleAdjustmentSuccess}
      />
    </div>
  )
}
