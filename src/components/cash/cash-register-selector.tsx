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
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Cargando cajas disponibles...</p>
            <p className="text-xs text-muted-foreground">Un momento por favor</p>
          </div>
        </div>
      </Card>
    )
  }

  // Estado de error
  if (error) {
    return (
      <Card className="p-6 border-destructive/50 bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Error al cargar cajas</p>
            <p className="text-xs text-destructive/80 mt-1">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  // Sin cajas disponibles
  if (cashRegisters.length === 0) {
    return (
      <Card className="p-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <Store className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              No hay cajas configuradas
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Contacta al administrador para configurar las cajas registradoras
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // Selector de cajas
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Seleccionar Caja
        </label>
        <Badge variant="secondary" className="text-xs">
          {cashRegisters.length} {cashRegisters.length === 1 ? 'caja' : 'cajas'} disponible{cashRegisters.length === 1 ? '' : 's'}
        </Badge>
      </div>

      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="h-12">
          <SelectValue placeholder="Selecciona una caja registradora" />
        </SelectTrigger>
        <SelectContent>
          {cashRegisters.map((register) => (
            <SelectItem
              key={register.id}
              value={register.id}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3 py-1">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{register.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Caja registradora
                  </p>
                </div>
                {value === register.id && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Check className="w-3.5 h-3.5 text-green-600" />
          <span>
            Caja seleccionada: <span className="font-medium text-foreground">
              {cashRegisters.find((r) => r.id === value)?.name}
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
