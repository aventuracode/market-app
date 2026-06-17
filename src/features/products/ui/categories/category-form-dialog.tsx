'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { 
  createCategorySchema, 
  type CreateCategoryInput,
  type CategoryWithProductCount 
} from '@/features/products/domain/category.schema'

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: CategoryWithProductCount | null
  onSubmit: (data: CreateCategoryInput) => void
  isLoading?: boolean
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isLoading,
}: CategoryFormDialogProps) {
  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || '',
      })
    } else {
      form.reset({
        name: '',
        description: '',
      })
    }
  }, [category, form])

  const handleSubmit = (data: CreateCategoryInput) => {
    onSubmit(data)
    if (!category) {
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar categoría' : 'Nueva categoría'}
          </DialogTitle>
          <DialogDescription>
            {category
              ? 'Modifica los datos de la categoría'
              : 'Crea una nueva categoría para organizar tus productos'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Bebidas, Golosinas..."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción de la categoría..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ''}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : category ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
