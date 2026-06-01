import { createClient } from '@/lib/supabase/client'
import type {
  CashRegister,
  CashSession,
  CashMovement,
  CashMovementWithUser,
  CashSummary,
  CashMovementType,
} from '@/types/cash'

/**
 * Error personalizado para conflictos de concurrencia en cajas
 */
export class CashConcurrencyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CashConcurrencyError'
  }
}

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
    // Verificar si el usuario ya tiene una caja abierta
    const activeSession = await this.getActiveCashRegister(tenantId, userId)
    if (activeSession) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[openCash] Usuario ya tiene una caja abierta:', {
          userId,
          sessionId: activeSession.session.id,
          registerId: activeSession.register.id,
        })
      }
      throw new Error('Ya tienes una caja abierta')
    }

    try {
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
        // Detectar error de concurrencia (constraint violation)
        if (error.code === '23505' && error.message?.includes('unique_open_session_per_register')) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[openCash] Conflicto de concurrencia detectado:', {
              code: error.code,
              constraint: 'unique_open_session_per_register',
              cashRegisterId,
            })
          }
          throw new CashConcurrencyError('Esta caja ya se encuentra abierta por otro cajero.')
        }

        // Otros errores de base de datos
        console.error('[openCash] Error al abrir caja:', {
          code: error.code,
          message: error.message,
          details: error.details,
        })
        throw new Error(error.message || 'Error al abrir la caja')
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[openCash] Caja abierta exitosamente:', {
          sessionId: data.id,
          cashRegisterId: data.cash_register_id,
          userId: data.user_id,
          openingAmount: data.opening_amount,
        })
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
    } catch (err) {
      // Re-lanzar errores personalizados
      if (err instanceof CashConcurrencyError) {
        throw err
      }

      // Capturar errores inesperados
      console.error('[openCash] Error inesperado:', err)
      throw err instanceof Error ? err : new Error('Error inesperado al abrir la caja')
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

    if (process.env.NODE_ENV === 'development') {
      console.log('[closeCash] Closing cash session:', {
        sessionId,
        closingAmount,
        expectedAmount,
        difference,
        notes,
      })
    }

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
      console.error('[closeCash] Error closing cash:', error)
      throw new Error(error.message || 'Error al cerrar la caja')
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[closeCash] Cash session closed successfully:', {
        id: data.id,
        status: data.status,
        closing_amount: data.closing_amount,
        expected_amount: data.expected_amount,
        difference: data.difference,
        closed_at: data.closed_at,
      })
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

    // Obtener movimientos de la sesión actual usando cash_session_id
    const { data: movements } = await this.supabase
      .from('cash_movements')
      .select('type, amount, created_at, reference_id')
      .eq('cash_session_id', sessionId)

    if (process.env.NODE_ENV === 'development') {
      console.log('[getCashSummary] Session opened_at:', session.opened_at)
      console.log('[getCashSummary] Movements found:', movements?.length)
      console.log('[getCashSummary] Movements:', movements)
    }

    const openingAmount = Number(session.opening_amount)
    let totalCashSales = 0
    let totalCardSales = 0
    let totalTransferSales = 0
    let totalIncome = 0
    let totalExpenses = 0

    // Obtener IDs de ventas para filtrar por método de pago
    const saleMovementIds = movements
      ?.filter(m => m.type === 'SALE' && m.reference_id)
      .map(m => m.reference_id) || []

    if (saleMovementIds.length > 0) {
      // Consultar ventas para separar por método de pago
      const { data: sales } = await this.supabase
        .from('sales')
        .select('id, total, payment_method')
        .in('id', saleMovementIds)

      if (sales) {
        totalCashSales = sales
          .filter(sale => sale.payment_method === 'CASH')
          .reduce((sum, sale) => sum + Number(sale.total), 0)

        totalCardSales = sales
          .filter(sale => sale.payment_method === 'CARD')
          .reduce((sum, sale) => sum + Number(sale.total), 0)

        totalTransferSales = sales
          .filter(sale => sale.payment_method === 'TRANSFER')
          .reduce((sum, sale) => sum + Number(sale.total), 0)

        if (process.env.NODE_ENV === 'development') {
          console.log('[getCashSummary] Total sales:', sales.length)
          console.log('[getCashSummary] Cash sales:', sales.filter(s => s.payment_method === 'CASH').length, '- Amount:', totalCashSales)
          console.log('[getCashSummary] Card sales:', sales.filter(s => s.payment_method === 'CARD').length, '- Amount:', totalCardSales)
          console.log('[getCashSummary] Transfer sales:', sales.filter(s => s.payment_method === 'TRANSFER').length, '- Amount:', totalTransferSales)
        }
      }
    }

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
          // Ya calculamos solo las ventas en efectivo arriba
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
      console.log('[getCashSummary] Cash Sales:', totalCashSales)
      console.log('[getCashSummary] Card Sales:', totalCardSales)
      console.log('[getCashSummary] Transfer Sales:', totalTransferSales)
      console.log('[getCashSummary] Income:', totalIncome)
      console.log('[getCashSummary] Expenses:', totalExpenses)
      console.log('[getCashSummary] Expected balance:', openingAmount + totalCashSales + totalIncome - totalExpenses)
    }

    const expectedBalance = openingAmount + totalCashSales + totalIncome - totalExpenses

    return {
      opening_amount: openingAmount,
      total_sales: totalCashSales,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      total_card_sales: totalCardSales,
      total_transfer_sales: totalTransferSales,
      current_balance: expectedBalance,
      expected_balance: expectedBalance,
    }
  }

  async createCashMovement(
    tenantId: string,
    cashRegisterId: string,
    cashSessionId: string,
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
        cash_session_id: cashSessionId,
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
      cash_session_id: data.cash_session_id,
      user_id: data.user_id,
      type: data.type,
      amount: Number(data.amount),
      reference_id: data.reference_id,
      notes: data.notes,
      created_at: data.created_at,
    }
  }

  async getCashMovements(
    sessionId: string,
    limit: number = 50
  ): Promise<CashMovementWithUser[]> {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getCashMovements] Fetching movements for session:', sessionId)
    }

    const { data, error } = await this.supabase
      .from('cash_movements')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name
        )
      `)
      .eq('cash_session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[getCashMovements] Error fetching cash movements:', error)
      throw new Error(error.message || 'Error al obtener los movimientos')
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[getCashMovements] Movements fetched for session:', data?.length)
    }

    // Mapear datos con user info
    const movements = (data || []).map((movement: any) => ({
      id: movement.id,
      tenant_id: movement.tenant_id,
      cash_register_id: movement.cash_register_id,
      cash_session_id: movement.cash_session_id,
      user_id: movement.user_id,
      type: movement.type,
      amount: Number(movement.amount),
      reference_id: movement.reference_id,
      notes: movement.notes,
      created_at: movement.created_at,
      user: movement.users ? {
        id: movement.users.id,
        first_name: movement.users.first_name,
        last_name: movement.users.last_name,
      } : null
    }))

    return movements as CashMovementWithUser[]
  }

  async registerSale(
    tenantId: string,
    cashRegisterId: string,
    cashSessionId: string,
    userId: string,
    amount: number,
    saleId: string
  ): Promise<CashMovement> {
    return this.createCashMovement(
      tenantId,
      cashRegisterId,
      cashSessionId,
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

  async getAvailableCashRegisters(tenantId: string): Promise<CashRegister[]> {
    const { data, error } = await this.supabase
      .from('cash_registers')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching cash registers:', error)
      throw new Error(error.message || 'Error al obtener las cajas')
    }

    return data || []
  }
}

export const cashService = new CashService()
