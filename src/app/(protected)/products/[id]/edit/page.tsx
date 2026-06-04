'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ProductForm } from '@/components/products/product-form'
import { productService } from '@/services/product.service'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types/product'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { tenant } = useTenant()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const productId = params.id as string

  useEffect(() => {
    if (!tenant?.id || !productId) return

    const loadProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await productService.getProductById(tenant.id, productId)
        
        if (!data) {
          setError('Producto no encontrado')
          return
        }

        setProduct(data)
      } catch (err) {
        console.error('Error loading product:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar el producto')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [tenant?.id, productId])

  const handleSuccess = () => {
    // Vibración de éxito
    if (navigator.vibrate) {
      navigator.vibrate(200)
    }

    // Volver a la lista
    router.push('/products')
  }

  const handleCancel = () => {
    router.back()
  }

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
          <h1 className="text-xl font-bold">Editar Producto</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando producto...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          {product && !loading && (
            <ProductForm
              product={product}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  )
}
