'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import CurrencyInput from 'react-currency-input-field'
import { money } from '@/shared/utils'
import { cashService } from '@/features/cash/infrastructure/cash.service'
import { useTenant } from '@/features/auth'
import { useAuthStore } from '@/features/auth'
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
import { CashMovementFormData, cashMovementSchema } from '../domain/cash'

interface CashMovementDialogProps {
  open: boolean
  sessionId: string | null
  cashRegisterId: string | null
  onClose: () => void
  onSuccess?: () => void
}

export function CashMovementDialog({
  open,
  sessionId,
  cashRegisterId,
  onClose,
  onSuccess,
}: CashMovementDialogProps) {
  const { tenant } = useTenant()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amountInput, setAmountInput] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CashMovementFormData>({
    resolver: zodResolver(cashMovementSchema),
    defaultValues: {
      type: 'INCOME',
      amount: 0,
      notes: '',
    },
  })

  const type = watch('type')
  const amount = watch('amount') || 0
  
  // Resetear input cuando se abre el modal
  useEffect(() => {
    if (open) {
      setAmountInput('')
    }
  }, [open])

  const onSubmit = async (data: CashMovementFormData) => {
    if (!tenant?.id || !user?.id || !cashRegisterId || !sessionId) {
      setError('No hay sesión activa')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await cashService.createCashMovement(
        tenant.id,
        cashRegisterId,
        sessionId,
        user.id,
        data.type,
        data.amount,
        data.notes
      )

      if (navigator.vibrate) {
        navigator.vibrate(200)
      }

      reset()
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar el movimiento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Movimiento</DialogTitle>
          <DialogDescription>
            Registra un ingreso o egreso de efectivo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={type === 'INCOME' ? 'default' : 'outline'}
              onClick={() => setValue('type', 'INCOME')}
              className="h-16 gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Ingreso
            </Button>
            <Button
              type="button"
              variant={type === 'EXPENSE' ? 'default' : 'outline'}
              onClick={() => setValue('type', 'EXPENSE')}
              className="h-16 gap-2"
            >
              <TrendingDown className="w-5 h-5" />
              Egreso
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Monto <span className="text-destructive">*</span>
            </Label>
            <CurrencyInput
              id="amount"
              value={amountInput}
              decimalsLimit={2}
              decimalSeparator=","
              groupSeparator="."
              allowNegativeValue={false}
              placeholder="0"
              className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-lg shadow-sm transition-all duration-200 placeholder:text-muted-foreground/60 placeholder:font-normal focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:outline-none hover:border-border/80 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted text-right font-semibold"
              autoFocus
              onValueChange={(value, name, values) => {
                setAmountInput(value || '')
                setValue('amount', money(values?.float))
              }}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              Motivo <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Describe el motivo del movimiento..."
              className="min-h-[100px] resize-none"
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
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
              Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
