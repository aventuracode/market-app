/**
 * Schemas centralizados para validación con Zod
 * 
 * Todos los schemas de validación del proyecto están aquí
 * para facilitar su reutilización y mantenimiento.
 */

// Product schemas
export * from '../features/products/domain/product.schema'

// Sale schemas
export * from '../features/checkout/domain/sale.schema'

// Cash schemas
export * from '../features/cash/domain/cash.schema'

// Category schemas
export * from '../features/products/domain/category.schema'
