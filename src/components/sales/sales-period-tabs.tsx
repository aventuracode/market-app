'use client'

import { Calendar, CalendarDays, CalendarRange, Infinity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SalesPeriod } from '@/types/sales'

interface SalesPeriodTabsProps {
  period: SalesPeriod
  onPeriodChange: (period: SalesPeriod) => void
}

export function SalesPeriodTabs({ period, onPeriodChange }: SalesPeriodTabsProps) {
  const tabs: { value: SalesPeriod; label: string; icon: React.ReactNode }[] = [
    { value: 'today', label: 'Hoy', icon: <Calendar className="w-4 h-4" /> },
    { value: 'week', label: 'Semana', icon: <CalendarDays className="w-4 h-4" /> },
    { value: 'month', label: 'Mes', icon: <CalendarRange className="w-4 h-4" /> },
    { value: 'all', label: 'Todas', icon: <Infinity className="w-4 h-4" /> },
  ]

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          variant={period === tab.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPeriodChange(tab.value)}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          {tab.icon}
          {tab.label}
        </Button>
      ))}
    </div>
  )
}
