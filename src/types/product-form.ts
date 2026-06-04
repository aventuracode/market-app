import { z } from 'zod'
import type { UnitType } from './product'

/**
 * Schema de validación para crear/editar productos
 */
export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .nullable(),

  barcode: z
    .string()
    .min(1, 'El código de barras es requerido')
    .regex(/^[0-9]+$/, 'El código debe contener solo números')
    .min(8, 'El código debe tener al menos 8 dígitos')
    .max(13, 'El código no puede exceder 13 dígitos'),

  sku: z
    .string()
    .max(50, 'El SKU no puede exceder 50 caracteres')
    .optional()
    .nullable(),

  category_id: z
    .string()
    .uuid('Categoría inválida')
    .optional()
    .nullable(),

  sale_price: z
    .number({ required_error: 'El precio de venta es requerido' })
    .positive('El precio debe ser mayor a 0')
    .max(999999999, 'El precio es demasiado alto'),

  cost_price: z
    .number({ required_error: 'El precio de costo es requerido' })
    .min(0, 'El costo no puede ser negativo')
    .max(999999999, 'El costo es demasiado alto'),

  stock: z
    .number({ required_error: 'El stock es requerido' })
    .min(0, 'El stock no puede ser negativo')
    .max(999999, 'El stock es demasiado alto'),

  minimum_stock: z
    .number({ required_error: 'El stock mínimo es requerido' })
    .min(0, 'El stock mínimo no puede ser negativo')
    .max(999999, 'El stock mínimo es demasiado alto'),

  unit_type: z.enum(['UNIT', 'GRAM', 'KILOGRAM', 'LITER', 'MILLILITER']).default('UNIT'),

  allow_decimal: z.boolean().default(false),

  is_active: z.boolean().default(true),
})

export type ProductFormData = z.infer<typeof productFormSchema>

/**
 * Datos para crear un producto
 */
export interface CreateProductData extends ProductFormData {
  tenant_id: string
}

/**
 * Datos para actualizar un producto
 */
export interface UpdateProductData extends Partial<ProductFormData> {
  id: string
}
