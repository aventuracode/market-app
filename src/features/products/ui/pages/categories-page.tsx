'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, FolderX } from 'lucide-react'
import { useCategories, useDeleteCategory } from '../../application/queries/use-categories-query'
import { CategoryListItem } from '../categories/category-list-item'
import { DeleteCategoryDialog } from '../categories/delete-category-dialog'
import { PageHeader } from '@/shared/ui/components/page-header'
import { SearchBar } from '@/shared/ui/components/search-bar'
import { Button } from '@/shared/ui/components/button'
import type { CategoryWithProductCount } from '../../domain/category.schema'

export function CategoriesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithProductCount | null>(null)
  
  const { data: categories = [], isLoading, error } = useCategories(searchQuery)
  const deleteMutation = useDeleteCategory()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleEdit = (category: CategoryWithProductCount) => {
    router.push(`/categories/${category.id}/edit`)
  }

  const handleDelete = (category: CategoryWithProductCount) => {
    setCategoryToDelete(category)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 space-y-4">
        <PageHeader
          title="Categorías"
          subtitle={isLoading ? 'Cargando...' : `${categories.length} categoría${categories.length !== 1 ? 's' : ''}`}
          action={
            <Button
              onClick={() => router.push('/categories/new')}
              size="default"
              className="gap-2 h-11 px-4"
            >
              <Plus className="w-4 h-4" />
              Nueva
            </Button>
          }
        />

        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Buscar categorías..."
          loading={isLoading && categories.length > 0}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-3">
          {/* Error State */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error instanceof Error ? error.message : 'Error al cargar categorías'}
            </div>
          )}

          {/* Loading Initial */}
          {isLoading && categories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando categorías...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && categories.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <FolderX className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-1">
                  {searchQuery ? 'No se encontraron categorías' : 'No hay categorías'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Intenta con otro término de búsqueda'
                    : 'Crea tu primera categoría para organizar tus productos'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => router.push('/categories/new')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Crear Categoría
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Categories List */}
          {categories.map((category) => (
            <CategoryListItem
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

     <DeleteCategoryDialog
      open={!!categoryToDelete}
      category={categoryToDelete}
      onOpenChange={(open) => {
        if (!open) {
          setCategoryToDelete(null)
        }
      }}
      onConfirm={() => {
        if (categoryToDelete) {
          deleteMutation.mutate(categoryToDelete.id, {
            onSuccess: () => {
              setCategoryToDelete(null)
            },
          })
        }
      }}
      isLoading={deleteMutation.isPending}
    />
    </div>
  )
}
