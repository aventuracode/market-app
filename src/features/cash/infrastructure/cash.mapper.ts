import { money } from '@/lib/money'
import type { CashMovement, CashMovementDB, CashMovementWithUser } from '../domain/cash'

/**
 * Raw cash movement with user from Supabase query
 */
type RawCashMovementWithUser = CashMovementDB & {
  users: {
    id: string
    first_name: string
    last_name: string
  } | null
}

/**
 * Normaliza un movimiento de caja de DB a tipo de dominio
 * - Convierte number → Money para amount
 * - Garantiza created_at como string
 */
export function mapCashMovement(raw: CashMovementDB): CashMovement {
  return {
    ...raw,
    amount: money(raw.amount),
    created_at: raw.created_at ?? new Date().toISOString(),
  }
}

/**
 * Normaliza un movimiento de caja con usuario de DB a tipo de dominio
 */
export function mapCashMovementWithUser(raw: RawCashMovementWithUser): CashMovementWithUser {
  return {
    ...mapCashMovement(raw),
    user: raw.users ? {
      id: raw.users.id,
      first_name: raw.users.first_name,
      last_name: raw.users.last_name,
    } : null,
  }
}

/**
 * Batch mapper para movimientos de caja
 */
export function mapCashMovements(raws: CashMovementDB[]): CashMovement[] {
  return raws.map(mapCashMovement)
}

/**
 * Batch mapper para movimientos de caja con usuario
 */
export function mapCashMovementsWithUser(raws: RawCashMovementWithUser[]): CashMovementWithUser[] {
  return raws.map(mapCashMovementWithUser)
}
