import { z } from 'zod'

/**
 * Payment methods enum
 */
export const paymentMethodSchema = z.enum(['CASH', 'CARD', 'TRANSFER'], {
  message: 'Método de pago inválido',
})

/**
 * Schema para un item de venta
 */
export const saleItemSchema = z.object({
  product_id: z.string()
    .uuid('ID de producto inválido'),
  
  quantity: z.number()
    .int('La cantidad debe ser un número entero')
    .positive('La cantidad debe ser mayor a 0'),
  
  unit_price: z.number()
    .positive('El precio unitario debe ser mayor a 0')
    .finite('El precio unitario debe ser un número válido'),
  
  subtotal: z.number()
    .nonnegative('El subtotal debe ser mayor o igual a 0')
    .finite('El subtotal debe ser un número válido'),
})
.refine(
  (data) => Math.abs(data.subtotal - (data.quantity * data.unit_price)) < 0.01,
  {
    message: 'El subtotal no coincide con cantidad × precio unitario',
    path: ['subtotal'],
  }
)

/**
 * Schema para crear una venta
 */
export const createSaleSchema = z.object({
  tenant_id: z.string()
    .uuid('ID de tenant inválido'),
  
  user_id: z.string()
    .uuid('ID de usuario inválido'),
  
  cash_register_id: z.string()
    .uuid('ID de caja registradora inválido'),
  
  cash_session_id: z.string()
    .uuid('ID de sesión de caja inválido'),
  
  payment_method: paymentMethodSchema,
  
  items: z.array(saleItemSchema)
    .min(1, 'La venta debe tener al menos un producto')
    .max(100, 'La venta no puede tener más de 100 productos'),
})
.refine(
  (data) => {
    // Validar que no haya productos duplicados
    const productIds = data.items.map(item => item.product_id)
    const uniqueIds = new Set(productIds)
    return productIds.length === uniqueIds.size
  },
  {
    message: 'La venta contiene productos duplicados',
    path: ['items'],
  }
)

/**
 * Schema para filtros de búsqueda de ventas
 */
export const salesFilterSchema = z.object({
  start_date: z.string()
    .datetime('Fecha de inicio inválida')
    .optional(),
  
  end_date: z.string()
    .datetime('Fecha de fin inválida')
    .optional(),
  
  payment_method: paymentMethodSchema
    .optional(),
  
  user_id: z.string()
    .uuid('ID de usuario inválido')
    .optional(),
  
  min_total: z.number()
    .nonnegative('El total mínimo debe ser mayor o igual a 0')
    .optional(),
  
  max_total: z.number()
    .positive('El total máximo debe ser mayor a 0')
    .optional(),
})
.refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.start_date) <= new Date(data.end_date)
    }
    return true
  },
  {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['end_date'],
  }
)
.refine(
  (data) => {
    if (data.min_total !== undefined && data.max_total !== undefined) {
      return data.min_total <= data.max_total
    }
    return true
  },
  {
    message: 'El total mínimo debe ser menor o igual al total máximo',
    path: ['max_total'],
  }
)

/**
 * Schema para período de tiempo (tabs)
 */
export const salesPeriodSchema = z.enum(['all', 'today', 'week', 'month'], {
  message: 'Período inválido',
})

/**
 * Schema para query params de la página de ventas
 */
export const salesQueryParamsSchema = z.object({
  period: salesPeriodSchema.default('all'),
  payment_method: paymentMethodSchema.optional(),
  search: z.string().optional(),
  user_id: z.string().uuid().optional(),
})

/**
 * Types inferidos de los schemas
 */
export type PaymentMethod = z.infer<typeof paymentMethodSchema>
export type SaleItemInput = z.infer<typeof saleItemSchema>
export type CreateSaleInput = z.infer<typeof createSaleSchema>
export type SalesFilterInput = z.infer<typeof salesFilterSchema>
export type SalesPeriod = z.infer<typeof salesPeriodSchema>
export type SalesQueryParams = z.infer<typeof salesQueryParamsSchema>
