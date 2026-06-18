'use client'

import { useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, Clock, User, Plus, X, Loader2 } from 'lucide-react'
import { useCashRegister } from '@/features/cash/application/use-cash-register'
import { useCashMovements } from '@/features/cash/application/use-cash-movements'
import { OpenCashDialog } from '@/features/cash/ui/open-cash-dialog'
import { CloseCashDialog } from '@/features/cash/ui/close-cash-dialog'
import { CashMovementDialog } from '@/features/cash/ui/cash-movement-dialog'
import { CashMovementItem } from '@/features/cash/ui/cash-movement-item'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/features/auth'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCurrency } from '@/shared/utils'

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
    sessionId: activeSession?.id,
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
      <div className="px-4 pt-5 pb-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Caja</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mt-1">
              <User className="w-3 h-3" />
              <span>{user?.firstName} {user?.lastName}</span>
              {activeSession && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <Clock className="w-3 h-3" />
                  <span>
                    {format(new Date(activeSession.opened_at), "HH:mm", { locale: es })}
                  </span>
                </>
              )}
            </div>
          </div>
          <Button
            onClick={() => setCloseCashDialog(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200 active:scale-95 h-9"
          >
            <X className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Cerrar</span>
          </Button>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 border border-green-200">
          <div className={`w-1.5 h-1.5 rounded-full ${realtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-[10px] font-medium text-green-700">
            {realtimeConnected ? 'Caja activa' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Balance Actual */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent shadow-md border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-[11px] font-medium text-muted-foreground/70 mb-1.5 uppercase tracking-wide">Disponible en caja</p>
              <p className="text-4xl font-bold tracking-tight mb-0.5">{formatCurrency(currentBalance)}</p>
              <p className="text-xs text-muted-foreground/60">Saldo actual</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Wallet className="w-7 h-7 text-primary/80" />
            </div>
          </div>
        </Card>

        {/* Resumen */}
        {summary && (
          <div className="grid grid-cols-2 gap-2.5">
            <Card className="p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col">
                <p className="text-[10px] text-muted-foreground/70 font-medium mb-1">Apertura</p>
                <p className="text-base font-bold tracking-tight">{formatCurrency(summary.opening_amount)}</p>
              </div>
            </Card>

            <Card className="p-3 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-2 border-l-green-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground/70 font-medium">Ventas</p>
                  <p className="text-base font-bold tracking-tight text-green-600">{formatCurrency(summary.total_sales)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-3 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-2 border-l-green-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground/70 font-medium">Ingresos</p>
                  <p className="text-base font-bold tracking-tight text-green-600">{formatCurrency(summary.total_income)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-3 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-2 border-l-red-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground/70 font-medium">Egresos</p>
                  <p className="text-base font-bold tracking-tight text-red-600">{formatCurrency(summary.total_expenses)}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Botón Registrar Movimiento */}
        <Button
          onClick={() => setMovementDialog(true)}
          className="w-full h-11 gap-2 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
          size="lg"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Registrar Movimiento</span>
        </Button>

        {/* Movimientos Recientes */}
        <div>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground/80 uppercase tracking-wide">Movimientos Recientes</h2>

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
        sessionId={activeSession?.id || null}
        cashRegisterId={activeSession?.cash_register_id || null}
        onClose={() => setMovementDialog(false)}
        onSuccess={handleMovementSuccess}
      />
    </div>
  )
}
