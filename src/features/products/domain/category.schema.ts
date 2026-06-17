import { z } from 'zod'

/**
 * Schema para crear una categoría
 */
export const createCategorySchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .nullable(),
})

/**
 * Schema para actualizar una categoría
 */
export const updateCategorySchema = createCategorySchema.partial()

/**
 * Types inferidos de los schemas
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

/**
 * Tipo para categoría con conteo de productos
 */
export interface CategoryWithProductCount {
  id: string
  name: string
  description: string | null
  is_active: boolean | null
  tenant_id: string
  created_at: string | null
  updated_at: string | null
  product_count: number
}

/**
 * Props para el componente CategoryCard
 */
export interface CategoryCardProps {
  category: CategoryWithProductCount
  onEdit: (category: CategoryWithProductCount) => void
  onDelete: (category: CategoryWithProductCount) => void
}
