'use client'

import { useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { categoryService } from '@/services/category.service'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Category } from '@/types/product'

interface DeleteCategoryDialogProps {
  category: Category | null
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function DeleteCategoryDialog({
  category,
  open,
  onClose,
  onSuccess,
}: DeleteCategoryDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!category) return

    try {
      setLoading(true)
      setError(null)
      await categoryService.deleteCategory(category.id)
      
      if (navigator.vibrate) {
        navigator.vibrate(200)
      }
      
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error deleting category:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar la categoría')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle>Eliminar Categoría</DialogTitle>
          </div>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar la categoría{' '}
            <span className="font-semibold">{category?.name}</span>?
            <br />
            <br />
            Esta acción no se puede deshacer y los productos asociados quedarán sin
            categoría.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 sm:flex-none gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
