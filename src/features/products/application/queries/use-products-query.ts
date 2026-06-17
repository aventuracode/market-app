'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '@/features/products/infrastructure/product.service'
import { useTenant } from '@/features/auth/application/use-tenant'
import { CreateProductParams, UpdateProductParams } from '../../domain/product'

/**
 * Hook para obtener todos los productos con React Query
 * Incluye caching automático y refetch inteligente
 */
export function useProductsQuery() {
  const { tenant } = useTenant()

  return useQuery({
    queryKey: ['products', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) throw new Error('No tenant active')
      return productService.getProducts(tenant.id)
    },
    enabled: !!tenant?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para obtener un producto por ID
 */
export function useProductQuery(productId: string | null) {
  const { tenant } = useTenant()

  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) throw new Error('No product ID')
      if (!tenant?.id) throw new Error('No tenant active')
      return productService.getProductById(tenant.id, productId)
    },
    enabled: !!productId && !!tenant?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para buscar productos
 */
// export function useProductSearchQuery(searchTerm: string) {
//   const { tenant } = useTenant()

//   return useQuery({
//     queryKey: ['products', 'search', searchTerm, tenant?.id],
//     queryFn: async () => {
//       if (!tenant?.id) throw new Error('No tenant active')
//       return productService.searchProducts(tenant.id, searchTerm)
//     },
//     enabled: !!tenant?.id && searchTerm.length >= 2,
//     staleTime: 30 * 1000, // 30 segundos
//   })
// }

/**
 * Hook para crear un producto
 */
export function useCreateProductMutation() {
  const queryClient = useQueryClient()
  const { tenant } = useTenant()

  return useMutation({
    mutationFn: async (params: CreateProductParams) => {
      if (!tenant?.id) throw new Error('No tenant active')
      return productService.createProduct(tenant.id, params)
    },
    onSuccess: () => {
      // Invalidar cache de productos para refetch automático
      queryClient.invalidateQueries({ queryKey: ['products', tenant?.id] })
    },
  })
}

/**
 * Hook para actualizar un producto
 */
export function useUpdateProductMutation() {
  const queryClient = useQueryClient()
  const { tenant } = useTenant()

  return useMutation({
    mutationFn: async ({ productId, params }: { productId: string; params: UpdateProductParams }) => {
      if (!tenant?.id) throw new Error('No tenant active')
      return productService.updateProduct(productId, tenant.id, params)
    },
    onSuccess: (_, variables) => {
      // Invalidar cache del producto específico y lista de productos
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products', tenant?.id] })
    },
  })
}

/**
 * Hook para eliminar un producto
 */
export function useDeleteProductMutation() {
  const queryClient = useQueryClient()
  const { tenant } = useTenant()
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!tenant?.id) throw new Error('No tenant active')
      return productService.deleteProduct(productId, tenant.id)
    },
    onSuccess: () => {
      // Invalidar cache de productos
      queryClient.invalidateQueries({ queryKey: ['products', tenant?.id] })
    },
  })
}
