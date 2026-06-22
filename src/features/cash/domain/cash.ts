import { z } from 'zod'
import { SEMANTIC_COLORS } from '@/shared/config/semantic-colors'
import type { Money } from '@/shared/utils'
import type { Tables, Enums } from '@/shared/supabase/types'

// Cash Register Types
export type CashRegister = Omit<Tables<'cash_registers'>, 'is_active' | 'created_at'> & {
  is_active: boolean
  created_at: string
}

export type CashSession = Omit<Tables<'cash_sessions'>, 'opening_amount' | 'closing_amount' | 'expected_amount' | 'difference' | 'opened_at'> & {
  opening_amount: Money
  closing_amount: Money
  expected_amount: Money
  difference: Money
  status: 'OPEN' | 'CLOSED'
  opened_at: string
}

// CashMovement DB type (raw from Supabase)
export type CashMovementDB = Tables<'cash_movements'>

// CashMovement domain type (normalized)
export type CashMovement = Omit<CashMovementDB, 'amount' | 'created_at'> & {
  amount: Money
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

export type CashMovementType = Enums<'cash_movement_type'>

export const CASH_MOVEMENT_LABELS: Record<CashMovementType, string> = {
  OPENING: 'Apertura',
  SALE: 'Venta',
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
  CLOSING: 'Cierre',
  ADJUSTMENT: 'Ajuste',
}

export const CASH_MOVEMENT_COLORS: Record<CashMovementType, string> = {
  OPENING: `${SEMANTIC_COLORS.transfer.text} ${SEMANTIC_COLORS.transfer.bg}`,
  SALE: `${SEMANTIC_COLORS.card.text} ${SEMANTIC_COLORS.card.bg}`,
  INCOME: `${SEMANTIC_COLORS.success.text} ${SEMANTIC_COLORS.success.bg}`,
  EXPENSE: `${SEMANTIC_COLORS.danger.text} ${SEMANTIC_COLORS.danger.bg}`,
  CLOSING: 'text-orange-600 bg-orange-50',  // TODO: revisar semántica (orange no tiene equivalente)
  ADJUSTMENT: 'text-yellow-600 bg-yellow-50',  // TODO: revisar semántica (yellow vs amber)
}