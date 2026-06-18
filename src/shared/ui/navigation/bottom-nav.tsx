'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/ui'
import { ShoppingCart, Package, Wallet, BarChart3, Settings } from 'lucide-react'

const navItems = [
  {
    href: '/pos',
    label: 'POS',
    icon: ShoppingCart,
    ariaLabel: 'Punto de venta',
  },
  {
    href: '/products',
    label: 'Productos',
    icon: Package,
    ariaLabel: 'Gestión de productos',
  },
  {
    href: '/cash',
    label: 'Caja',
    icon: Wallet,
    ariaLabel: 'Gestión de caja',
  },
  {
    href: '/sales',
    label: 'Ventas',
    icon: BarChart3,
    ariaLabel: 'Historial de ventas',
  },
  {
    href: '/settings',
    label: 'Config',
    icon: Settings,
    ariaLabel: 'Configuración',
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-around h-16 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1',
                'transition-all duration-200 ease-in-out',
                'active:scale-95',
                'min-w-0 px-1',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground active:text-foreground'
              )}
            >
              <div className={cn(
                'transition-transform duration-200',
                isActive && 'scale-110'
              )}>
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                'text-xs font-medium truncate w-full text-center',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
