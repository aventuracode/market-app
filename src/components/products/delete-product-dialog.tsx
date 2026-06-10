'use client'

import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import type { ProductWithCategory } from '@/types/product'
import { useDeleteProductMutation } from '@/hooks/queries/use-products-query'

interface DeleteProductDialogProps {
  product: ProductWithCategory | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteProductDialog({
  product,
  open,
  onOpenChange,
  onSuccess,
}: DeleteProductDialogProps) {
  const { mutateAsync: deleteProduct, isPending: loading, error, reset } = useDeleteProductMutation()
 
  const handleDelete = async () => {
    if (!product) return

    try {
      reset() // limpia error previo
      await deleteProduct(product.id)
      
      // Vibración de éxito
      if (navigator.vibrate) navigator.vibrate(200)
      
      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
         
      if (navigator.vibrate) navigator.vibrate([100, 50, 100])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle>Eliminar Producto</DialogTitle>
          </div>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar este producto?
          </DialogDescription>
        </DialogHeader>

        {product && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium">{product.name}</p>
            {product.barcode && (
              <p className="text-sm text-muted-foreground font-mono mt-1">
                {product.barcode}
              </p>
            )}
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          El producto será marcado como inactivo y no aparecerá en el POS. Esta acción se puede revertir.
        </p>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error.message}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 h-11"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 h-11 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Eliminar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
