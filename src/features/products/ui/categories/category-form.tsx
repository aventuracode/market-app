'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useCategoryForm } from '@/features/products/application/use-category-form'
import { Card } from '@/shared/ui/components/card'
import { Input } from '@/shared/ui/components/input'
import { Label } from '@/shared/ui/components/label'
import { Textarea } from '@/shared/ui/components/textarea'
import { Button } from '@/shared/ui/components/button'
import { Category } from '../../domain/product'

interface CategoryFormProps {
  category?: Category
  onSuccess?: (category: Category) => void
  onCancel?: () => void
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { form, loading, onSubmit } = useCategoryForm({
    category,
    onSuccess: (result) => {
      setSubmitError(null)
      onSuccess?.(result)
    },
    onError: (error) => {
      console.error('Form error:', error)
      setSubmitError(error.message)
    },
  })

  const {
    register,
    formState: { errors },
  } = form

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Información Básica */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Información Básica</h3>
        <div className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ej: Bebidas, Snacks, Golosinas"
              className="h-11"
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción opcional de la categoría..."
              className="min-h-[100px] resize-none"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Error General */}
      {(errors.root || submitError) && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
          {errors.root?.message || submitError}
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 sticky bottom-0 bg-background pt-4 pb-safe">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-12"
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading} className="flex-1 h-12 gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {category ? 'Guardar Cambios' : 'Crear Categoría'}
        </Button>
      </div>
    </form>
  )
}
