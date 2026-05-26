'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useProductForm } from '@/hooks/use-product-form'
import { productService } from '@/services/product.service'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import type { Product, Category } from '@/types/product'

interface ProductFormProps {
  product?: Product
  onSuccess?: (product: Product) => void
  onCancel?: () => void
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { tenant } = useTenant()
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [submitError, setSubmitError] = useState<string | null>(null)

  const { form, loading, onSubmit } = useProductForm({
    product,
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

  // Cargar categorías
  useEffect(() => {
    if (!tenant?.id) return

    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const data = await productService.getCategories(tenant.id)
        setCategories(data)
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [tenant?.id])

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
              placeholder="Ej: Coca Cola 500ml"
              className="h-11"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Descripción opcional del producto"
              className="h-11"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category_id">Categoría</Label>
            <select
              id="category_id"
              {...register('category_id')}
              className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem] bg-[right_0.75rem_center] bg-no-repeat pr-12"
              disabled={loadingCategories}
            >
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-sm text-destructive">{errors.category_id.message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Códigos */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Códigos</h3>
        <div className="space-y-4">
          {/* Código de Barras */}
          <div className="space-y-2">
            <Label htmlFor="barcode">
              Código de Barras <span className="text-destructive">*</span>
            </Label>
            <Input
              id="barcode"
              {...register('barcode')}
              placeholder="7891234567890"
              className="h-11 font-mono"
              inputMode="numeric"
            />
            {errors.barcode && (
              <p className="text-sm text-destructive">{errors.barcode.message}</p>
            )}
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              {...register('sku')}
              placeholder="SKU-001"
              className="h-11"
            />
            {errors.sku && (
              <p className="text-sm text-destructive">{errors.sku.message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Precios */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Precios</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Precio de Venta */}
          <div className="space-y-2">
            <Label htmlFor="sale_price">
              Precio Venta <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sale_price"
              type="number"
              step="1"
              min="0"
              {...register('sale_price', { 
                valueAsNumber: true,
                setValueAs: (v) => {
                  if (v === '' || v === null || v === undefined) return 0
                  const num = Number(v)
                  return isNaN(num) ? 0 : Math.round(num)
                }
              })}
              placeholder="0"
              className="h-11"
              inputMode="numeric"
            />
            {errors.sale_price && (
              <p className="text-sm text-destructive">{errors.sale_price.message}</p>
            )}
          </div>

          {/* Precio de Costo */}
          <div className="space-y-2">
            <Label htmlFor="cost_price">Precio Costo</Label>
            <Input
              id="cost_price"
              type="number"
              step="1"
              min="0"
              {...register('cost_price', { 
                valueAsNumber: true,
                setValueAs: (v) => {
                  if (v === '' || v === null || v === undefined) return undefined
                  const num = Number(v)
                  return isNaN(num) ? undefined : Math.round(num)
                }
              })}
              placeholder="0"
              className="h-11"
              inputMode="numeric"
            />
            {errors.cost_price && (
              <p className="text-sm text-destructive">{errors.cost_price.message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Stock */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Inventario</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Stock Actual */}
          <div className="space-y-2">
            <Label htmlFor="stock">
              Stock Actual <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stock"
              type="number"
              {...register('stock', { valueAsNumber: true })}
              placeholder="0"
              className="h-11"
              inputMode="numeric"
            />
            {errors.stock && (
              <p className="text-sm text-destructive">{errors.stock.message}</p>
            )}
          </div>

          {/* Stock Mínimo */}
          <div className="space-y-2">
            <Label htmlFor="minimum_stock">
              Stock Mínimo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="minimum_stock"
              type="number"
              {...register('minimum_stock', { valueAsNumber: true })}
              placeholder="0"
              className="h-11"
              inputMode="numeric"
            />
            {errors.minimum_stock && (
              <p className="text-sm text-destructive">
                {errors.minimum_stock.message}
              </p>
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
          {product ? 'Actualizar' : 'Crear'} Producto
        </Button>
      </div>
    </form>
  )
}
