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
    <div className="relative mb-5">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            variant={period === tab.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPeriodChange(tab.value)}
            className={
              `flex items-center gap-1.5 whitespace-nowrap snap-start transition-all duration-200 ${
                period === tab.value 
                  ? 'shadow-sm' 
                  : 'hover:bg-accent/50'
              }`
            }
          >
            {tab.icon}
            <span className="text-sm">{tab.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
