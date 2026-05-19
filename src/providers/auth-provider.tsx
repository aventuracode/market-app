'use client'

import { useAuth } from '@/hooks/use-auth'
import { Loading } from '@/components/ui/loading'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()

  if (loading) {
    return <Loading text="Verificando sesión..." />
  }

  return <>{children}</>
}
