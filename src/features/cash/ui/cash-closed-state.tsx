'use client'

import { Wallet } from 'lucide-react'
import { Button } from '@/shared/ui/components/button'

type CashClosedStateProps = {
  onOpenClick: () => void
}

/**
 * CashClosedState — presentación pura.
 *
 * Responsabilidad única: comunicar que la caja está cerrada y
 * exponer la acción de abrirla. No conoce el diálogo ni su estado;
 * solo notifica la intención hacia arriba (onOpenClick).
 */
export function CashClosedState({ onOpenClick }: CashClosedStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Wallet className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Caja Cerrada</h2>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        Abre la caja para comenzar a registrar ventas y movimientos
      </p>
      <Button onClick={onOpenClick} size="lg" className="gap-2 h-12 px-6">
        <Wallet className="w-5 h-5" />
        Abrir Caja
      </Button>
    </div>
  )
}
