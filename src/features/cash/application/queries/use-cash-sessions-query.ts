import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { createClient } from '@/shared/supabase/client'
import { getCashSessions } from '../../infrastructure/cash-session.repository'
import type { CashSession } from '../../domain/cash-session'

const CASH_SESSIONS_QUERY_KEY = 'cash-sessions'

interface UseCashSessionsFilters {
  status?: 'OPEN' | 'CLOSED'
  date?: string
}

export function useCashSessions(filters: UseCashSessionsFilters = {}) {
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useQuery({
    queryKey: [CASH_SESSIONS_QUERY_KEY, tenantId, filters],
    queryFn: async () => {
      if (!tenantId) throw new Error('No tenant ID')
      const supabase = createClient()
      return getCashSessions(supabase, filters)
    },
    enabled: !!tenantId,
    staleTime: 30000, // 30 segundos
    placeholderData: (previousData) => previousData,
  })
}
