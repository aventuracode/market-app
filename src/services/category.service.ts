import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types/product'
import type { CreateCategoryData, UpdateCategoryData } from '@/types/category-form'

class CategoryService {
  private supabase = createClient()

  async getCategories(tenantId: string, searchQuery?: string): Promise<Category[]> {
    let query = this.supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching categories:', error)
      throw new Error(error.message || 'Error al obtener las categorías')
    }

    return data || []
  }

  async getCategoryById(tenantId: string, categoryId: string): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', categoryId)
      .single()

    if (error) {
      console.error('Error getting category:', error)
      
      if (error.code === 'PGRST116') {
        return null
      }
      
      throw new Error(error.message || 'Error al obtener la categoría')
    }

    return data
  }

  async createCategory(categoryData: CreateCategoryData): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .insert({
        ...categoryData,
        is_active: categoryData.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      
      if (error.code === '23505') {
        throw new Error('Ya existe una categoría con este nombre')
      }
      if (error.message.includes('RLS')) {
        throw new Error('No tienes permisos para crear categorías')
      }
      
      throw new Error(error.message || 'Error al crear la categoría')
    }

    if (!data) {
      throw new Error('No se recibió respuesta del servidor')
    }

    return data
  }

  async updateCategory(
    categoryId: string,
    categoryData: UpdateCategoryData
  ): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .update(categoryData)
      .eq('id', categoryId)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      
      if (error.code === '23505') {
        throw new Error('Ya existe una categoría con este nombre')
      }
      
      throw new Error(error.message || 'Error al actualizar la categoría')
    }

    if (!data) {
      throw new Error('No se recibió respuesta del servidor')
    }

    return data
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await this.supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', categoryId)

    if (error) {
      console.error('Error deleting category:', error)
      throw new Error(error.message || 'Error al eliminar la categoría')
    }
  }

  async restoreCategory(categoryId: string): Promise<void> {
    const { error } = await this.supabase
      .from('categories')
      .update({ is_active: true })
      .eq('id', categoryId)

    if (error) {
      console.error('Error restoring category:', error)
      throw new Error(error.message || 'Error al restaurar la categoría')
    }
  }
}

export const categoryService = new CategoryService()
