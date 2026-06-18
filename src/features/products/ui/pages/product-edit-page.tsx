'use client'

import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ProductForm } from '../products/product-form'
import { useProduct } from '../../application/use-product'
import { Button } from '@/shared/ui/components/button'

export function ProductEditPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const { product, loading, error } = useProduct(productId)

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
