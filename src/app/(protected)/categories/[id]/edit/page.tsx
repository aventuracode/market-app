'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { CategoryForm } from '@/features/products/ui/categories/category-form'
import { categoryService } from '@/features/products/infrastructure/category.service'
import { useTenant } from '@/features/auth'
import { Button } from '@/shared/ui/components/button'
import { Category } from '@/features/products/domain/product'

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const { tenant } = useTenant()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const categoryId = params.id as string

  useEffect(() => {
    if (!tenant?.id || !categoryId) return

    const loadCategory = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await categoryService.getCategoryById(tenant.id, categoryId)
        
        if (!data) {
          setError('Categoría no encontrada')
          return
        }

        setCategory(data)
      } catch (err) {
        console.error('Error loading category:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar la categoría')
      } finally {
        setLoading(false)
      }
    }

    loadCategory()
  }, [tenant?.id, categoryId])

  const handleSuccess = () => {
    if (navigator.vibrate) {
      navigator.vibrate(200)
    }
    router.push('/categories')
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
          <h1 className="text-xl font-bold">Editar Categoría</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando categoría...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          {category && !loading && (
            <CategoryForm
              category={category}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  )
}
