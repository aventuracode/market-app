import { createClient } from '@/lib/supabase/client'
import type {
  CashRegister,
  CashSession,
  CashMovement,
  CashMovementWithUser,
  CashSummary,
  CashMovementType,
} from '@/types/cash'

class CashService {
  private supabase = createClient()

  async getActiveCashRegister(
    tenantId: string,
    userId: string
  ): Promise<{ register: CashRegister; session: CashSession } | null> {
    const { data: sessions, error } = await this.supabase
      .from('cash_sessions')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .eq('status', 'open')
      .order('opened_at', { ascending: false })
      .limit(1)

    if (error || !sessions || sessions.length === 0) {
      return null
    }

    const session = sessions[0]
    const { data: register } = await this.supabase
      .from('cash_registers')
      .select('*')
      .eq('id', session.cash_register_id)
      .single()

    if (!register) return null

    return {
      register,
      session: {
        id: session.id,
        cash_register_id: session.cash_register_id,
        user_id: session.user_id,
        opening_amount: Number(session.opening_amount),
        closing_amount: session.closing_amount ? Number(session.closing_amount) : null,
        expected_amount: session.expected_amount ? Number(session.expected_amount) : null,
        difference: session.difference ? Number(session.difference) : null,
        status: session.status,
        opened_at: session.opened_at,
        closed_at: session.closed_at,
        notes: session.notes,
      },
    }
  }

  async openCash(
    tenantId: string,
    userId: string,
    cashRegisterId: string,
    openingAmount: number,
    notes?: string
  ): Promise<CashSession> {
    const activeSession = await this.getActiveCashRegister(tenantId, userId)
    if (activeSession) {
      throw new Error('Ya tienes una caja abierta')
    }

    const { data, error } = await this.supabase
      .from('cash_sessions')
      .insert({
        tenant_id: tenantId,
        cash_register_id: cashRegisterId,
        user_id: userId,
        opening_amount: openingAmount,
        status: 'open',
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error opening cash:', error)
      throw new Error(error.message || 'Error al abrir la caja')
    }

    return {
      id: data.id,
      cash_register_id: data.cash_register_id,
      user_id: data.user_id,
      opening_amount: Number(data.opening_amount),
      closing_amount: null,
      expected_amount: null,
      difference: null,
      status: data.status,
      opened_at: data.opened_at,
      closed_at: null,
      notes: data.notes,
    }
  }

  async closeCash(
    sessionId: string,
    closingAmount: number,
    notes?: string
  ): Promise<CashSession> {
    const summary = await this.getCashSummary(sessionId)
    const expectedAmount = summary.expected_balance
    const difference = closingAmount - expectedAmount

    const { data, error } = await this.supabase
      .from('cash_sessions')
      .update({
        closing_amount: closingAmount,
        expected_amount: expectedAmount,
        difference: difference,
        status: 'closed',
        closed_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      console.error('Error closing cash:', error)
      throw new Error(error.message || 'Error al cerrar la caja')
    }

    return {
      id: data.id,
      cash_register_id: data.cash_register_id,
      user_id: data.user_id,
      opening_amount: Number(data.opening_amount),
      closing_amount: Number(data.closing_amount),
      expected_amount: Number(data.expected_amount),
      difference: Number(data.difference),
      status: data.status,
      opened_at: data.opened_at,
      closed_at: data.closed_at,
      notes: data.notes,
    }
  }

  async getCashSummary(sessionId: string): Promise<CashSummary> {
    const { data: session, error: sessionError } = await this.supabase
      .from('cash_sessions')
      .select('opening_amount, cash_register_id, opened_at')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      throw new Error('Sesión no encontrada')
    }

    // Obtener movimientos de la sesión actual
    // Usar cash_session_id si existe en la tabla, sino filtrar por fecha
    const { data: movements } = await this.supabase
      .from('cash_movements')
      .select('type, amount, created_at')
      .eq('cash_register_id', session.cash_register_id)
      .gte('created_at', session.opened_at)

    if (process.env.NODE_ENV === 'development') {
      console.log('[getCashSummary] Session opened_at:', session.opened_at)
      console.log('[getCashSummary] Movements found:', movements?.length)
      console.log('[getCashSummary] Movements:', movements)
    }

    const openingAmount = Number(session.opening_amount)
    let totalSales = 0
    let totalIncome = 0
    let totalExpenses = 0

    movements?.forEach((movement, index) => {
      const amount = Number(movement.amount)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[getCashSummary] Movement ${index}:`, {
          type: movement.type,
          amount: amount,
          created_at: movement.created_at
        })
      }
      
      switch (movement.type) {
        case 'SALE':
          totalSales += amount
          break
        case 'INCOME':
          totalIncome += amount
          break
        case 'EXPENSE':
          totalExpenses += amount
          break
        default:
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[getCashSummary] Unknown movement type: ${movement.type}`)
          }
      }
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('[getCashSummary] Opening:', openingAmount)
      console.log('[getCashSummary] Sales:', totalSales)
      console.log('[getCashSummary] Income:', totalIncome)
      console.log('[getCashSummary] Expenses:', totalExpenses)
      console.log('[getCashSummary] Expected balance:', openingAmount + totalSales + totalIncome - totalExpenses)
    }

    const expectedBalance = openingAmount + totalSales + totalIncome - totalExpenses

    return {
      opening_amount: openingAmount,
      total_sales: totalSales,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      current_balance: expectedBalance,
      expected_balance: expectedBalance,
    }
  }

  async createCashMovement(
    tenantId: string,
    cashRegisterId: string,
    userId: string,
    type: CashMovementType,
    amount: number,
    notes: string,
    referenceId?: string
  ): Promise<CashMovement> {
    const { data, error } = await this.supabase
      .from('cash_movements')
      .insert({
        tenant_id: tenantId,
        cash_register_id: cashRegisterId,
        user_id: userId,
        type,
        amount,
        notes,
        reference_id: referenceId || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating cash movement:', error)
      throw new Error(error.message || 'Error al registrar el movimiento')
    }

    return {
      id: data.id,
      tenant_id: data.tenant_id,
      cash_register_id: data.cash_register_id,
      user_id: data.user_id,
      type: data.type,
      amount: Number(data.amount),
      reference_id: data.reference_id,
      notes: data.notes,
      created_at: data.created_at,
    }
  }

  async getCashMovements(
    cashRegisterId: string,
    limit: number = 50
  ): Promise<CashMovementWithUser[]> {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getCashMovements] Fetching movements for:', cashRegisterId)
    }

    const { data, error } = await this.supabase
      .from('cash_movements')
      .select('*')
      .eq('cash_register_id', cashRegisterId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[getCashMovements] Error fetching cash movements:', error)
      throw new Error(error.message || 'Error al obtener los movimientos')
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[getCashMovements] Movements fetched:', data?.length)
    }

    // Mapear datos sin user info (temporal)
    const movements = (data || []).map((movement: any) => ({
      ...movement,
      user: {
        id: movement.user_id || '',
        first_name: 'Usuario',
        last_name: '',
      }
    }))

    return movements as CashMovementWithUser[]
  }

  async registerSale(
    tenantId: string,
    cashRegisterId: string,
    userId: string,
    amount: number,
    saleId: string
  ): Promise<CashMovement> {
    return this.createCashMovement(
      tenantId,
      cashRegisterId,
      userId,
      'SALE',
      amount,
      'Venta registrada',
      saleId
    )
  }

  async getDefaultCashRegister(tenantId: string): Promise<CashRegister | null> {
    const { data, error } = await this.supabase
      .from('cash_registers')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    return data
  }
}

export const cashService = new CashService()
