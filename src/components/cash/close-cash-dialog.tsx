'use client'

import { useState } from 'react'
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CloseCashFormData>({
    resolver: zodResolver(closeCashSchema),
    defaultValues: {
      closing_amount: summary?.expected_balance || 0,
      notes: '',
    },
  })

  const closingAmount = watch('closing_amount')
  const difference = closingAmount - (summary?.expected_balance || 0)

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
          <Card className="p-4 bg-muted/50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Apertura:</span>
                <span className="font-medium">${summary.opening_amount.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ventas (Efectivo):</span>
                <span className="font-medium text-green-600">+${summary.total_sales.toLocaleString('es-CL')}</span>
              </div>
              {summary.total_card_sales > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs pl-4">Ventas (Tarjeta):</span>
                  <span className="font-medium text-blue-600 text-xs">${summary.total_card_sales.toLocaleString('es-CL')}</span>
                </div>
              )}
              {summary.total_transfer_sales > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs pl-4">Ventas (Transferencia):</span>
                  <span className="font-medium text-purple-600 text-xs">${summary.total_transfer_sales.toLocaleString('es-CL')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ingresos:</span>
                <span className="font-medium text-green-600">+${summary.total_income.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Egresos:</span>
                <span className="font-medium text-red-600">-${summary.total_expenses.toLocaleString('es-CL')}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">Esperado:</span>
                <span className="font-bold text-lg">${summary.expected_balance.toLocaleString('es-CL')}</span>
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
                type="number"
                step="1"
                min="0"
                {...register('closing_amount', {
                  valueAsNumber: true,
                  setValueAs: (v) => {
                    if (v === '' || v === null || v === undefined) return 0
                    const num = Number(v)
                    return isNaN(num) ? 0 : Math.round(num)
                  },
                })}
                placeholder="0"
                className="h-12 pl-10 text-lg"
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
                    ${Math.abs(difference).toLocaleString('es-CL')}
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
