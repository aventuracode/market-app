'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, DollarSign } from 'lucide-react'
import { cashService } from '@/services/cash.service'
import { useTenant } from '@/hooks/use-tenant'
import { useAuthStore } from '@/stores/auth.store'
import { openCashSchema, type OpenCashFormData } from '@/types/cash'
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

interface OpenCashDialogProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function OpenCashDialog({ open, onClose, onSuccess }: OpenCashDialogProps) {
  const { tenant } = useTenant()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OpenCashFormData>({
    resolver: zodResolver(openCashSchema),
    defaultValues: {
      opening_amount: 0,
      notes: '',
    },
  })

  const onSubmit = async (data: OpenCashFormData) => {
    if (!tenant?.id || !user?.id) {
      setError('No hay sesión activa')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const cashRegister = await cashService.getDefaultCashRegister(tenant.id)
      if (!cashRegister) {
        throw new Error('No hay caja registrada')
      }

      await cashService.openCash(
        tenant.id,
        user.id,
        cashRegister.id,
        data.opening_amount,
        data.notes
      )

      if (navigator.vibrate) {
        navigator.vibrate(200)
      }

      reset()
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error opening cash:', err)
      setError(err instanceof Error ? err.message : 'Error al abrir la caja')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir Caja</DialogTitle>
          <DialogDescription>
            Ingresa el monto inicial con el que abres la caja
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="opening_amount">
              Monto Inicial <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="opening_amount"
                type="number"
                step="1"
                min="0"
                {...register('opening_amount', {
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
            {errors.opening_amount && (
              <p className="text-sm text-destructive">{errors.opening_amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Observaciones al abrir la caja..."
              className="min-h-[80px] resize-none"
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
              Abrir Caja
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
