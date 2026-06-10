import { z } from 'zod'

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  description: z
    .string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .nullable()
    .optional(),
  is_active: z.boolean().default(true),
})
export type CategoryFormInput = z.input<typeof categoryFormSchema>

export type CategoryFormData = z.output<typeof categoryFormSchema>

export interface CreateCategoryData extends CategoryFormData {
  tenant_id: string
}

export interface UpdateCategoryData extends Partial<CategoryFormData> {}
