'use client'

import { Banknote, CreditCard, ArrowRightLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { PaymentMethod } from '@/schemas'

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null
  onSelect: (method: PaymentMethod) => void
}

const paymentMethods = [
  {
    id: 'CASH' as PaymentMethod,
    name: 'Efectivo',
    icon: Banknote,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  {
    id: 'CARD' as PaymentMethod,
    name: 'Tarjeta',
    icon: CreditCard,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'TRANSFER' as PaymentMethod,
    name: 'Transferencia',
    icon: ArrowRightLeft,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
]

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        Método de pago
      </label>
      <div className="grid grid-cols-3 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          const isSelected = selected === method.id

          return (
            <motion.button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all touch-target',
                isSelected
                  ? `${method.bgColor} ${method.borderColor} shadow-lg`
                  : 'bg-card border-border hover:border-muted-foreground/30'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                  isSelected ? method.bgColor : 'bg-muted'
                )}
              >
                <Icon
                  className={cn(
                    'h-6 w-6 transition-colors',
                    isSelected ? method.color : 'text-muted-foreground'
                  )}
                />
              </div>

              {/* Name */}
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  isSelected ? method.color : 'text-muted-foreground'
                )}
              >
                {method.name}
              </span>

              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selected-payment"
                  className={cn(
                    'absolute inset-0 rounded-2xl border-2',
                    method.borderColor
                  )}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
