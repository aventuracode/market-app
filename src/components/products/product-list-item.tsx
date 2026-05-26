'use client'

import { Package, Edit, Trash2, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ProductWithCategory } from '@/types/product'

interface ProductListItemProps {
  product: ProductWithCategory
  onEdit?: (product: ProductWithCategory) => void
  onDelete?: (product: ProductWithCategory) => void
  onViewStock?: (product: ProductWithCategory) => void
}

export function ProductListItem({
  product,
  onEdit,
  onDelete,
  onViewStock,
}: ProductListItemProps) {
  const isLowStock = product.stock <= product.minimum_stock
  const isOutOfStock = product.stock === 0

  return (
    <Card className="p-4">
      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with Actions */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1">{product.name}</h3>
              {product.category && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  {product.category.name}
                </p>
              )}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {onEdit && (
                <button
                  onClick={() => onEdit(product)}
                  className="p-2.5 hover:bg-accent rounded-lg transition-colors touch-manipulation"
                  aria-label="Editar producto"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(product)}
                  className="p-2.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors touch-manipulation"
                  aria-label="Eliminar producto"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Barcode */}
          {product.barcode && (
            <p className="font-mono text-sm text-muted-foreground mb-3">
              {product.barcode}
            </p>
          )}

          {/* Price & Stock */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold">
                ${product.sale_price.toLocaleString('es-CL')}
              </span>
              {product.cost_price && (
                <span className="text-sm text-muted-foreground">
                  Costo: ${product.cost_price.toLocaleString('es-CL')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {onViewStock ? (
                <button
                  onClick={() => onViewStock(product)}
                  className="touch-manipulation"
                >
                  {isOutOfStock ? (
                    <Badge variant="destructive" className="gap-1.5 px-3 py-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                      <AlertCircle className="w-4 h-4" />
                      Sin stock
                    </Badge>
                  ) : isLowStock ? (
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                      <AlertCircle className="w-4 h-4" />
                      Stock bajo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="px-3 py-1.5 cursor-pointer hover:bg-accent transition-colors">
                      Stock: {product.stock}
                    </Badge>
                  )}
                </button>
              ) : (
                <>
                  {isOutOfStock ? (
                    <Badge variant="destructive" className="gap-1.5 px-3 py-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Sin stock
                    </Badge>
                  ) : isLowStock ? (
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Stock bajo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="px-3 py-1.5">
                      Stock: {product.stock}
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
