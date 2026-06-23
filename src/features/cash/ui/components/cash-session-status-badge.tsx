import { Badge } from '@/shared/ui/components/badge'
import type { CashSessionStatus } from '../../domain/cash-session'

interface CashSessionStatusBadgeProps {
  status: CashSessionStatus
}

export function CashSessionStatusBadge({ status }: CashSessionStatusBadgeProps) {
  if (status === 'OPEN') {
    return (
      <Badge className="bg-green-500 text-white border-transparent hover:bg-green-600">
        Abierta
      </Badge>
    )
  }

  return (
    <Badge variant="secondary">
      Cerrada
    </Badge>
  )
}
