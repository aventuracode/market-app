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
import { Checkbox } from '@/components/ui/checkbox'
import { QuickCreateCategory } from '@/components/settings/categories/quick-create-category'
import type { Product, Category } from '@/types/product'
import { UNIT_TYPE_OPTIONS } from '@/types/product'

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
    watch,
  } = form

  // Helper para identificar productos pesables
  const unitType = watch('unit_type')
  const isWeightedProduct = unitType === 'KILOGRAM' || unitType === 'GRAM' || unitType === 'LITER' || unitType === 'MILLILITER'

  // Cargar categorías primero
  useEffect(() => {
    if (!tenant?.id) return
    loadCategories()
  }, [tenant?.id])

  // Resetear formulario cuando el producto cambie Y las categorías estén cargadas
  useEffect(() => {
    if (product && !loadingCategories) {
      console.log('[ProductForm] Resetting form with product.category_id:', product.category_id)
      form.reset({
        name: product.name,
        description: product.description || '',
        barcode: product.barcode || '',
        sku: product.sku || '',
        category_id: product.category_id || '',
        sale_price: product.sale_price,
        cost_price: product.cost_price || undefined,
        stock: product.stock,
        minimum_stock: product.minimum_stock,
        unit_type: product.unit_type || 'UNIT',
        allow_decimal: product.allow_decimal || false,
        is_active: product.is_active,
      })
      console.log('[ProductForm] Form reset complete. watch(category_id):', watch('category_id'))
    }
  }, [product, loadingCategories, form])

  const loadCategories = async () => {
    if (!tenant?.id) return
    
    try {
      setLoadingCategories(true)
      const data = await productService.getCategories(tenant.id)
      console.log('[ProductForm] Categories loaded:', data.length, 'categories')
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleCategoryCreated = async (categoryId: string) => {
    await loadCategories()
    form.setValue('category_id', categoryId)
  }

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
            <div className="flex gap-2">
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
              <QuickCreateCategory onCategoryCreated={handleCategoryCreated} />
            </div>
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

      {/* Unidad de Medida */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Unidad de Medida</h3>
        <div className="space-y-4">
          {/* Select Unidad */}
          <div className="space-y-2">
            <Label htmlFor="unit_type" className="text-sm text-muted-foreground/80">
              Unidad de medida
            </Label>
            <select
              id="unit_type"
              {...register('unit_type', {
                onChange: (e) => {
                  const value = e.target.value
                  if (value === 'UNIT') {
                    form.setValue('allow_decimal', false)
                  }
                }
              })}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem] bg-[right_0.75rem_center] bg-no-repeat pr-12"
            >
              {UNIT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.unit_type && (
              <p className="text-sm text-destructive">{errors.unit_type.message}</p>
            )}
          </div>

          {/* Checkbox Decimal */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allow_decimal"
              checked={form.watch('allow_decimal')}
              onCheckedChange={(checked) => {
                form.setValue('allow_decimal', checked === true)
              }}
              disabled={form.watch('unit_type') === 'UNIT'}
              className="h-5 w-5"
            />
            <Label
              htmlFor="allow_decimal"
              className="text-sm font-normal cursor-pointer select-none"
            >
              Permitir cantidades decimales
            </Label>
          </div>
          <p className="text-xs text-muted-foreground/60">
            {form.watch('unit_type') === 'UNIT' 
              ? 'Las unidades solo permiten cantidades enteras'
              : 'Habilita para productos vendidos por peso o volumen (ej: 1.5 kg, 0.75 l)'}
          </p>
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
              step={isWeightedProduct ? "0.001" : "1"}
              min="0"
              {...register('stock', { 
                valueAsNumber: true,
                setValueAs: (v) => {
                  if (v === '' || v === null || v === undefined) return 0
                  const num = parseFloat(v)
                  if (isNaN(num)) return 0
                  // Para productos UNIT, redondear a entero
                  if (!isWeightedProduct) return Math.round(num)
                  // Para productos pesables, permitir hasta 3 decimales
                  return Number(num.toFixed(3))
                }
              })}
              placeholder="0"
              className="h-11"
              inputMode="decimal"
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
              step={isWeightedProduct ? "0.001" : "1"}
              min="0"
              {...register('minimum_stock', { 
                valueAsNumber: true,
                setValueAs: (v) => {
                  if (v === '' || v === null || v === undefined) return 0
                  const num = parseFloat(v)
                  if (isNaN(num)) return 0
                  // Para productos UNIT, redondear a entero
                  if (!isWeightedProduct) return Math.round(num)
                  // Para productos pesables, permitir hasta 3 decimales
                  return Number(num.toFixed(3))
                }
              })}
              placeholder="0"
              className="h-11"
              inputMode="decimal"
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
