export type CashSessionStatus = 'OPEN' | 'CLOSED'

export interface CashSession {
  id: string
  tenantId: string
  cashRegisterId: string
  cashRegisterName: string
  userId: string
  userName: string
  openingAmount: number
  closingAmount: number | null
  expectedAmount: number | null
  difference: number | null
  status: CashSessionStatus
  openedAt: string
  closedAt: string | null
  notes: string | null
}
