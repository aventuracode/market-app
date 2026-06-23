'use client'

import { useState, useEffect, useCallback } from 'react'
import { productService } from '@/features/products/infrastructure/product.service'
import { useTenant } from '@/features/auth'
import { ProductSearchParams, ProductWithCategory } from '../domain/product'


interface UseProductsOptions {
  initialParams?: ProductSearchParams
  autoLoad?: boolean
}

export function useProducts(options: UseProductsOptions = {}) {
  const { initialParams = {}, autoLoad = true } = options
  const { tenant } = useTenant()

  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [params, setParams] = useState<ProductSearchParams>(initialParams)

  const loadProducts = useCallback(
    async (searchParams: ProductSearchParams = params, append = false) => {
      if (!tenant?.id) return

      try {
        setLoading(true)
        setError(null)

        const result = await productService.searchProducts(
          tenant.id,
          searchParams
        )

        setProducts((prev) => (append ? [...prev, ...result.products] : result.products))
        setHasMore(result.hasMore)
        setTotal(result.total)
        setParams(searchParams)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar productos')
      } finally {
        setLoading(false)
      }
    },
    [tenant?.id, params]
  )

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return

    const nextParams = {
      ...params,
      offset: (params.offset || 0) + (params.limit || 20),
    }

    loadProducts(nextParams, true)
  }, [hasMore, loading, params, loadProducts])

  const search = useCallback(
    (query: string) => {
      const searchParams = {
        ...params,
        query,
        offset: 0,
      }
      loadProducts(searchParams)
    },
    [params, loadProducts]
  )

  const filterByCategory = useCallback(
    (categoryId: string | undefined) => {
      const searchParams = {
        ...params,
        categoryId,
        offset: 0,
      }
      loadProducts(searchParams)
    },
    [params, loadProducts]
  )

  const refresh = useCallback(() => {
    loadProducts({ ...params, offset: 0 })
  }, [params, loadProducts])

  useEffect(() => {
    if (autoLoad && tenant?.id) {
      loadProducts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id, autoLoad]) // Solo cargar cuando cambia el tenant

  return {
    products,
    loading,
    error,
    hasMore,
    total,
    loadMore,
    search,
    filterByCategory,
    refresh,
  }
}
