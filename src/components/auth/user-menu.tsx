'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useTenant } from '@/hooks/use-tenant'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { LogOut, User, Store, Loader2 } from 'lucide-react'

export function UserMenu() {
  const router = useRouter()
  const { user } = useAuth()
  const { tenant } = useTenant()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authService.logout()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{user.email}</span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {tenant && (
              <>
                <Store className="w-3 h-3" />
                <span>{tenant.name}</span>
                <span>•</span>
              </>
            )}
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="h-10 w-10"
        >
          {isLoggingOut ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  )
}
