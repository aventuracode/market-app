
// ─── use-checkout-guards.ts ─────────────────────────────────────────────────
// SRP: único responsable de validar precondiciones del checkout
import type { CartItem } from '@/stores/cart.store'
import { Tenant } from '@/types'
import { CashSession } from '@/types/cash'
import { User } from '@supabase/supabase-js'
import { useCallback } from 'react'

interface GuardDeps {
  user: User | null
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