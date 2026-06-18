'use client'

import { Folder, Edit, Trash2 } from 'lucide-react'
import { Card } from '@/shared/ui/components/card'
import type { CategoryWithProductCount } from '../../domain/category.schema'

interface CategoryListItemProps {
  category: CategoryWithProductCount
  onEdit?: (category: CategoryWithProductCount) => void
  onDelete?: (category: CategoryWithProductCount) => void
}

export function CategoryListItem({ category, onEdit, onDelete }: CategoryListItemProps) {
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Folder className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with Actions */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {onEdit && (
                <button
                  onClick={() => onEdit(category)}
                  className="p-2.5 hover:bg-accent rounded-lg transition-colors touch-manipulation"
                  aria-label="Editar categoría"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(category)}
                  className="p-2.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors touch-manipulation"
                  aria-label="Eliminar categoría"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
