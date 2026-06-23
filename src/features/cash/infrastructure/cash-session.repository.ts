import type { SupabaseClient } from '@supabase/supabase-js'
import type { CashSession } from '../domain/cash-session'
import { mapToCashSession } from '../domain/cash-session.mapper'

interface GetCashSessionsFilters {
  status?: 'OPEN' | 'CLOSED'
  date?: string
}

export async function getCashSessions(
  supabase: SupabaseClient,
  filters: GetCashSessionsFilters = {}
): Promise<CashSession[]> {
  let query = supabase
    .from('cash_sessions')
    .select(`
      *,
      cash_registers (name),
      users (first_name, last_name)
    `)

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.date) {
    const dayStart = `${filters.date}T00:00:00.000Z`
    const dayEnd = `${filters.date}T23:59:59.999Z`

    query = query
      .gte('opened_at', dayStart)
      .lte('opened_at', dayEnd)
  }

  query = query.order('opened_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    throw new Error(error.message || 'Error al obtener las sesiones de caja')
  }

  return (data ?? []).map(mapToCashSession)
}
