'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useProductSearch } from '@/hooks/use-product-search'
import { useCartStore } from '@/stores/cart.store'
import { SearchInput } from '@/components/pos/search-input'
import { ProductCard } from '@/components/pos/product-card'
import {
  ProductListLoading,
  ProductListEmpty,
  ProductListError,
  ProductListSearching,
} from '@/components/pos/product-list-states'
import { Button } from '@/components/ui/button'
import { CartSheet } from '@/components/cart/cart-sheet'
import { motion } from 'framer-motion'
import type { ProductWithCategory } from '@/types/product'

export function POSClient() {
  const [mounted, setMounted] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { query, setQuery, products, loading, error, clearSearch } = useProductSearch()
  const { addItem, removeItem, updateQuantity, getItem, getItemCount, getTotal } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddToCart = (product: ProductWithCategory) => {
    addItem(product, 1)
  }

  const handleRemoveFromCart = (product: ProductWithCategory) => {
    removeItem(product.id)
  }

  const handleUpdateQuantity = (product: ProductWithCategory, quantity: number) => {
    updateQuantity(product.id, quantity)
  }

  const cartItemCount = getItemCount()
  const cartTotal = getTotal()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header con search sticky */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-lg border-b pb-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Punto de Venta</h1>
            <p className="text-sm text-muted-foreground">
              Busca y agrega productos al carrito
            </p>
          </div>
        </div>

        <SearchInput
          value={query}
          onChange={setQuery}
          onClear={clearSearch}
          loading={loading}
          placeholder="Buscar por nombre, SKU o código..."
        />
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto py-4">
        {error ? (
          <ProductListError message={error} />
        ) : loading && products.length === 0 ? (
          <ProductListSearching />
        ) : products.length === 0 ? (
          <ProductListEmpty hasQuery={query.length > 0} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
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
                  {cartItemCount} {cartItemCount === 1 ? 'producto' : 'productos'}
                </span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(cartTotal)}
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
    </div>
  )
}
