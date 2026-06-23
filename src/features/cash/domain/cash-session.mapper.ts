import type { CashSession } from './cash-session'

export function mapToCashSession(raw: any): CashSession {
  return {
    id: raw.id,
    tenantId: raw.tenant_id,
    cashRegisterId: raw.cash_register_id,
    cashRegisterName: raw.cash_registers?.name || '',
    userId: raw.user_id,
    userName: [raw.users?.first_name, raw.users?.last_name].filter(Boolean).join(' ') || '',
    openingAmount: raw.opening_amount,
    closingAmount: raw.closing_amount,
    expectedAmount: raw.expected_amount,
    difference: raw.difference,
    status: raw.status,
    openedAt: raw.opened_at,
    closedAt: raw.closed_at,
    notes: raw.notes,
  }
}
