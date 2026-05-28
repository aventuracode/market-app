import { z } from 'zod'

/**
 * Schema para crear un producto
 */
export const createProductSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .nullable(),
  
  sku: z.string()
    .max(50, 'El SKU no puede exceder 50 caracteres')
    .optional()
    .nullable(),
  
  barcode: z.string()
    .max(50, 'El código de barras no puede exceder 50 caracteres')
    .optional()
    .nullable(),
  
  category_id: z.string()
    .uuid('ID de categoría inválido')
    .optional()
    .nullable(),
  
  purchase_price: z.number()
    .nonnegative('El precio de compra debe ser mayor o igual a 0')
    .finite('El precio de compra debe ser un número válido'),
  
  sale_price: z.number()
    .positive('El precio de venta debe ser mayor a 0')
    .finite('El precio de venta debe ser un número válido'),
  
  stock: z.number()
    .int('El stock debe ser un número entero')
    .nonnegative('El stock debe ser mayor o igual a 0')
    .default(0),
  
  min_stock: z.number()
    .int('El stock mínimo debe ser un número entero')
    .nonnegative('El stock mínimo debe ser mayor o igual a 0')
    .default(0),
  
  image_url: z.string()
    .url('URL de imagen inválida')
    .optional()
    .nullable(),
  
  is_active: z.boolean()
    .default(true),
})
.refine(
  (data) => data.sale_price >= data.purchase_price,
  {
    message: 'El precio de venta debe ser mayor o igual al precio de compra',
    path: ['sale_price'],
  }
)

/**
 * Schema para actualizar un producto
 * Todos los campos son opcionales
 */
export const updateProductSchema = createProductSchema.partial()

/**
 * Schema para búsqueda de productos
 */
export const productSearchSchema = z.object({
  query: z.string()
    .min(2, 'La búsqueda debe tener al menos 2 caracteres')
    .max(100, 'La búsqueda no puede exceder 100 caracteres'),
  
  category_id: z.string()
    .uuid('ID de categoría inválido')
    .optional(),
  
  is_active: z.boolean()
    .optional(),
  
  min_stock: z.number()
    .int()
    .nonnegative()
    .optional(),
})

/**
 * Types inferidos de los schemas
 */
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductSearchInput = z.infer<typeof productSearchSchema>
