'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ProductForm } from '@/features/products/ui/products/product-form'
import { Button } from '@/shared/ui/components/button'

export default function NewProductPage() {
  const router = useRouter()

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
          <h1 className="text-xl font-bold">Nuevo Producto</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <ProductForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  )
}
