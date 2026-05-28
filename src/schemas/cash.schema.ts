import { z } from 'zod'
import { CASH_MOVEMENT_TYPES } from '@/constants/cash-movement-types'

/**
 * Cash movement types enum
 */
export const cashMovementTypeSchema = z.enum([
  CASH_MOVEMENT_TYPES.SALE,
  CASH_MOVEMENT_TYPES.EXPENSE,
  CASH_MOVEMENT_TYPES.INCOME,
  CASH_MOVEMENT_TYPES.OPENING,
  CASH_MOVEMENT_TYPES.CLOSING,
  CASH_MOVEMENT_TYPES.ADJUSTMENT,
] as const, {
  message: 'Tipo de movimiento inválido',
})

/**
 * Schema para abrir sesión de caja
 */
export const openCashSessionSchema = z.object({
  tenant_id: z.string()
    .uuid('ID de tenant inválido'),
  
  cash_register_id: z.string()
    .uuid('ID de caja registradora inválido'),
  
  user_id: z.string()
    .uuid('ID de usuario inválido'),
  
  opening_amount: z.number()
    .nonnegative('El monto de apertura debe ser mayor o igual a 0')
    .finite('El monto de apertura debe ser un número válido'),
  
  notes: z.string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional()
    .nullable(),
})

/**
 * Schema para cerrar sesión de caja
 */
export const closeCashSessionSchema = z.object({
  session_id: z.string()
    .uuid('ID de sesión inválido'),
  
  closing_amount: z.number()
    .nonnegative('El monto de cierre debe ser mayor o igual a 0')
    .finite('El monto de cierre debe ser un número válido'),
  
  expected_amount: z.number()
    .nonnegative('El monto esperado debe ser mayor o igual a 0')
    .finite('El monto esperado debe ser un número válido'),
  
  notes: z.string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional()
    .nullable(),
})
.refine(
  (data) => Math.abs(data.closing_amount - data.expected_amount) < 10000, // Diferencia máxima razonable
  {
    message: 'La diferencia entre el monto de cierre y el esperado es muy grande. Verifica los valores.',
    path: ['closing_amount'],
  }
)

/**
 * Schema para crear un movimiento de caja
 */
export const createCashMovementSchema = z.object({
  tenant_id: z.string()
    .uuid('ID de tenant inválido'),
  
  cash_register_id: z.string()
    .uuid('ID de caja registradora inválido'),
  
  cash_session_id: z.string()
    .uuid('ID de sesión de caja inválido'),
  
  user_id: z.string()
    .uuid('ID de usuario inválido'),
  
  type: cashMovementTypeSchema,
  
  amount: z.number()
    .positive('El monto debe ser mayor a 0')
    .finite('El monto debe ser un número válido'),
  
  notes: z.string()
    .min(1, 'Las notas son requeridas')
    .max(500, 'Las notas no pueden exceder 500 caracteres'),
  
  reference_id: z.string()
    .uuid('ID de referencia inválido')
    .optional()
    .nullable(),
})

/**
 * Schema para filtros de movimientos de caja
 */
export const cashMovementsFilterSchema = z.object({
  cash_register_id: z.string()
    .uuid('ID de caja registradora inválido')
    .optional(),
  
  cash_session_id: z.string()
    .uuid('ID de sesión de caja inválido')
    .optional(),
  
  type: cashMovementTypeSchema
    .optional(),
  
  start_date: z.string()
    .datetime('Fecha de inicio inválida')
    .optional(),
  
  end_date: z.string()
    .datetime('Fecha de fin inválida')
    .optional(),
  
  min_amount: z.number()
    .nonnegative('El monto mínimo debe ser mayor o igual a 0')
    .optional(),
  
  max_amount: z.number()
    .positive('El monto máximo debe ser mayor a 0')
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
    if (data.min_amount !== undefined && data.max_amount !== undefined) {
      return data.min_amount <= data.max_amount
    }
    return true
  },
  {
    message: 'El monto mínimo debe ser menor o igual al monto máximo',
    path: ['max_amount'],
  }
)

/**
 * Types inferidos de los schemas
 */
export type CashMovementType = z.infer<typeof cashMovementTypeSchema>
export type OpenCashSessionInput = z.infer<typeof openCashSessionSchema>
export type CloseCashSessionInput = z.infer<typeof closeCashSessionSchema>
export type CreateCashMovementInput = z.infer<typeof createCashMovementSchema>
export type CashMovementsFilterInput = z.infer<typeof cashMovementsFilterSchema>
