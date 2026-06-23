import { formatCurrency } from '@/shared/utils/currency'
import { CashSessionStatusBadge } from './cash-session-status-badge'
import type { CashSession } from '../../domain/cash-session'

interface CashSessionsTableProps {
  sessions: CashSession[]
  isLoading: boolean
  onSelectSession: (session: CashSession) => void
}

export function CashSessionsTable({
  sessions,
  isLoading,
  onSelectSession,
}: CashSessionsTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDifferenceColor = (difference: number | null) => {
    if (difference === null) return 'text-muted-foreground'
    if (difference === 0) return 'text-green-600'
    if (difference > 0) return 'text-amber-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-muted/50 rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay sesiones de caja para mostrar
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-3 px-2 font-medium">Caja</th>
            <th className="pb-3 px-2 font-medium hidden md:table-cell">Usuario</th>
            <th className="pb-3 px-2 font-medium">Apertura</th>
            <th className="pb-3 px-2 font-medium hidden lg:table-cell">Cierre</th>
            <th className="pb-3 px-2 font-medium text-right hidden lg:table-cell">Inicial</th>
            <th className="pb-3 px-2 font-medium text-right">Esperado</th>
            <th className="pb-3 px-2 font-medium text-right hidden md:table-cell">Cierre</th>
            <th className="pb-3 px-2 font-medium text-right">Diferencia</th>
            <th className="pb-3 px-2 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr
              key={session.id}
              onClick={() => onSelectSession(session)}
              className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <td className="py-3 px-2 text-sm">{session.cashRegisterName}</td>
              <td className="py-3 px-2 text-sm hidden md:table-cell">{session.userName}</td>
              <td className="py-3 px-2 text-sm">{formatDate(session.openedAt)}</td>
              <td className="py-3 px-2 text-sm hidden lg:table-cell">{formatDate(session.closedAt)}</td>
              <td className="py-3 px-2 text-sm text-right hidden lg:table-cell">
                {formatCurrency(session.openingAmount)}
              </td>
              <td className="py-3 px-2 text-sm text-right">
                {session.expectedAmount !== null
                  ? formatCurrency(session.expectedAmount)
                  : '-'}
              </td>
              <td className="py-3 px-2 text-sm text-right hidden md:table-cell">
                {session.closingAmount !== null
                  ? formatCurrency(session.closingAmount)
                  : '-'}
              </td>
              <td className={`py-3 px-2 text-sm text-right font-medium ${getDifferenceColor(session.difference)}`}>
                {session.difference !== null
                  ? formatCurrency(session.difference)
                  : '-'}
              </td>
              <td className="py-3 px-2">
                <CashSessionStatusBadge status={session.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
