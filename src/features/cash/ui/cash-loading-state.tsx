'use client'

import { Loader2 } from 'lucide-react'

/**
 * CashLoadingState — presentación pura.
 *
 * Responsabilidad única: mostrar el indicador de carga mientras se
 * resuelve el estado de la caja (abierta/cerrada). Sin props porque
 * no depende de ningún dato externo.
 */
export function CashLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Cargando caja...</p>
    </div>
  )
}
