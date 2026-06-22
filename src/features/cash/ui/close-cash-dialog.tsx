'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, AlertCircle } from 'lucide-react'
import CurrencyInput from 'react-currency-input-field'
import { money } from '@/shared/utils'
import { cashService } from '@/features/cash/infrastructure/cash.service'
import { closeCashSchema, type CloseCashFormData } from '../domain/cash'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/dialog'
import { Button } from '@/shared/ui/components/button'
import { Input } from '@/shared/ui/components/input'
import { Label } from '@/shared/ui/components/label'
import { Textarea } from '@/shared/ui/components/textarea'
import { Card } from '@/shared/ui/components/card'
import type { CashSession, CashSummary } from '../domain/cash'
import { formatCurrency } from '@/shared/utils'
import { useTenant } from '@/features/auth'

interface CloseCashDialogProps {
  open: boolean
  session: CashSession | null
  summary: CashSummary | null
  onClose: () => void
  onSuccess?: () => void
}

export function CloseCashDialog({
  open,
  session,
  summary,
  onClose,
  onSuccess,
}: CloseCashDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [closingAmountInput, setClosingAmountInput] = useState<string>('')
  const { tenant } = useTenant() 

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CloseCashFormData>({
    resolver: zodResolver(closeCashSchema),
    defaultValues: {
      closing_amount: summary?.expected_balance || 0,
      notes: '',
    },
  })

  const closingAmount = watch('closing_amount') || 0
  const difference = closingAmount - (summary?.expected_balance || 0)

  // Inicializar closing_amount cuando se abre el modal
  useEffect(() => {
    if (open && summary) {
      const expectedBalance = summary.expected_balance || 0
      setValue('closing_amount', expectedBalance)
      setClosingAmountInput(expectedBalance > 0 ? expectedBalance.toString() : '')
    }
  }, [open, summary, setValue])

  const onSubmit = async (data: CloseCashFormData) => {
    if (!session?.id) {
      setError('No hay sesión activa')
      return
    }
    if (!tenant?.id) {  
      setError('No hay tenant activo')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await cashService.closeCash(session.id, tenant.id, data.closing_amount, data.notes)

      if (navigator.vibrate) {
        navigator.vibrate(200)
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar la caja')
    } finally {
      setLoading(false)
    }
  }

  if (!session || !summary) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* DialogContent override via tailwind-merge (cn):
          - flex flex-col + max-h-[90dvh]: constrain altura y habilitar scroll interno
          - p-0 gap-0: eliminamos padding base para manejarlo manualmente por zona
          - top-auto bottom-0 translate-y-0: posición bottom-sheet en mobile
          - sm:top-[50%] sm:-translate-y-1/2 sm:bottom-auto: centrado vertical en desktop
          - rounded-t-2xl sm:rounded-lg: esquinas bottom-sheet en mobile */}
      <DialogContent className="sm:max-w-md max-w-full flex flex-col max-h-[90dvh] p-0 gap-0 overflow-hidden top-auto bottom-0 translate-y-0 rounded-t-2xl sm:top-[50%] sm:bottom-auto sm:-translate-y-1/2 sm:rounded-lg">

        {/* Handle indicator — solo visible en mobile */}
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header — padding derecho extra para no chocar con botón X (absolute right-4 top-4) */}
        <div className="px-6 pt-3 pb-2 pr-10">
          <DialogHeader>
            <DialogTitle>Cerrar Caja</DialogTitle>
            <DialogDescription>
              Verifica el efectivo y cierra la caja del día
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">

          {/* Zona scrolleable — overscroll-contain evita que el scroll se propague al body */}
          <div className="overflow-y-auto overscroll-contain flex-1 px-6 pb-2 space-y-3 scroll-smooth">

            {/* Resumen de Ventas por Método de Pago */}
            <Card className="p-3 bg-muted/30 border-muted">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Resumen de Ventas</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Efectivo:</span>
                  <span className="font-medium text-green-600">{formatCurrency(summary.total_sales)}</span>
                </div>
                {summary.total_card_sales > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tarjeta:</span>
                    <span className="font-medium text-blue-600">{formatCurrency(summary.total_card_sales)}</span>
                  </div>
                )}
                {summary.total_transfer_sales > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transferencia:</span>
                    <span className="font-medium text-purple-600">{formatCurrency(summary.total_transfer_sales)}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Caja Física - Efectivo Esperado */}
            <Card className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-2">
                Caja Física
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Apertura</span>
                  <span className="font-semibold">{formatCurrency(summary.opening_amount)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-green-700 dark:text-green-400 flex items-center gap-1">
                    <span className="text-base">+</span> Efectivo
                  </span>
                  <span className="font-semibold text-green-700 dark:text-green-400">{formatCurrency(summary.total_sales)}</span>
                </div>

                {summary.total_income > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 dark:text-green-400 flex items-center gap-1">
                      <span className="text-base">+</span> Ingresos
                    </span>
                    <span className="font-semibold text-green-700 dark:text-green-400">{formatCurrency(summary.total_income)}</span>
                  </div>
                )}

                {summary.total_expenses > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-red-700 dark:text-red-400 flex items-center gap-1">
                      <span className="text-base">−</span> Egresos
                    </span>
                    <span className="font-semibold text-red-700 dark:text-red-400">{formatCurrency(summary.total_expenses)}</span>
                  </div>
                )}

                <div className="border-t border-primary/20 pt-2 mt-2 flex justify-between items-center">
                  <span className="font-bold text-sm">Total esperado</span>
                  <span className="font-bold text-lg text-primary">{formatCurrency(summary.expected_balance)}</span>
                </div>
              </div>
            </Card>

            {/* Efectivo Contado */}
            <div className="space-y-1.5">
              <Label htmlFor="closing_amount">
                Efectivo Contado <span className="text-destructive">*</span>
              </Label>
              <CurrencyInput
                id="closing_amount"
                value={closingAmountInput}
                decimalsLimit={2}
                decimalSeparator=","
                groupSeparator="."
                allowNegativeValue={false}
                placeholder="0"
                className="flex h-11 w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-lg font-semibold shadow-sm transition-all duration-200 placeholder:text-muted-foreground/60 placeholder:font-normal focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:outline-none hover:border-border/80 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted text-right"
                autoFocus
                onValueChange={(value, name, values) => {
                  setClosingAmountInput(value || '')
                  setValue('closing_amount', money(values?.float))
                }}
              />
              {errors.closing_amount && (
                <p className="text-sm text-destructive">{errors.closing_amount.message}</p>
              )}
            </div>

            {/* Sobrante / Faltante */}
            {difference !== 0 && (
              <Card className={`p-3 ${difference > 0 ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 ${difference > 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <div className="flex-1 flex items-center justify-between">
                    <p className="font-semibold text-sm">
                      {difference > 0 ? 'Sobrante' : 'Faltante'}
                    </p>
                    <p className={`text-xl font-bold ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(difference))}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Notas */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Observaciones al cerrar la caja..."
                className="min-h-[60px] resize-none"
              />
            </div>

            {/* Error global */}
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

          </div>

          {/* Botones — sticky al fondo, siempre visibles, con safe-area para iPhone notch / Android gesture bar */}
          <div className="flex-shrink-0 px-6 pt-3 border-t bg-background flex gap-3"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 h-11 gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Cerrar Caja
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}
