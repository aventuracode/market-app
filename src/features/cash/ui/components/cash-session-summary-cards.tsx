import { Card } from '@/shared/ui/components/card'
import { formatCurrency } from '@/shared/utils/currency'
import type { CashSession } from '../../domain/cash-session'

interface CashSessionSummaryCardsProps {
  sessions: CashSession[]
}

export function CashSessionSummaryCards({ sessions }: CashSessionSummaryCardsProps) {
  const openCount = sessions.filter((s) => s.status === 'OPEN').length
  const closedCount = sessions.filter((s) => s.status === 'CLOSED').length
  const totalAdministered = sessions
    .reduce((sum, s) => sum + (s.expectedAmount ?? 0), 0)
  const differencesCount = sessions.filter(
    (s) => s.difference !== null && s.difference !== 0
  ).length

  const cards = [
    {
      label: 'Cajas abiertas',
      value: openCount,
      color: 'text-green-600',
    },
    {
      label: 'Cajas cerradas',
      value: closedCount,
      color: 'text-muted-foreground',
    },
    {
      label: 'Total administrado',
      value: formatCurrency(totalAdministered),
      color: 'text-blue-600',
    },
    {
      label: 'Diferencias detectadas',
      value: differencesCount,
      color: differencesCount > 0 ? 'text-orange-600' : 'text-muted-foreground',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <Card key={card.label} className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
          <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
        </Card>
      ))}
    </div>
  )
}
