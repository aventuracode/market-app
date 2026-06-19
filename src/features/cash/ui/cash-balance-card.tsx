'use client'

import { Wallet } from 'lucide-react'
import { Card } from '@/shared/ui/components/card'
import { formatCurrency } from '@/shared/utils'

type CashBalanceCardProps = {
  balance: number
}

/**
 * CashBalanceCard — presentación pura.
 *
 * Responsabilidad única: mostrar el saldo disponible en caja.
 * Recibe el número ya resuelto; no calcula ni conoce de dónde sale.
 */
export function CashBalanceCard({ balance }: CashBalanceCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent shadow-md border-primary/10">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-[11px] font-medium text-muted-foreground/70 mb-1.5 uppercase tracking-wide">
            Disponible en caja
          </p>
          <p className="text-4xl font-bold tracking-tight mb-0.5">{formatCurrency(balance)}</p>
          <p className="text-xs text-muted-foreground/60">Saldo actual</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Wallet className="w-7 h-7 text-primary/80" />
        </div>
      </div>
    </Card>
  )
}
