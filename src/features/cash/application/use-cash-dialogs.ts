import { useState, useCallback } from 'react'

export type CashDialogType = 'open' | 'close' | 'movement' | null

type UseCashDialogsParams = {
  onDataChange: () => void
  onMovementsChange: () => void
}

/**
 * Orquesta cuál de los 3 diálogos de caja está activo y centraliza
 * los callbacks de éxito, que siempre necesitan refrescar datos.
 *
 * Mantiene la lógica de "qué diálogo se muestra" separada de la
 * lógica de presentación (SRP) y separada de la lógica de negocio
 * de caja, que vive en use-cash-register / use-cash-movements.
 */
export function useCashDialogs({ onDataChange, onMovementsChange }: UseCashDialogsParams) {
  const [activeDialog, setActiveDialog] = useState<CashDialogType>(null)

  const openOpenDialog = useCallback(() => setActiveDialog('open'), [])
  const openCloseDialog = useCallback(() => setActiveDialog('close'), [])
  const openMovementDialog = useCallback(() => setActiveDialog('movement'), [])
  const dismiss = useCallback(() => setActiveDialog(null), [])

  const handleOpenSuccess = useCallback(() => {
    onDataChange()
    dismiss()
  }, [onDataChange, dismiss])

  const handleCloseSuccess = useCallback(() => {
    onDataChange()
    dismiss()
  }, [onDataChange, dismiss])

  const handleMovementSuccess = useCallback(() => {
    onDataChange()
    onMovementsChange()
    dismiss()
  }, [onDataChange, onMovementsChange, dismiss])

  return {
    activeDialog,
    openOpenDialog,
    openCloseDialog,
    openMovementDialog,
    dismiss,
    handleOpenSuccess,
    handleCloseSuccess,
    handleMovementSuccess,
  }
}