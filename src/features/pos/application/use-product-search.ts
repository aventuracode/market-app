'use client'

import { useState, useEffect, useCallback } from 'react'
import { productService } from '@/features/products/infrastructure/product.service'
import { useTenant } from '@/features/auth/application/use-tenant'
import type { ProductSearchParams, ProductWithCategory } from '@/features/products/domain/product'
import type { ProductSearchOptions } from '../domain/pos.types'

export function useProductSearch(options: ProductSearchOptions = {}) {
  const { debounceMs = 300, autoSearch = true } = options
  const { tenant } = useTenant()

  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const searchProducts = useCallback(
    async (searchQuery: string, params: ProductSearchParams = {}) => {
      if (!tenant?.id) return

      setLoading(true)
      setError(null)

      try {
        const result = await productService.searchProducts(tenant.id, {
          query: searchQuery,
          ...params,
        })

        setProducts(result.products)
        setTotal(result.total)
        setHasMore(result.hasMore)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al buscar productos')
        setProducts([])
      } finally {
        setLoading(false)
      }
    },
    [tenant?.id]
  )

  useEffect(() => {
    if (!autoSearch) return

    const timer = setTimeout(() => {
      searchProducts(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, autoSearch, debounceMs, searchProducts])

  const clearSearch = useCallback(() => {
    setQuery('')
    setProducts([])
    setError(null)
    setTotal(0)
    setHasMore(false)
  }, [])

  return {
    query,
    setQuery,
    products,
    loading,
    error,
    hasMore,
    total,
    searchProducts,
    clearSearch,
  }
}
