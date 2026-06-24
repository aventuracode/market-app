import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select'
import { Card } from '@/shared/ui/components/card'
import type { CashSessionStatus } from '../../domain/cash-session'

interface CashSessionFiltersProps {
  filters: {
    status?: CashSessionStatus
    date?: string
  }
  onChange: (filters: { status?: CashSessionStatus; date?: string }) => void
}

type DateFilter = 'today' | 'yesterday' | 'last7days' | undefined

export function CashSessionFilters({ filters, onChange }: CashSessionFiltersProps) {
  const [statusFilter, setStatusFilter] = useState<CashSessionStatus | 'ALL'>(
    filters.status || 'ALL'
  )
  const [dateFilter, setDateFilter] = useState<DateFilter>('today')

  const handleStatusChange = (value: string) => {
    const newStatus = value === 'ALL' ? undefined : (value as CashSessionStatus)
    setStatusFilter(value as CashSessionStatus | 'ALL')
    onChange({
      ...filters,
      status: newStatus,
    })
  }

  const toLocalDateString = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const handleDateChange = (value: string) => {
    const newDateFilter = value as DateFilter
    setDateFilter(newDateFilter)

    let date: string | undefined
    const today = new Date()

    switch (newDateFilter) {
      case 'today':
        date = toLocalDateString(today)
        break
      case 'yesterday':
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        date = toLocalDateString(yesterday)
        break
      case 'last7days':
        const last7 = new Date(today)
        last7.setDate(last7.getDate() - 7)
        date = toLocalDateString(last7)
        break
      default:
        date = undefined
    }

    onChange({
      ...filters,
      date,
    })
  }

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Estado</label>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="OPEN">Abiertas</SelectItem>
              <SelectItem value="CLOSED">Cerradas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Fecha</label>
          <Select value={dateFilter || 'ALL'} onValueChange={handleDateChange}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="yesterday">Ayer</SelectItem>
              <SelectItem value="last7days">Últimos 7 días</SelectItem>
              <SelectItem value="ALL">Todas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}
