import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateCategoryInput, UpdateCategoryInput } from '@/features/products/domain/category.schema'
import { useAuth } from '@/features/auth'
import { toast } from 'sonner'
import { categoryService } from '../../infrastructure/category.service'

const CATEGORIES_QUERY_KEY = 'categories'

export function useCategories(searchQuery?: string) {
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, tenantId, searchQuery],
    queryFn: () => {
      if (!tenantId) throw new Error('No tenant ID')
      return categoryService.getCategories(tenantId, searchQuery)
    },
    enabled: !!tenantId,
  })
}

export function useCategory(id: string) {
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, id, tenantId],
    queryFn: () => {
      if (!tenantId) throw new Error('No tenant ID')
      return categoryService.getCategoryById(id, tenantId)
    },
    enabled: !!tenantId && !!id,
  })
}

export function useCreateCategory() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const tenantId = user?.tenantId

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => {
      if (!tenantId) throw new Error('No tenant ID')
      return categoryService.createCategory(input, tenantId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] })
      toast.success('Categoría creada exitosamente')
    },
    onError: (error: Error) => {
      toast.error('Error al crear la categoría')
    },
  })
}

export function useUpdateCategory() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const tenantId = user?.tenantId

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) => {
      if (!tenantId) throw new Error('No tenant ID')
      return categoryService.updateCategory(id, input, tenantId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] })
      toast.success('Categoría actualizada exitosamente')
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar la categoría')
    },
  })
}

export function useDeleteCategory() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const tenantId = user?.tenantId

  return useMutation({
    mutationFn: (id: string) => {
      if (!tenantId) throw new Error('No tenant ID')
      return categoryService.deleteCategory(id, tenantId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] })
      toast.success('Categoría eliminada exitosamente')
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar la categoría')
    },
  })
}
