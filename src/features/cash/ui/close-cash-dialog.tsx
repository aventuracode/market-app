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
      console.error('Error closing cash:', err)
      setError(err instanceof Error ? err.message : 'Error al cerrar la caja')
    } finally {
      setLoading(false)
    }
  }

  if (!session || !summary) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cerrar Caja</DialogTitle>
          <DialogDescription>
            Verifica el efectivo y cierra la caja del día
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Resumen de Ventas por Método de Pago */}
          <Card className="p-4 bg-muted/30 border-muted">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Resumen de Ventas</h3>
            <div className="space-y-2 text-sm">
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
          <Card className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-4">
              Caja Física
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Apertura</span>
                <span className="font-semibold">{formatCurrency(summary.opening_amount)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-green-700 dark:text-green-400 flex items-center gap-1">
                  <span className="text-lg">+</span> Efectivo
                </span>
                <span className="font-semibold text-green-700 dark:text-green-400">{formatCurrency(summary.total_sales)}</span>
              </div>
              
              {summary.total_income > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-green-700 dark:text-green-400 flex items-center gap-1">
                    <span className="text-lg">+</span> Ingresos
                  </span>
                  <span className="font-semibold text-green-700 dark:text-green-400">{formatCurrency(summary.total_income)}</span>
                </div>
              )}
              
              {summary.total_expenses > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-red-700 dark:text-red-400 flex items-center gap-1">
                    <span className="text-lg">−</span> Egresos
                  </span>
                  <span className="font-semibold text-red-700 dark:text-red-400">{formatCurrency(summary.total_expenses)}</span>
                </div>
              )}
              
              <div className="border-t border-primary/20 pt-3 mt-3 flex justify-between items-center">
                <span className="font-bold text-base">Total esperado</span>
                <span className="font-bold text-xl text-primary">{formatCurrency(summary.expected_balance)}</span>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
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
              className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-lg font-semibold shadow-sm transition-all duration-200 placeholder:text-muted-foreground/60 placeholder:font-normal focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:outline-none hover:border-border/80 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted text-right"
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

          {difference !== 0 && (
            <Card className={`p-4 ${difference > 0 ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
              <div className="flex items-center gap-2">
                <AlertCircle className={`w-5 h-5 ${difference > 0 ? 'text-green-600' : 'text-red-600'}`} />
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {difference > 0 ? 'Sobrante' : 'Faltante'}
                  </p>
                  <p className={`text-2xl font-bold ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(difference))}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Observaciones al cerrar la caja..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
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
