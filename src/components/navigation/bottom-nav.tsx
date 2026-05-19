'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ShoppingCart, Package, DollarSign, BarChart3, Settings } from 'lucide-react'

const navItems = [
  {
    href: '/pos',
    label: 'POS',
    icon: ShoppingCart,
  },
  {
    href: '/products',
    label: 'Productos',
    icon: Package,
  },
  {
    href: '/cash',
    label: 'Caja',
    icon: DollarSign,
  },
  {
    href: '/sales',
    label: 'Ventas',
    icon: BarChart3,
  },
  {
    href: '/settings',
    label: 'Config',
    icon: Settings,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'scale-110')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
