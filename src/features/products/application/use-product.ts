import { useEffect, useState } from 'react'
import { productService } from '../infrastructure/product.service'
import { useTenant } from '@/features/auth'
import type { Product } from '../domain/product'

interface UseProductOptions {
  productId: string
  autoLoad?: boolean
}

interface UseProductReturn {
  product: Product | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook para cargar un producto por ID
 * Encapsula la lógica de carga y manejo de estados
 */
export function useProduct(
  productId: string,
  options: { autoLoad?: boolean } = { autoLoad: true }
): UseProductReturn {
  const { tenant } = useTenant()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProduct = async () => {
    if (!tenant?.id || !productId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await productService.getProductById(tenant.id, productId)
      setProduct(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el producto')
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (options.autoLoad !== false) {
      loadProduct()
    }
  }, [tenant?.id, productId, options.autoLoad])

  return {
    product,
    loading,
    error,
    refresh: loadProduct,
  }
}
