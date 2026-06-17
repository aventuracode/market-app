import {
  CASH_MOVEMENT_TYPES,
  CASH_MOVEMENT_LABELS,
  CASH_MOVEMENT_COLORS,
  type CashMovementType,
} from '@/features/cash/domain/cash-movement-types'

/**
 * Obtiene el label en español para un tipo de movimiento
 */
export function getCashMovementLabel(type: CashMovementType): string {
  return CASH_MOVEMENT_LABELS[type] || type
}

/**
 * Obtiene el color asociado a un tipo de movimiento
 */
export function getCashMovementColor(type: CashMovementType): string {
  return CASH_MOVEMENT_COLORS[type] || 'gray'
}

/**
 * Determina si un movimiento es un ingreso (suma al balance)
 */
export function isIncomeMovement(type: CashMovementType): boolean {
  return (
    type === CASH_MOVEMENT_TYPES.SALE ||
    type === CASH_MOVEMENT_TYPES.INCOME ||
    type === CASH_MOVEMENT_TYPES.OPENING
  )
}

/**
 * Determina si un movimiento es un egreso (resta del balance)
 */
export function isExpenseMovement(type: CashMovementType): boolean {
  return (
    type === CASH_MOVEMENT_TYPES.EXPENSE ||
    type === CASH_MOVEMENT_TYPES.CLOSING
  )
}

/**
 * Calcula el signo del movimiento para mostrar en UI
 */
export function getMovementSign(type: CashMovementType): '+' | '-' | '' {
  if (isIncomeMovement(type)) return '+'
  if (isExpenseMovement(type)) return '-'
  return ''
}

/**
 * Obtiene las clases CSS para el color de fondo según el tipo
 */
export function getMovementBackgroundClass(type: CashMovementType): string {
  const color = getCashMovementColor(type)
  return `bg-${color}-100 dark:bg-${color}-950`
}

/**
 * Obtiene las clases CSS para el color de texto según el tipo
 */
export function getMovementTextClass(type: CashMovementType): string {
  const color = getCashMovementColor(type)
  return `text-${color}-600`
}
