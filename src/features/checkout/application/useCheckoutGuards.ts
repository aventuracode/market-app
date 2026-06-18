
// ─── use-checkout-guards.ts ─────────────────────────────────────────────────
// SRP: único responsable de validar precondiciones del checkout
import { CartItem } from '@/features/checkout/domain/cart.types'
import type { UserProfile, Tenant } from '@/features/auth'
import { useCallback } from 'react'
import type { CashSession } from '@/features/cash/domain/cash'

interface GuardDeps {
  user: UserProfile | null
  tenant: Tenant | null
  activeSession: CashSession | null
  items: CartItem[]
}

export function useCheckoutGuards({ user, tenant, activeSession, items }: GuardDeps) {
  const assertSessionReady = useCallback(() => {
    if (!user?.id) throw new Error('Usuario no autenticado')
    if (!tenant?.id) throw new Error('No hay tenant activo')
    if (!activeSession?.id) throw new Error('No hay una sesión de caja abierta. Por favor, abre la caja antes de realizar ventas.')
    if (items.length === 0) throw new Error('El carrito está vacío')
  }, [user, tenant, activeSession, items])

  return { assertSessionReady }
}