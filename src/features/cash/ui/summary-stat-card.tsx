'use client'

import type { LucideIcon } from 'lucide-react'
import { Card } from '@/shared/ui/components/card'
import { formatCurrency } from '@/shared/utils'

export type SummaryStatTone = 'neutral' | 'positive' | 'negative'

type SummaryStatCardProps = {
  label: string
  value: number
  icon: LucideIcon
  tone?: SummaryStatTone
}

const TONE_CLASSES: Record<SummaryStatTone, { bg: string; text: string; border: string }> = {
  neutral: { bg: '', text: '', border: '' },
  positive: {
    bg: 'bg-green-50 dark:bg-green-950',
    text: 'text-green-600',
    border: 'border-l-green-500/20',
  },
  negative: {
    bg: 'bg-red-50 dark:bg-red-950',
    text: 'text-red-600',
    border: 'border-l-red-500/20',
  },
}

/**
 * SummaryStatCard — presentación pura y genérica.
 *
 * Responsabilidad única: mostrar una métrica con ícono, label y valor
 * monetario, con un "tono" visual (neutral/positivo/negativo).
 *
 * Al ser genérico, agregar una métrica nueva al resumen de caja
 * (OCP) no requiere modificar este archivo ni el grid: solo agregar
 * una entrada al array de stats en CashSummaryGrid.
 */
export function SummaryStatCard({ label, value, icon: Icon, tone = 'neutral' }: SummaryStatCardProps) {
  const toneClasses = TONE_CLASSES[tone]

  if (tone === 'neutral') {
    return (
      <Card className="p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col">
          <p className="text-[10px] text-muted-foreground/70 font-medium mb-1">{label}</p>
          <p className="text-base font-bold tracking-tight">{formatCurrency(value)}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={`p-3 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-2 ${toneClasses.border}`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${toneClasses.bg}`}
        >
          <Icon className={`w-4 h-4 ${toneClasses.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground/70 font-medium">{label}</p>
          <p className={`text-base font-bold tracking-tight ${toneClasses.text}`}>
            {formatCurrency(value)}
          </p>
        </div>
      </div>
    </Card>
  )
}
