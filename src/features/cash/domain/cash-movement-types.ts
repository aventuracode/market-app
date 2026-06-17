/**
 * Cash Movement Types Constants
 * Estos valores deben coincidir EXACTAMENTE con los tipos en la base de datos
 */
export const CASH_MOVEMENT_TYPES = {
  SALE: 'SALE',
  EXPENSE: 'EXPENSE',
  INCOME: 'INCOME',
  OPENING: 'OPENING',
  CLOSING: 'CLOSING',
  ADJUSTMENT: 'ADJUSTMENT',
} as const

export type CashMovementType =
  (typeof CASH_MOVEMENT_TYPES)[keyof typeof CASH_MOVEMENT_TYPES]

/**
 * Labels en español para mostrar en la UI
 */
export const CASH_MOVEMENT_LABELS: Record<CashMovementType, string> = {
  [CASH_MOVEMENT_TYPES.SALE]: 'Venta',
  [CASH_MOVEMENT_TYPES.EXPENSE]: 'Egreso',
  [CASH_MOVEMENT_TYPES.INCOME]: 'Ingreso',
  [CASH_MOVEMENT_TYPES.OPENING]: 'Apertura',
  [CASH_MOVEMENT_TYPES.CLOSING]: 'Cierre',
  [CASH_MOVEMENT_TYPES.ADJUSTMENT]: 'Ajuste',
}

/**
 * Colores para badges y UI
 */
export const CASH_MOVEMENT_COLORS: Record<CashMovementType, string> = {
  [CASH_MOVEMENT_TYPES.SALE]: 'blue',
  [CASH_MOVEMENT_TYPES.EXPENSE]: 'red',
  [CASH_MOVEMENT_TYPES.INCOME]: 'green',
  [CASH_MOVEMENT_TYPES.OPENING]: 'purple',
  [CASH_MOVEMENT_TYPES.CLOSING]: 'orange',
  [CASH_MOVEMENT_TYPES.ADJUSTMENT]: 'yellow',
}
