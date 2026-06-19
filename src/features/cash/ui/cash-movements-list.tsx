'use client'

import { Loader2, Wallet } from 'lucide-react'
import { Card } from '@/shared/ui/components/card'
import { CashMovementType, CashMovementWithUser } from '../domain'
import { CashMovementItem } from './cash-movement-item'
// Ajustar este import a la ubicación real de la entidad de dominio.
// Se asume una forma compatible con lo que ya consume CashMovementItem.

type CashMovementsListProps = {
  movements: CashMovementWithUser[]
  loading: boolean
}

/**
 * CashMovementsList — presentación pura.
 *
 * Responsabilidad única: resolver los 3 estados visuales de la lista
 * de movimientos (cargando / vacía / con items) y delegar el render
 * de cada item a CashMovementItem, que ya existe y no se toca.
 */
export function CashMovementsList({ movements, loading }: CashMovementsListProps) {
  if (loading && movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando movimientos...</p>
      </div>
    )
  }

  if (!loading && movements.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Sin movimientos</h3>
          <p className="text-sm text-muted-foreground">
            No hay movimientos registrados en esta sesión
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {movements.map((movement) => (
        <CashMovementItem key={movement.id} movement={movement} />
      ))}
    </div>
  )
}
