'use client'

import { Clock, User, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/shared/ui/components/button'

type CashHeaderProps = {
  userFirstName?: string
  userLastName?: string
  sessionOpenedAt?: string | null
  realtimeConnected: boolean
  onCloseClick: () => void
}

/**
 * CashHeader — presentación pura.
 *
 * Responsabilidad única: mostrar el encabezado de la caja abierta
 * (usuario, hora de apertura, indicador de conexión) y exponer
 * el botón de cerrar caja. No conoce la sesión completa ni el
 * store de auth: solo recibe los campos primitivos que necesita
 * mostrar (ISP).
 */
export function CashHeader({
  userFirstName,
  userLastName,
  sessionOpenedAt,
  realtimeConnected,
  onCloseClick,
}: CashHeaderProps) {
  return (
    <div className="px-4 pt-5 pb-4 border-b bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Caja</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mt-1">
            <User className="w-3 h-3" />
            <span>
              {userFirstName} {userLastName}
            </span>
            {sessionOpenedAt && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <Clock className="w-3 h-3" />
                <span>{format(new Date(sessionOpenedAt), 'HH:mm', { locale: es })}</span>
              </>
            )}
          </div>
        </div>
        <Button
          onClick={onCloseClick}
          variant="outline"
          size="sm"
          className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200 active:scale-95 h-9"
        >
          <X className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Cerrar</span>
        </Button>
      </div>

      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 border border-green-200">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            realtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`}
        />
        <span className="text-[10px] font-medium text-green-700">
          {realtimeConnected ? 'Caja activa' : 'Offline'}
        </span>
      </div>
    </div>
  )
}
