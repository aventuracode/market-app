import { z } from 'zod'
import type { Money } from '@/lib/money'

// Cash Register Types
export interface CashRegister {
  id: string
  tenant_id: string
  name: string
  is_active: boolean
  created_at: string
}

export interface CashSession {
  id: string
  cash_register_id: string
  user_id: string
  opening_amount: Money
  closing_amount: Money
  expected_amount: Money
  difference: Money
  status: 'open' | 'closed'
  opened_at: string
  closed_at: string | null
  notes: string | null
}

// Cash Movement Types - UPPERCASE para coincidir con la base de datos
export type CashMovementType = 'SALE' | 'EXPENSE' | 'INCOME' | 'OPENING' | 'CLOSING' | 'ADJUSTMENT'

export interface CashMovement {
  id: string
  tenant_id: string
  cash_register_id: string
  cash_session_id: string
  user_id: string | null
  type: CashMovementType
  amount: Money
  reference_id: string | null
  notes: string | null
  created_at: string
}

export interface CashMovementWithUser extends CashMovement {
  user: {
    id: string
    first_name: string
    last_name: string
  } | null
}

// Cash Summary
export interface CashSummary {
  opening_amount: Money
  total_sales: Money
  total_income: Money
  total_expenses: Money
  total_card_sales: Money
  total_transfer_sales: Money
  current_balance: Money
  expected_balance: Money
}

// Form Schemas
export const openCashSchema = z.object({
  opening_amount: z
    .number()
    .min(0, 'El monto inicial no puede ser negativo')
    .max(9999999, 'El monto es demasiado grande'),
  notes: z
    .string()
    .max(500, 'Las notas no pueden tener más de 500 caracteres')
    .optional(),
})

export type OpenCashFormData = z.infer<typeof openCashSchema>

export const closeCashSchema = z.object({
  closing_amount: z
    .number()
    .min(0, 'El monto final no puede ser negativo')
    .max(9999999, 'El monto es demasiado grande'),
  notes: z
    .string()
    .max(500, 'Las notas no pueden tener más de 500 caracteres')
    .optional(),
})

export type CloseCashFormData = z.infer<typeof closeCashSchema>

export const cashMovementSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z
    .number()
    .min(0.01, 'El monto debe ser mayor a 0')
    .max(9999999, 'El monto es demasiado grande'),
  notes: z
    .string()
    .min(3, 'Las notas deben tener al menos 3 caracteres')
    .max(500, 'Las notas no pueden tener más de 500 caracteres'),
})

export type CashMovementFormData = z.infer<typeof cashMovementSchema>

// Movement type labels
export const MOVEMENT_TYPE_LABELS: Record<CashMovementType, string> = {
  INCOME: 'Ingreso',
  EXPENSE: 'Egreso',
  SALE: 'Venta',
  OPENING: 'Apertura',
  CLOSING: 'Cierre',
  ADJUSTMENT: 'Ajuste',
}

// Movement type colors
export const MOVEMENT_TYPE_COLORS: Record<CashMovementType, string> = {
  INCOME: 'text-green-600 bg-green-50 dark:bg-green-950',
  EXPENSE: 'text-red-600 bg-red-50 dark:bg-red-950',
  SALE: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
  OPENING: 'text-purple-600 bg-purple-50 dark:bg-purple-950',
  CLOSING: 'text-orange-600 bg-orange-50 dark:bg-orange-950',
  ADJUSTMENT: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950',
}
