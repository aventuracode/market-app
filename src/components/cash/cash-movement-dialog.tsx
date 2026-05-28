'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { cashService } from '@/services/cash.service'
import { useTenant } from '@/hooks/use-tenant'
import { useAuthStore } from '@/stores/auth.store'
import { cashMovementSchema, type CashMovementFormData } from '@/types/cash'
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
      console.error('Error creating movement:', err)
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
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="1"
                min="0"
                {...register('amount', {
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
