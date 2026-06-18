'use client'

import { useState } from 'react'
import { useAuth } from '@/features/auth'
import { useTenant } from '@/features/auth'
import { logout } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { LogOut, User, Store, Loader2 } from 'lucide-react'

export function UserMenu() {
  const { user, loading } = useAuth()
  const { tenant } = useTenant()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setIsLoggingOut(false)
    }
  }

  // Mostrar skeleton mientras carga
  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-muted animate-pulse rounded-lg" />
            <div className="w-10 h-10 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        {/* User info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.email || 'Usuario'}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {tenant && (
                <>
                  <Store className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{tenant.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="h-10 w-10"
            aria-label="Cerrar sesión"
          >
            {isLoggingOut ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
