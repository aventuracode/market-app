'use client'

import { useState } from 'react'
import { Loader2, Plus, Minus, AlertCircle } from 'lucide-react'
import { useStockAdjustment } from '@/hooks/use-stock-adjustment'
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
import type { Product } from '@/types/product'
import type { StockMovement } from '@/types/stock'

interface StockAdjustmentDialogProps {
  product: Product | null
  open: boolean
  onClose: () => void
  onSuccess?: (movement: StockMovement) => void
}

export function StockAdjustmentDialog({
  product,
  open,
  onClose,
  onSuccess,
}: StockAdjustmentDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { form, loading, onSubmit } = useStockAdjustment({
    productId: product?.id || '',
    onSuccess: (movement) => {
      setSubmitError(null)
      if (navigator.vibrate) {
        navigator.vibrate(200)
      }
      onSuccess?.(movement)
      onClose()
    },
    onError: (error) => {
      console.error('Adjustment error:', error)
      setSubmitError(error.message)
    },
  })

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

  const operation = watch('operation')
  const type = watch('type')
  const quantity = watch('quantity')

  if (!product) return null

  const newStock =
    operation === 'increase'
      ? product.stock + (quantity || 0)
      : product.stock - (quantity || 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Stock</DialogTitle>
          <DialogDescription>
            {product.name}
            <br />
            <span className="font-semibold">Stock actual: {product.stock}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Operación */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={operation === 'increase' ? 'default' : 'outline'}
              onClick={() => setValue('operation', 'increase')}
              className="h-16 gap-2"
            >
              <Plus className="w-5 h-5" />
              Aumentar
            </Button>
            <Button
              type="button"
              variant={operation === 'decrease' ? 'default' : 'outline'}
              onClick={() => setValue('operation', 'decrease')}
              className="h-16 gap-2"
            >
              <Minus className="w-5 h-5" />
              Disminuir
            </Button>
          </div>

          {/* Tipo de Movimiento */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Movimiento</Label>
            <select
              id="type"
              {...register('type')}
              className="flex h-11 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="adjustment">Ajuste Manual</option>
              <option value="damage">Daño / Pérdida</option>
              <option value="return">Devolución</option>
              <option value="transfer">Transferencia</option>
            </select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Cantidad <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              step="1"
              min="1"
              {...register('quantity', {
                valueAsNumber: true,
                setValueAs: (v) => {
                  if (v === '' || v === null || v === undefined) return 1
                  const num = Number(v)
                  return isNaN(num) ? 1 : Math.round(Math.abs(num))
                },
              })}
              placeholder="1"
              className="h-11"
              inputMode="numeric"
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Motivo <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Describe el motivo del ajuste..."
              className="min-h-[80px] resize-none"
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {/* Preview */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nuevo Stock</p>
                <p className="text-2xl font-bold">{newStock}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Cambio</p>
                <p
                  className={`text-xl font-semibold ${
                    operation === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {operation === 'increase' ? '+' : '-'}
                  {quantity || 0}
                </p>
              </div>
            </div>
          </Card>

          {/* Error */}
          {(errors.root || submitError) && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errors.root?.message || submitError}</span>
            </div>
          )}

          {/* Botones */}
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
              Confirmar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
