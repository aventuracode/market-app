'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/components/alert-dialog'
import type { CategoryWithProductCount } from '@/features/products/domain/category.schema'

interface DeleteCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CategoryWithProductCount | null
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  onConfirm,
  isLoading,
}: DeleteCategoryDialogProps) {
  if (!category) return null

  const hasProducts = (category.product_count || 0) > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
          <AlertDialogDescription>
            {hasProducts ? (
              <>
                La categoría <strong>{category.name}</strong> tiene{' '}
                <strong>{category.product_count} producto{category.product_count !== 1 ? 's' : ''}</strong> asociado{category.product_count !== 1 ? 's' : ''}.
                <br />
                <br />
                Al eliminarla, los productos quedarán sin categoría. Esta acción no se puede deshacer.
              </>
            ) : (
              <>
                ¿Estás seguro de eliminar la categoría <strong>{category.name}</strong>?
                <br />
                Esta acción no se puede deshacer.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
