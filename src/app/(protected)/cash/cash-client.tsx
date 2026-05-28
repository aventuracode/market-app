'use client'

import { useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, DollarSign, Clock, User, Plus, X, Loader2 } from 'lucide-react'
import { useCashRegister } from '@/hooks/use-cash-register'
import { useCashMovements } from '@/hooks/use-cash-movements'
import { OpenCashDialog } from '@/components/cash/open-cash-dialog'
import { CloseCashDialog } from '@/components/cash/close-cash-dialog'
import { CashMovementDialog } from '@/components/cash/cash-movement-dialog'
import { CashMovementItem } from '@/components/cash/cash-movement-item'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth.store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function CashClient() {
  const { user } = useAuthStore()
  const {
    activeSession,
    currentBalance,
    summary,
    loading,
    error,
    refresh,
    isOpen,
    realtimeConnected,
  } = useCashRegister()

  const { movements, loading: loadingMovements, refresh: refreshMovements } = useCashMovements({
    cashRegisterId: activeSession?.cash_register_id,
    autoLoad: isOpen,
  })

  const [openCashDialog, setOpenCashDialog] = useState(false)
  const [closeCashDialog, setCloseCashDialog] = useState(false)
  const [movementDialog, setMovementDialog] = useState(false)

  const handleOpenSuccess = () => {
    refresh()
  }

  const handleCloseSuccess = () => {
    refresh()
  }

  const handleMovementSuccess = () => {
    refresh()
    refreshMovements()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando caja...</p>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">Caja</h1>
          <p className="text-sm text-muted-foreground">Gestión de caja</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Caja Cerrada</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-sm">
            Abre la caja para comenzar a registrar ventas y movimientos
          </p>
          <Button
            onClick={() => setOpenCashDialog(true)}
            size="lg"
            className="gap-2 h-12 px-6"
          >
            <Wallet className="w-5 h-5" />
            Abrir Caja
          </Button>
        </div>

        <OpenCashDialog
          open={openCashDialog}
          onClose={() => setOpenCashDialog(false)}
          onSuccess={handleOpenSuccess}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Caja Abierta</h1>
          <Button
            onClick={() => setCloseCashDialog(true)}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cerrar Caja
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>{user?.first_name} {user?.last_name}</span>
          {activeSession && (
            <>
              <span>•</span>
              <Clock className="w-4 h-4" />
              <span>
                {format(new Date(activeSession.opened_at), "HH:mm", { locale: es })}
              </span>
            </>
          )}
          <span>•</span>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${realtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-xs">
              {realtimeConnected ? 'En vivo' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Balance Actual */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Saldo Actual</p>
              <p className="text-4xl font-bold">${currentBalance.toLocaleString('es-CL')}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </div>
        </Card>

        {/* Resumen */}
        {summary && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Apertura</p>
                  <p className="text-lg font-bold">${summary.opening_amount.toLocaleString('es-CL')}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Ventas</p>
                  <p className="text-lg font-bold text-green-600">${summary.total_sales.toLocaleString('es-CL')}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Ingresos</p>
                  <p className="text-lg font-bold text-green-600">${summary.total_income.toLocaleString('es-CL')}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Egresos</p>
                  <p className="text-lg font-bold text-red-600">${summary.total_expenses.toLocaleString('es-CL')}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Botón Registrar Movimiento */}
        <Button
          onClick={() => setMovementDialog(true)}
          className="w-full h-12 gap-2"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Registrar Movimiento
        </Button>

        {/* Movimientos Recientes */}
        <div>
          <h2 className="font-semibold mb-3">Movimientos Recientes</h2>

          {loadingMovements && movements.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando movimientos...</p>
            </div>
          )}

          {!loadingMovements && movements.length === 0 && (
            <Card className="p-8">
              <div className="text-center">
                <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Sin movimientos</h3>
                <p className="text-sm text-muted-foreground">
                  No hay movimientos registrados en esta sesión
                </p>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {movements.map((movement) => (
              <CashMovementItem key={movement.id} movement={movement} />
            ))}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CloseCashDialog
        open={closeCashDialog}
        session={activeSession}
        summary={summary}
        onClose={() => setCloseCashDialog(false)}
        onSuccess={handleCloseSuccess}
      />

      <CashMovementDialog
        open={movementDialog}
        cashRegisterId={activeSession?.cash_register_id || null}
        onClose={() => setMovementDialog(false)}
        onSuccess={handleMovementSuccess}
      />
    </div>
  )
}
