import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/dialog'
import { formatCurrency } from '@/shared/utils/currency'
import { CashSessionStatusBadge } from './cash-session-status-badge'
import type { CashSession } from '../../domain/cash-session'

interface CashSessionDetailDialogProps {
  session: CashSession | null
  open: boolean
  onClose: () => void
}

export function CashSessionDetailDialog({
  session,
  open,
  onClose,
}: CashSessionDetailDialogProps) {
  if (!session) return null

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalle de Sesión de Caja</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Caja</p>
              <p className="text-sm font-medium">{session.cashRegisterName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Usuario</p>
              <p className="text-sm font-medium">{session.userName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Hora Apertura</p>
              <p className="text-sm">{formatDate(session.openedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Hora Cierre</p>
              <p className="text-sm">{formatDate(session.closedAt)}</p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Monto Inicial</p>
              <p className="text-sm font-medium">{formatCurrency(session.openingAmount)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Monto Esperado</p>
              <p className="text-sm font-medium">
                {session.expectedAmount !== null
                  ? formatCurrency(session.expectedAmount)
                  : '-'}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Monto Cierre</p>
              <p className="text-sm font-medium">
                {session.closingAmount !== null
                  ? formatCurrency(session.closingAmount)
                  : '-'}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Diferencia</p>
              <p className={`text-sm font-medium ${getDifferenceColor(session.difference)}`}>
                {session.difference !== null
                  ? formatCurrency(session.difference)
                  : '-'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Estado</p>
              <CashSessionStatusBadge status={session.status} />
            </div>
            {session.notes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notas</p>
                <p className="text-sm">{session.notes}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
