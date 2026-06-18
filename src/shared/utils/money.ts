/**
 * Money type system for financial operations
 * Garantiza que nunca existan NaN, null o undefined en operaciones financieras
 * Arquitectura tipo Stripe/Shopify POS
 */

export type Money = number

/**
 * Convierte cualquier valor a Money seguro
 * NUNCA retorna NaN, null o undefined
 */
export function money(value: unknown): Money {
  if (value === null || value === undefined) return 0
  
  if (typeof value === 'number') {
    if (!isFinite(value)) return 0
    return Math.round(value * 100) / 100
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (!isFinite(parsed)) return 0
    return Math.round(parsed * 100) / 100
  }
  
  return 0
}

/**
 * Suma dos valores Money
 */
export function addMoney(a: unknown, b: unknown): Money {
  return money(money(a) + money(b))
}

/**
 * Resta dos valores Money
 */
export function subtractMoney(a: unknown, b: unknown): Money {
  return money(money(a) - money(b))
}

/**
 * Multiplica Money por un factor
 */
export function multiplyMoney(a: unknown, factor: number): Money {
  return money(money(a) * factor)
}

/**
 * Valida que un valor Money sea válido para transacciones
 */
export function isValidMoney(value: unknown): boolean {
  const m = money(value)
  return isFinite(m) && m >= 0
}

/**
 * Valida que un total sea válido para checkout
 * Lanza error si no es válido
 */
export function validateCheckoutTotal(total: unknown): Money {
  const m = money(total)
  if (!isFinite(m) || m < 0) {
    throw new Error(`Invalid checkout total: ${total}`)
  }
  return m
}