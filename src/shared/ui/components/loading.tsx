import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/ui'

interface LoadingProps {
  className?: string
  text?: string
}

export function Loading({ className, text = 'Cargando...' }: LoadingProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center',
        className
      )}
    >
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}
