'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/components/button'
import { useCreateCategory } from '@/features/products/application/queries/use-categories-query'
import type { CreateCategoryInput } from '@/features/products/domain/category.schema'
import { CategoryFormDialog } from './category-form-dialog'

interface QuickCreateCategoryProps {
  onCategoryCreated?: (categoryId: string) => void
}

export function QuickCreateCategory({ onCategoryCreated }: QuickCreateCategoryProps) {
  const [open, setOpen] = useState(false)
  const createMutation = useCreateCategory()

  const handleSubmit = (data: CreateCategoryInput) => {
    createMutation.mutate(data, {
      onSuccess: (category) => {
        setOpen(false)
        onCategoryCreated?.(category.id)
      },
    })
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-12 w-12 flex-shrink-0"
        onClick={() => setOpen(true)}
        title="Nueva categoría"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <CategoryFormDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </>
  )
}
