'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productService } from '@/features/products/infrastructure/product.service'
import { useTenant } from '@/features/auth'
import {
  productFormSchema,
  type ProductFormData,
} from '@/features/products/domain/product-form'
import type { Product, UnitType } from '@/features/products/domain/product'

interface UseProductFormOptions {
  product?: Product
  onSuccess?: (product: Product) => void
  onError?: (error: Error) => void
}

export function useProductForm(options: UseProductFormOptions = {}) {
  const { product, onSuccess, onError } = options
  const { tenant } = useTenant()
  const [loading, setLoading] = useState(false)

const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description || '',
          barcode: product.barcode || '',
          sku: product.sku || '',
          category_id: product.category_id || '',
          sale_price: product.sale_price,
          cost_price: product.cost_price || undefined,
          stock: product.stock,
          minimum_stock: product.minimum_stock,
          unit_type: (product.unit_type as UnitType) || 'UNIT',
          allow_decimal: product.allow_decimal || false,
          is_active: product.is_active,
        }
      : {
          name: '',
          description: '',
          barcode: '',
          sku: '',
          category_id: '',
          sale_price: 0,
          cost_price: undefined,
          stock: 0,
          minimum_stock: 0,
          unit_type: 'UNIT',
          allow_decimal: false,
          is_active: true,
        },
  })

  const onSubmit = async (data: ProductFormData) => {
    if (!tenant?.id) {
      onError?.(new Error('No hay tenant activo'))
      return
    }

    try {
      setLoading(true)

      let result: Product

      // Función de redondeo precisa para evitar problemas de punto flotante
      const roundPrice = (price: number): number => {
        return Math.round((price + Number.EPSILON) * 100) / 100
      }

      // Redondear precios a 2 decimales para evitar problemas de precisión
      const roundedData = {
        ...data,
        sale_price: roundPrice(data.sale_price),
        cost_price: data.cost_price ? roundPrice(data.cost_price) : undefined,
        
      }

      if (product) {
        // Actualizar producto existente
        result = await productService.updateProduct( product.id,tenant.id, {
          ...roundedData,
          description: roundedData.description || null,
          sku: roundedData.sku || null,
          category_id: roundedData.category_id || null,
        })
      } else {
        // Crear nuevo producto
        result = await productService.createProduct(tenant.id, {
          ...roundedData,
          description: roundedData.description || null,
          sku: roundedData.sku || null,
          category_id: roundedData.category_id || null,
        })
      }

      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al guardar el producto')
      onError?.(error)
      form.setError('root', {
        message: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    loading,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
