import { money } from '@/shared/utils'
import type { Tables } from '@/shared/supabase/types'
import type { CashMovement, CashMovementDB, CashMovementWithUser, CashSession, CashRegister } from '../domain/cash'

/**
 * DB types (raw from Supabase)
 */
export type CashSessionDB = Tables<'cash_sessions'>
export type CashRegisterDB = Tables<'cash_registers'>

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

/**
 * Normaliza una sesión de caja de DB a tipo de dominio
 * - Convierte number → Money para amounts
 * - Garantiza opened_at como string
 */
export function mapCashSession(raw: CashSessionDB): CashSession {
  return {
    ...raw,
    opening_amount: money(raw.opening_amount),
    closing_amount: money(raw.closing_amount ?? 0),
    expected_amount: money(raw.expected_amount ?? 0),
    difference: money(raw.difference ?? 0),
    status: (raw.status?.toUpperCase() as 'OPEN' | 'CLOSED') ?? 'OPEN',
    opened_at: raw.opened_at ?? new Date().toISOString(),
  }
}

/**
 * Normaliza un registro de caja de DB a tipo de dominio
 * - Garantiza is_active como boolean
 * - Garantiza created_at como string
 */
export function mapCashRegister(raw: CashRegisterDB): CashRegister {
  return {
    ...raw,
    is_active: raw.is_active ?? true,
    created_at: raw.created_at ?? new Date().toISOString(),
  }
}

/**
 * Batch mapper para registros de caja
 */
export function mapCashRegisters(raws: CashRegisterDB[]): CashRegister[] {
  return raws.map(mapCashRegister)
}
