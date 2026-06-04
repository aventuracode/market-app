'use client'

import { useEffect, useState } from 'react'
import { Check, Store, AlertCircle, Loader2 } from 'lucide-react'
import { cashService } from '@/services/cash.service'
import { useTenant } from '@/hooks/use-tenant'
import type { CashRegister } from '@/types/cash'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CashRegisterSelectorProps {
  value: string
  onChange: (registerId: string, registerName: string) => void
  disabled?: boolean
}

export function CashRegisterSelector({
  value,
  onChange,
  disabled = false,
}: CashRegisterSelectorProps) {
  const { tenant } = useTenant()
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCashRegisters = async () => {
      if (!tenant?.id) return

      try {
        setLoading(true)
        setError(null)
        const registers = await cashService.getAvailableCashRegisters(tenant.id)
        setCashRegisters(registers)

        // Auto-seleccionar si solo hay una caja disponible
        if (registers.length === 1 && !value) {
          onChange(registers[0].id, registers[0].name)
        }
      } catch (err) {
        console.error('Error loading cash registers:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar las cajas')
      } finally {
        setLoading(false)
      }
    }

    loadCashRegisters()
  }, [tenant?.id])

  const handleValueChange = (registerId: string) => {
    const register = cashRegisters.find((r) => r.id === registerId)
    if (register) {
      onChange(register.id, register.name)
    }
  }

  // Estado de carga
  if (loading) {
    return (
      <Card className="p-4 border-dashed">
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando cajas...</p>
        </div>
      </Card>
    )
  }

  // Estado de error
  if (error) {
    return (
      <Card className="p-4 border-destructive/50 bg-destructive/5">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Error al cargar cajas</p>
            <p className="text-xs text-destructive/70 mt-0.5">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  // Sin cajas disponibles
  if (cashRegisters.length === 0) {
    return (
      <Card className="p-4 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
        <div className="flex items-start gap-2.5">
          <Store className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              No hay cajas configuradas
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              Contacta al administrador
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // Selector de cajas
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold">
          Seleccionar Caja
        </label>
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
          {cashRegisters.length} disponible{cashRegisters.length === 1 ? '' : 's'}
        </Badge>
      </div>

      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="h-11 rounded-lg">
          <SelectValue placeholder="Selecciona una caja" />
        </SelectTrigger>
        <SelectContent>
          {cashRegisters.map((register) => (
            <SelectItem
              key={register.id}
              value={register.id}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2.5 py-0.5">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Store className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{register.name}</p>
                </div>
                {value === register.id && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value && (
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
          <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {cashRegisters.find((r) => r.id === value)?.name}
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
