import { createClient } from '@/lib/supabase/client'
import type { CategoryFormData, UpdateCategoryData } from '@/features/products/domain/category-form'
import type { Category } from '@/features/products/domain/product'
import type { CategoryWithProductCount } from '@/features/products/domain/category.schema'

class CategoryService {
  private supabase = createClient()

  async getCategories(tenantId: string, searchQuery?: string): Promise<CategoryWithProductCount[]> {
    let query = this.supabase
      .from('categories')
      .select(`
        *,
        products (count)
      `)
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

    return (data || []).map((cat: any) => ({
      ...cat,
      is_active: cat.is_active ?? true,
      created_at: cat.created_at ?? new Date().toISOString(),
      updated_at: cat.updated_at ?? new Date().toISOString(),
      product_count: cat.products?.[0]?.count || 0,
      products: undefined,
    }))
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

    if (!data) return null

    return {
      ...data,
      is_active: data.is_active ?? true,
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
    }
  }

  async createCategory(categoryData: CategoryFormData, tenantId: string): Promise<Category> {
    const { data, error } = await this.supabase 
      .from('categories')
      .insert({
        ...categoryData,
        is_active: categoryData.is_active ?? true,
        tenant_id: tenantId,
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

    return {
      ...data,
      is_active: data.is_active ?? true,
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
    }
  }

  async updateCategory(
    categoryId: string,
    categoryData: Partial<CategoryFormData>,
    tenantId: string
  ): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .update(categoryData)
      .eq('id', categoryId)
      .eq('tenant_id', tenantId)
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

    return {
      ...data,
      is_active: data.is_active ?? true,
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
    }
  }

  async deleteCategory(categoryId: string, tenantId: string): Promise<void> {
    const { error } = await this.supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', categoryId)
      .eq('tenant_id', tenantId)

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
