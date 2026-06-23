'use client'

import { useState } from 'react'
import { useAuthStore } from '@/features/auth'
import { useCashSessions } from '../../application/queries/use-cash-sessions-query'
import { CashSessionSummaryCards } from '../components/cash-session-summary-cards'
import { CashSessionFilters } from '../components/cash-session-filters'
import { CashSessionsTable } from '../components/cash-sessions-table'
import { CashSessionDetailDialog } from '../components/cash-session-detail-dialog'
import type { CashSession } from '../../domain/cash-session'
import type { CashSessionStatus } from '../../domain/cash-session'

export function CashSessionsPage() {
  const { user } = useAuthStore()
  const role = user?.role

  const [filters, setFilters] = useState<{
    status?: CashSessionStatus
    date?: string
  }>({
    date: new Date().toISOString().split('T')[0], // Por defecto: Hoy
  })

  const [selectedSession, setSelectedSession] = useState<CashSession | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const { data: sessions = [], isLoading } = useCashSessions(filters)

  // Filtrar por userId si es CAJERO
  const filteredSessions = role === 'CAJERO' && user?.id
    ? sessions.filter((s) => s.userId === user.id)
    : sessions

  const handleFilterChange = (newFilters: { status?: CashSessionStatus; date?: string }) => {
    setFilters(newFilters)
  }

  const handleSelectSession = (session: CashSession) => {
    setSelectedSession(session)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedSession(null)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Sesiones de Caja</h1>
        <p className="text-sm text-muted-foreground">
          {role === 'CAJERO' ? 'Tus sesiones de caja' : 'Historial de sesiones de caja'}
        </p>
      </div>

      <CashSessionSummaryCards sessions={filteredSessions} />

      <CashSessionFilters filters={filters} onChange={handleFilterChange} />

      <CashSessionsTable
        sessions={filteredSessions}
        isLoading={isLoading}
        onSelectSession={handleSelectSession}
      />

      <CashSessionDetailDialog
        session={selectedSession}
        open={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  )
}
