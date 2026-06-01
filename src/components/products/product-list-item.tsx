'use client'

import { Package, Edit, Trash2, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatStock } from '@/lib/format-stock'
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
  const isLowStock = product.stock <= product.minimum_stock && product.stock > 0
  const isOutOfStock = product.stock === 0
  const isHighStock = product.stock > 20

  const getStockBadge = () => {
    const formattedStock = formatStock(
      product.stock, 
      product.unit_type || 'UNIT', 
      product.allow_decimal || false
    )
    
    if (isOutOfStock) {
      return {
        label: 'Sin stock',
        className: 'bg-red-50 text-red-700 border-red-200',
        icon: true
      }
    }
    if (isLowStock) {
      return {
        label: formattedStock,
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: true
      }
    }
    if (isHighStock) {
      return {
        label: formattedStock,
        className: 'bg-green-50 text-green-700 border-green-200',
        icon: false
      }
    }
    return {
      label: formattedStock,
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: false
    }
  }

  const stockBadge = getStockBadge()

  return (
    <Card className="p-3.5 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all duration-200 active:scale-[0.99] cursor-pointer group">
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary/80" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header with Actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-0.5 line-clamp-1">{product.name}</h3>
              {product.category && (
                <p className="text-xs text-muted-foreground/70">
                  {product.category.name}
                </p>
              )}
            </div>
            <div className="flex gap-0.5 flex-shrink-0">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(product)
                  }}
                  className="p-2 hover:bg-accent/50 rounded-lg transition-all duration-150 touch-manipulation active:scale-95"
                  aria-label="Editar producto"
                >
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(product)
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg transition-all duration-150 touch-manipulation active:scale-95 group/delete"
                  aria-label="Eliminar producto"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground group-hover/delete:text-red-600" />
                </button>
              )}
            </div>
          </div>

          {/* Barcode */}
          {product.barcode && (
            <p className="font-mono text-xs text-muted-foreground/60">
              {product.barcode}
            </p>
          )}

          {/* Price & Stock */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-bold tracking-tight">
                ${product.sale_price.toLocaleString('es-CL')}
              </span>
              {product.cost_price && (
                <span className="text-xs text-muted-foreground/60">
                  Costo: ${product.cost_price.toLocaleString('es-CL')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {onViewStock ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewStock(product)
                  }}
                  className="touch-manipulation"
                >
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] px-2 py-1 h-6 font-medium cursor-pointer hover:opacity-80 transition-opacity ${stockBadge.className}`}
                  >
                    {stockBadge.icon && <AlertCircle className="w-3 h-3 mr-1" />}
                    {stockBadge.label}
                  </Badge>
                </button>
              ) : (
                <Badge 
                  variant="outline" 
                  className={`text-[10px] px-2 py-1 h-6 font-medium ${stockBadge.className}`}
                >
                  {stockBadge.icon && <AlertCircle className="w-3 h-3 mr-1" />}
                  {stockBadge.label}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
