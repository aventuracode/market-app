'use client'

import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryCard } from '@/features/products/ui/categories/category-card'
import { CategoryFormDialog } from '@/features/products/ui/categories/category-form-dialog'
import { DeleteCategoryDialog } from '@/features/products/ui/categories/delete-category-dialog'
import { CategoriesEmptyState } from '@/features/products/ui/categories/categories-empty-state'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/features/products/application/queries/use-categories-query'
import type { CategoryWithProductCount } from '@/services/categories.service'
import type { CreateCategoryInput } from '@/features/products/domain/category.schema'

export default function CategoriesPage() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithProductCount | null>(null)

  const { data: categories, isLoading } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = () => {
    setSelectedCategory(null)
    setFormOpen(true)
  }

  const handleEdit = (category: CategoryWithProductCount) => {
    setSelectedCategory(category)
    setFormOpen(true)
  }

  const handleDelete = (category: CategoryWithProductCount) => {
    setSelectedCategory(category)
    setDeleteOpen(true)
  }

  const handleSubmit = (data: CreateCategoryInput) => {
    if (selectedCategory) {
      updateMutation.mutate(
        { id: selectedCategory.id, input: data },
        {
          onSuccess: () => {
            setFormOpen(false)
            setSelectedCategory(null)
          },
        }
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setFormOpen(false)
        },
      })
    }
  }

  const handleConfirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id, {
        onSuccess: () => {
          setDeleteOpen(false)
          setSelectedCategory(null)
        },
      })
    }
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categorías</h1>
        <p className="text-sm text-muted-foreground">
          Administra las categorías de productos
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleCreate} size="default" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva Categoría</span>
          <span className="sm:hidden">Nueva</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filteredCategories && filteredCategories.length > 0 ? (
        <div className="space-y-3">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : search ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            {`No se encontraron categorías con ${search}`}
          </p>
        </div>
      ) : (
        <CategoriesEmptyState onCreateClick={handleCreate} />
      )}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={selectedCategory}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteCategoryDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={selectedCategory}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
