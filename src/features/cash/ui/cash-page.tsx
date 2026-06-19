'use client'

import { Plus } from 'lucide-react'
import { useCashRegister } from '../application/use-cash-register'
import { useCashMovements } from '../application/use-cash-movements'
import { useCashDialogs } from '../application/use-cash-dialogs'
import { OpenCashDialog } from './open-cash-dialog'
import { CloseCashDialog } from './close-cash-dialog'
import { CashMovementDialog } from './cash-movement-dialog'
import { CashLoadingState } from './cash-loading-state'
import { CashBalanceCard } from './cash-balance-card'
import { CashMovementsList } from './cash-movements-list'
import { Button } from '@/shared/ui/components/button'
import { useAuthStore } from '@/features/auth'
import { CashClosedState } from './cash-closed-state'
import { CashHeader } from './cash-header'
import { CashSummaryGrid } from './cash-summary-grid'

/**
 * CashPage — orquestador.
 *
 * Responsabilidad única: decidir qué vista mostrar (loading / cerrada / abierta)
 * y cablear los hooks de datos con los componentes de presentación.
 * No conoce detalles de formato, estilos condicionales ni estructura
 * interna de cada tarjeta: eso vive en cada subcomponente.
 */
export function CashPage() {
  const { user } = useAuthStore()
  const {
    activeSession,
    currentBalance,
    summary,
    loading,
    isOpen,
    realtimeConnected,
    refresh,
  } = useCashRegister()

  const {
    movements,
    loading: loadingMovements,
    refresh: refreshMovements,
  } = useCashMovements({
    sessionId: activeSession?.id,
    autoLoad: isOpen,
  })

  const dialogs = useCashDialogs({
    onDataChange: refresh,
    onMovementsChange: refreshMovements,
  })

  if (loading) {
    return <CashLoadingState />
  }

  if (!isOpen) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">Caja</h1>
          <p className="text-sm text-muted-foreground">Gestión de caja</p>
        </div>

        <CashClosedState onOpenClick={dialogs.openOpenDialog} />

        <OpenCashDialog
          open={dialogs.activeDialog === 'open'}
          onClose={dialogs.dismiss}
          onSuccess={dialogs.handleOpenSuccess}
        />
      </div>
    )
  }
  return (
    <div className="flex flex-col h-full">
      <CashHeader
        userFirstName={user?.firstName}
        userLastName={user?.lastName}
        sessionOpenedAt={activeSession?.opened_at}
        realtimeConnected={realtimeConnected}
        onCloseClick={dialogs.openCloseDialog}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <CashBalanceCard balance={currentBalance} />

        {summary && <CashSummaryGrid summary={summary} />}

        <Button
          onClick={dialogs.openMovementDialog}
          className="w-full h-11 gap-2 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
          size="lg"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Registrar Movimiento</span>
        </Button>

        <div>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground/80 uppercase tracking-wide">
            Movimientos Recientes
          </h2>
          <CashMovementsList movements={movements} loading={loadingMovements} />
        </div>
      </div>

      <CloseCashDialog
        open={dialogs.activeDialog === 'close'}
        session={activeSession}
        summary={summary}
        onClose={dialogs.dismiss}
        onSuccess={dialogs.handleCloseSuccess}
      />

      <CashMovementDialog
        open={dialogs.activeDialog === 'movement'}
        sessionId={activeSession?.id || null}
        cashRegisterId={activeSession?.cash_register_id || null}
        onClose={dialogs.dismiss}
        onSuccess={dialogs.handleMovementSuccess}
      />
    </div>
  )
}
