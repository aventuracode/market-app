'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, ScanBarcode } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/features/checkout/application/stores/cart.store'
import { useTenant } from '@/features/auth/application/use-tenant'
import { productService } from '@/features/products/infrastructure/product.service'
import { formatQuantity, getInitialQuantity } from '@/lib/product-helpers'
import { formatWeight } from '@/lib/utils/weight'
import { formatCurrency } from '@/lib/utils/currency'
import { PageHeader } from '@/components/shared/page-header'
import { SearchBar } from '@/components/shared/search-bar'
import { ProductCard } from '@/features/pos/ui/product-card'
import {
  ProductListLoading,
  ProductListEmpty,
  ProductListError,
  ProductListSearching,
} from '@/features/pos/ui/product-list-states'
import { Button } from '@/components/ui/button'
import { BarcodeScanner } from '@/features/pos/ui/barcode-scanner'
import { CartSheet } from '@/features/checkout/ui/cart-sheet'
import { motion } from 'framer-motion'
import { useProductSearch } from '@/features/products/application/use-product-search'
import { ProductWithCategory } from '@/features/products/domain/product'

export function POSClient() {
  const [mounted, setMounted] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const { query, setQuery, products, loading, error, clearSearch } = useProductSearch()
  const { addItem, removeItem, updateQuantity, getItem, getItemCount, getTotal } = useCartStore()
  const { tenant } = useTenant()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddToCart = (product: ProductWithCategory) => {
    // Obtener cantidad inicial según tipo de producto
    const initialQuantity = getInitialQuantity(product)
    const result = addItem(product, initialQuantity)
    
    if (!result.success) {
      if (result.error === 'INSUFFICIENT_STOCK') {
        const unitType = product.unit_type || 'UNIT'
        const unitLabel = unitType === 'UNIT' ? 'unidades' : unitType === 'KILOGRAM' ? 'kg' : unitType === 'GRAM' ? 'g' : unitType === 'LITER' ? 'l' : 'ml'
        
        if (result.available && result.available > 0) {
          toast.error(`Stock insuficiente`, {
            description: `Solo quedan ${result.available} ${unitLabel} disponibles`
          })
        } else {
          toast.error('Sin stock', {
            description: 'Este producto no tiene stock disponible'
          })
        }
      }
    }
  }

  const handleRemoveFromCart = (product: ProductWithCategory) => {
    removeItem(product.id)
  }

  const handleUpdateQuantity = (product: ProductWithCategory, quantity: number) => {
    updateQuantity(product.id, quantity)
  }

  const handleBarcodeScan = async (barcode: string) => {
    if (!tenant?.id) {
      throw new Error('No hay tenant activo')
    }

    const product = await productService.getProductByBarcode(tenant.id, barcode)
    
    if (!product) {
      throw new Error('Producto no encontrado')
    }

    if (!product.is_active) {
      throw new Error('Producto inactivo')
    }

    if (product.stock <= 0) {
      throw new Error('Producto sin stock')
    }

    // Add to cart
    addItem(product, 1)
  }

  const cartItemCount = getItemCount()
  const cartTotal = getTotal()

  return (
    <div className="flex flex-col h-full">
      {/* Header con search sticky */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-lg border-b shadow-sm">
        <div className="p-4 pb-3 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Punto de Venta</h1>
              <p className="text-xs text-muted-foreground/70">
                Busca productos o escanea código
              </p>
            </div>
            
            {/* Scanner Button */}
            <Button
              size="icon"
              variant="outline"
              className="h-12 w-12 rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setScannerOpen(true)}
            >
              <ScanBarcode className="h-6 w-6" />
            </Button>
          </div>

          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={clearSearch}
            loading={loading}
            placeholder="Buscar producto, código o escanear..."
            autoFocus
          />
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto">
        {error ? (
          <ProductListError message={error} />
        ) : loading && products.length === 0 ? (
          <ProductListSearching />
        ) : products.length === 0 ? (
          <ProductListEmpty hasQuery={query.length > 0} />
        ) : (
          <div className="px-3 py-2 flex flex-col gap-1.5 animate-fade-in">
            {products.map((product) => {
              const cartItem = getItem(product.id)
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={handleAddToCart}
                  onRemove={handleRemoveFromCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  inCart={!!cartItem}
                  cartQuantity={cartItem?.quantity || 0}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Cart Summary - Fixed Bottom */}
      {mounted && cartItemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="sticky bottom-0 left-0 right-0 z-30 bg-background border-t shadow-2xl pb-safe"
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <span className="font-semibold">
                  {formatWeight(cartItemCount)} {cartItemCount === 1 ? 'producto' : 'productos'}
                </span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(cartTotal)}
              </span>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => setCartOpen(true)}
            >
              Ver Carrito
            </Button>
          </div>
        </motion.div>
      )}

      {/* Cart Sheet */}
      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Barcode Scanner */}
      <BarcodeScanner 
        open={scannerOpen} 
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
    </div>
  )
}
