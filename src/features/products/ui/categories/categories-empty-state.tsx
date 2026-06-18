'use client'

import { Package } from 'lucide-react'
import { Button } from '@/shared/ui/components/button'

interface CategoriesEmptyStateProps {
  onCreateClick: () => void
}

export function CategoriesEmptyState({ onCreateClick }: CategoriesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No hay categorías</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Crea tu primera categoría para organizar mejor tus productos
      </p>
      <Button onClick={onCreateClick}>
        Nueva categoría
      </Button>
    </div>
  )
}
