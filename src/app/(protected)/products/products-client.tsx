'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, PackageX } from 'lucide-react'
import { useProducts } from '@/hooks/use-products'
import { ProductListItem } from '@/components/products/product-list-item'
import { DeleteProductDialog } from '@/components/products/delete-product-dialog'
import { PageHeader } from '@/components/shared/page-header'
import { SearchBar } from '@/components/shared/search-bar'
import { Button } from '@/components/ui/button'
import type { ProductWithCategory } from '@/types/product'

export function ProductosClient() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [productToDelete, setProductToDelete] = useState<ProductWithCategory | null>(null)
  const { products, loading, error, hasMore, total, search, loadMore, refresh } = useProducts()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    search(query)
  }

  const handleEdit = (product: ProductWithCategory) => {
    router.push(`/products/${product.id}/edit`)
  }

  const handleDelete = (product: ProductWithCategory) => {
    setProductToDelete(product)
  }

  const handleViewStock = (product: ProductWithCategory) => {
    router.push(`/products/${product.id}/stock`)
  }

  const handleDeleteSuccess = () => {
    refresh()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 space-y-4">
        <PageHeader
          title="Productos"
          subtitle={loading ? 'Cargando...' : `${total} producto${total !== 1 ? 's' : ''}`}
          action={
            <Button
              onClick={() => router.push('/products/new')}
              size="default"
              className="gap-2 h-11 px-4"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </Button>
          }
        />

        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Buscar por nombre, código o SKU..."
          loading={loading && products.length > 0}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-3">
          {/* Error State */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Loading Initial */}
          {loading && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando productos...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <PackageX className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <h3 className="font-medium mb-1">No hay productos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? 'No se encontraron productos con ese criterio'
                    : 'Comienza agregando tu primer producto'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => router.push('/products/new')}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Producto
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Products List */}
          {products.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewStock={handleViewStock}
            />
          ))}

          {/* Load More */}
          {hasMore && !loading && (
            <div className="pt-4">
              <Button
                onClick={loadMore}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Cargar más productos
              </Button>
            </div>
          )}

          {/* Loading More */}
          {loading && products.length > 0 && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteProductDialog
        product={productToDelete}
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
