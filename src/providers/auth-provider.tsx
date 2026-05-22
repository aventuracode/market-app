'use client'

import { useAuth } from '@/hooks/use-auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Inicializar el hook para mantener el estado sincronizado
  // pero no bloquear el renderizado - el middleware ya validó la sesión
  useAuth()

  // Renderizar inmediatamente - cada componente maneja su propio loading
  return <>{children}</>
}
