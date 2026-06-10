'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categoryService } from '@/services/category.service'
import { useTenant } from '@/hooks/use-tenant'
import {
  categoryFormSchema,
  type CategoryFormInput,
  type CategoryFormData,
} from '@/types/category-form'
import type { Category } from '@/types/product'

interface UseCategoryFormOptions {
  category?: Category
  onSuccess?: (category: Category) => void
  onError?: (error: Error) => void
}

export function useCategoryForm(options: UseCategoryFormOptions = {}) {
  const { category, onSuccess, onError } = options
  const { tenant } = useTenant()
  const [loading, setLoading] = useState(false)

  const form = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: category
      ? {
          name: category.name,
          description: category.description || '',
          is_active: category.is_active,
        }
      : {
          name: '',
          description: '',
          is_active: true,
        },
  })

  const onSubmit = async (data: CategoryFormInput) => {
    const parsedData = categoryFormSchema.parse(data)
    if (!tenant?.id) {
      onError?.(new Error('No hay tenant activo'))
      return
    }

    try {
      setLoading(true)

      let result: Category

      if (category) {
        result = await categoryService.updateCategory(category.id, {
          ...parsedData,
          description: parsedData.description || null,
        })
      } else {
        result = await categoryService.createCategory({
          tenant_id: tenant.id,
          ...parsedData,
          description: parsedData.description || null,
        })
      }

      onSuccess?.(result)
    } catch (err) {
      console.error('Error saving category:', err)
      const error = err instanceof Error ? err : new Error('Error al guardar la categoría')
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
