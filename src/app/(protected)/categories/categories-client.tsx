'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, FolderX } from 'lucide-react'
import { useCategories } from '@/features/products/application/use-categories'
import { CategoryListItem } from '@/features/products/ui/categories/category-list-item'
import { DeleteCategoryDialog } from '@/features/products/ui/categories/delete-category-dialog'
import { PageHeader } from '@/components/shared/page-header'
import { SearchBar } from '@/components/shared/search-bar'
import { Button } from '@/components/ui/button'
import { Category } from '@/types'

export function CategoriesClient() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const { categories, loading, error, total, search, refresh } = useCategories()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    search(query)
  }

  const handleEdit = (category: Category) => {
    router.push(`/categories/${category.id}/edit`)
  }

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category)
  }

  const handleDeleteSuccess = () => {
    refresh()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 space-y-4">
        <PageHeader
          title="Categorías"
          subtitle={loading ? 'Cargando...' : `${total} categoría${total !== 1 ? 's' : ''}`}
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
          loading={loading && categories.length > 0}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-3">
          {/* Error State */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Loading Initial */}
          {loading && categories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando categorías...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && categories.length === 0 && !error && (
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
      onConfirm={async () => {
        // aquí va tu lógica de borrado
        handleDeleteSuccess()
        setCategoryToDelete(null)
      }}
    />
    </div>
  )
}
