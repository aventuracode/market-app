'use client'

import { UserMenu } from '@/features/auth'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { cn } from '@/shared/ui'

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="flex flex-col h-screen min-h-screen bg-background">
      {/* Header con safe area top */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
        <UserMenu />
      </header>

      {/* Main content con scroll */}
      <main
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden',
          'pb-20', // Espacio para bottom nav
          className
        )}
      >
        <div className="container mx-auto max-w-7xl px-4 py-4">
          {children}
        </div>
      </main>

      {/* Bottom navigation con safe area bottom */}
      <BottomNav />
    </div>
  )
}
