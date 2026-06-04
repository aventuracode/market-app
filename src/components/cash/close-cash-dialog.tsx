'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, DollarSign, AlertCircle } from 'lucide-react'
import { cashService } from '@/services/cash.service'
import { closeCashSchema, type CloseCashFormData } from '@/types/cash'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import type { CashSession, CashSummary } from '@/types/cash'
import { formatCurrency } from '@/lib/utils/currency'

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
  const [displayAmount, setDisplayAmount] = useState('')

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

  const closingAmount = watch('closing_amount')
  const difference = closingAmount - (summary?.expected_balance || 0)

  // Inicializar displayAmount cuando se abre el modal
  useEffect(() => {
    if (open && summary) {
      const initialAmount = summary.expected_balance || 0
      setDisplayAmount(initialAmount > 0 ? formatCurrency(initialAmount) : '')
    }
  }, [open, summary])

  // Helper para parsear input de moneda (eliminar caracteres no numéricos)
  const parseCurrencyInput = (value: string): number => {
    // Eliminar todo excepto dígitos
    const numericString = value.replace(/[^0-9]/g, '')
    const numericValue = parseInt(numericString, 10)
    return isNaN(numericValue) ? 0 : numericValue
  }

  // Manejar cambios en el input de efectivo
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = parseCurrencyInput(inputValue)

    // Actualizar valor real del formulario
    setValue('closing_amount', numericValue)

    // Actualizar valor visual formateado
    setDisplayAmount(numericValue > 0 ? formatCurrency(numericValue) : '')
  }

  const onSubmit = async (data: CloseCashFormData) => {
    if (!session?.id) {
      setError('No hay sesión activa')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await cashService.closeCash(session.id, data.closing_amount, data.notes)

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
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
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
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="closing_amount"
                type="text"
                value={displayAmount}
                onChange={handleAmountChange}
                placeholder="$ 0"
                className="h-12 pl-10 pr-4 text-lg font-semibold text-right"
                inputMode="numeric"
                autoFocus
              />
            </div>
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
