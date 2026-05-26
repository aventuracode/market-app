'use client'

import { useState, useEffect, useCallback } from 'react'
import { categoryService } from '@/services/category.service'
import { useTenant } from '@/hooks/use-tenant'
import type { Category } from '@/types/product'

export function useCategories() {
  const { tenant } = useTenant()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadCategories = useCallback(async () => {
    if (!tenant?.id) return

    try {
      setLoading(true)
      setError(null)
      const data = await categoryService.getCategories(tenant.id, searchQuery)
      setCategories(data)
    } catch (err) {
      console.error('Error loading categories:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar las categorías')
    } finally {
      setLoading(false)
    }
  }, [tenant?.id, searchQuery])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const refresh = useCallback(() => {
    loadCategories()
  }, [loadCategories])

  return {
    categories,
    loading,
    error,
    searchQuery,
    search,
    refresh,
    total: categories.length,
  }
}
