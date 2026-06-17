import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesService } from '@/services/categories.service'
import type { CreateCategoryInput, UpdateCategoryInput } from '@/features/products/domain/category.schema'
import { useAuth } from '@/features/auth/application/use-auth'
import { toast } from 'sonner'

const CATEGORIES_QUERY_KEY = 'categories'

export function useCategories() {
  const { user } = useAuth()
  const tenantId = user?.tenant_id

  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, tenantId],
    queryFn: () => {
      if (!tenantId) throw new Error('No tenant ID')
      return categoriesService.getCategories(tenantId)
    },
    enabled: !!tenantId,
  })
}

export function useCategory(id: string) {
  const { user } = useAuth()
  const tenantId = user?.tenant_id

  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, id, tenantId],
    queryFn: () => {
      if (!tenantId) throw new Error('No tenant ID')
      return categoriesService.getCategoryById(id, tenantId)
    },
    enabled: !!tenantId && !!id,
  })
}

export function useCreateCategory() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const tenantId = user?.tenant_id

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => {
      if (!tenantId) throw new Error('No tenant ID')
      return categoriesService.createCategory(input, tenantId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] })
      toast.success('Categoría creada exitosamente')
    },
    onError: (error: Error) => {
      console.error('Error creating category:', error)
      toast.error('Error al crear la categoría')
    },
  })
}

export function useUpdateCategory() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const tenantId = user?.tenant_id

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) => {
      if (!tenantId) throw new Error('No tenant ID')
      return categoriesService.updateCategory(id, input, tenantId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] })
      toast.success('Categoría actualizada exitosamente')
    },
    onError: (error: Error) => {
      console.error('Error updating category:', error)
      toast.error('Error al actualizar la categoría')
    },
  })
}

export function useDeleteCategory() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const tenantId = user?.tenant_id

  return useMutation({
    mutationFn: (id: string) => {
      if (!tenantId) throw new Error('No tenant ID')
      return categoriesService.deleteCategory(id, tenantId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] })
      toast.success('Categoría eliminada exitosamente')
    },
    onError: (error: Error) => {
      console.error('Error deleting category:', error)
      toast.error('Error al eliminar la categoría')
    },
  })
}
