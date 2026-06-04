'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { cashService, CashConcurrencyError } from '@/services/cash.service'
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
import { CashRegisterSelector } from './cash-register-selector'
import { formatCurrency } from '@/lib/utils/currency'

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
  const [selectedRegisterId, setSelectedRegisterId] = useState<string>('')
  const [selectedRegisterName, setSelectedRegisterName] = useState<string>('')

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

    if (!selectedRegisterId) {
      setError('Debes seleccionar una caja registradora')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await cashService.openCash(
        tenant.id,
        user.id,
        selectedRegisterId,
        data.opening_amount,
        data.notes
      )

      // Feedback háptico
      if (navigator.vibrate) {
        navigator.vibrate(200)
      }

      // Toast de éxito
      toast.success('Caja abierta exitosamente', {
        description: `${selectedRegisterName} - Monto inicial: ${formatCurrency(data.opening_amount)}`,
      })

      // Reset y cerrar
      reset()
      setSelectedRegisterId('')
      setSelectedRegisterName('')
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('[OpenCashDialog] Error al abrir caja:', err)

      // Manejo específico de error de concurrencia
      if (err instanceof CashConcurrencyError) {
        toast.error('Caja no disponible', {
          description: err.message,
          duration: 5000,
        })
        setError(err.message)
        return
      }

      // Otros errores
      const errorMessage = err instanceof Error ? err.message : 'Error al abrir la caja'
      toast.error('Error al abrir caja', {
        description: errorMessage,
        duration: 5000,
      })
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      reset()
      setSelectedRegisterId('')
      setSelectedRegisterName('')
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-bold">Abrir Caja</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground/70">
            Selecciona la caja e ingresa el monto inicial
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Selector de Caja */}
          <CashRegisterSelector
            value={selectedRegisterId}
            onChange={(id, name) => {
              setSelectedRegisterId(id)
              setSelectedRegisterName(name)
              setError(null)
            }}
            disabled={loading}
          />

          <div className="space-y-2.5">
            <Label htmlFor="opening_amount" className="text-sm font-semibold">
              Monto Inicial <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground/50">$</span>
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
                className="h-16 pl-12 pr-4 text-3xl font-bold text-center border-2 focus:border-primary rounded-xl"
                inputMode="numeric"
                autoFocus
              />
            </div>
            {errors.opening_amount && (
              <p className="text-sm text-destructive">{errors.opening_amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-muted-foreground">Notas (opcional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Observaciones..."
              className="min-h-[60px] resize-none text-sm rounded-lg"
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 h-12 rounded-xl"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedRegisterId} 
              className="flex-1 h-12 gap-2 rounded-xl bg-primary hover:bg-primary/90 shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Abrir Caja
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
